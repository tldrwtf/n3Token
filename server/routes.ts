import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { twitchApi } from "./services/twitchApi";
import { insertProxySchema, insertTokenSchema, insertOperationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { setupAuth, isAuthenticated } from "./auth";
import fs from "fs";
import path from "path";

const upload = multer({ dest: 'uploads/' });

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: any;
}
import { isAuthenticated } from "./auth";
import { 
  generalRateLimit, 
  securityHeaders, 
  errorHandler, 
  requestLogger,
  correlationId,
  sanitizeInput,
  requestTimeout,
  requireAuth
} from "./middleware";

// Import route modules
import proxiesRouter from "./routes/proxies";
import tokensRouter from "./routes/tokens";
import operationsRouter from "./routes/operations";
import uploadRouter from "./routes/upload";


export async function registerRoutes(app: Express): Promise<Server> {
  // Apply core security middleware first
  app.use(correlationId);
  app.use(securityHeaders);
  app.use(requestTimeout(30000)); // 30 second timeout
  app.use(requestLogger);
  app.use(sanitizeInput);
  app.use(generalRateLimit);

  // Health check endpoint (no auth required)
  app.get('/health', (req: any, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      correlationId: req.correlationId
    });
  });

  // Enhanced auth routes with security
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ 
          error: "User not found",
          correlationId: req.correlationId
        });
      }
      
      // Return safe user data (no sensitive information)
      const { passwordHash, ...safeUser } = user;
      res.json({
        ...safeUser,
        correlationId: req.correlationId,
        lastLoginAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching user:", {
        error: error instanceof Error ? error.message : error,
        correlationId: req.correlationId,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ 
        error: "Failed to fetch user",
        correlationId: req.correlationId
      });
    }
  });

  // Mount route modules
  app.use("/api/proxies", proxiesRouter);
  app.use("/api/tokens", tokensRouter);
  app.use("/api/operations", operationsRouter);
  app.use("/api/upload", uploadRouter);
  
  // Export routes (mount upload router for export endpoints)
  app.use("/api/export", uploadRouter);

  // 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  app.get("/api/export/tokens", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      let tokens;
      
      if (status) {
        tokens = await storage.getTokensByStatus(status as string, userId);
      } else {
        tokens = await storage.getTokens(userId);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="tokens.csv"');
      
      const csv = tokens.map(token => 
        `${token.token}${token.username ? `,${token.username}` : ''}`
      ).join('\n');
      
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export tokens" });
    }
  });

  // File upload routes
  app.post("/api/upload/proxies", isAuthenticated, upload.single('file'), async (req: any, res) => {
    let filePath: string | null = null;

    try {
      const userId = req.user.id;
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      filePath = req.file.path;
      if (!filePath) {
        return res.status(400).json({ error: "Invalid file path" });
      }

      // Validate file exists and is readable
      if (!fs.existsSync(filePath)) {
        return res.status(400).json({ error: "Uploaded file not found" });
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter((line: string) => line.trim());

      if (lines.length === 0) {
        return res.status(400).json({ error: "File is empty or contains no valid proxy entries" });
      }

      const proxies = [];
      const errors = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(':');
        if (parts.length < 2) {
          errors.push(`Line ${i + 1}: Invalid format. Expected host:port[:username:password]`);
          continue;
        }

        const host = parts[0].trim();
        const portStr = parts[1].trim();
        const username = parts[2]?.trim() || null;
        const password = parts[3]?.trim() || null;

        if (!host) {
          errors.push(`Line ${i + 1}: Host is required`);
          continue;
        }

        const port = parseInt(portStr, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          errors.push(`Line ${i + 1}: Invalid port number: ${portStr}`);
          continue;
        }

        proxies.push({
          userId,
          host,
          port,
          username,
          password,
          status: "unchecked" as const,
          responseTime: null,
          failureCount: 0,
        });
      }

      if (proxies.length === 0) {
        return res.status(400).json({
          error: "No valid proxies found in file",
          details: errors.slice(0, 10) // Show first 10 errors
        });
      }

      // Validate proxies against schema before inserting
      const validatedProxies = proxies.map(proxy => {
        try {
          return insertProxySchema.parse(proxy);
        } catch (validationError) {
          throw new Error(`Proxy validation failed: ${validationError}`);
        }
      });

      const createdProxies = await storage.createProxies(validatedProxies);

      res.json({
        success: true,
        count: createdProxies.length,
        proxies: createdProxies,
        ...(errors.length > 0 && { warnings: errors.slice(0, 5) }) // Show first 5 warnings
      });

    } catch (error) {
      console.error("Error processing proxy file:", error);
      res.status(500).json({
        error: "Failed to process proxy file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      // Clean up uploaded file
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error("Failed to clean up uploaded file:", cleanupError);
        }
      }
    }
  });

  app.post("/api/upload/tokens", isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fs = require('fs');
      const content = fs.readFileSync(req.file.path, 'utf8');
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      const tokens = lines.map((line: string) => {
        const parts = line.trim().split(',');
        const token = parts[0];
        const username = parts[1] || null;
        
        if (!token) return null;
        
        return {
          userId,
          token: token.startsWith('oauth:') ? token : `oauth:${token}`,
          username,
          status: "unchecked" as const,
          loginCredentials: null,
        };
      }).filter((token: any) => token !== null);

      const createdTokens = await storage.createTokens(tokens);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(createdTokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to process token file" });
    }
  });

  // Background operation functions
  async function validateProxiesInBackground(operationId: number, userId: string) {
    const proxies = await storage.getProxies(userId);
    const total = proxies.length;
    
    await storage.updateOperation(operationId, userId, { total, progress: 0 });
    
    let processed = 0;
    const results = { valid: 0, invalid: 0, errors: [] as string[] };
    
    for (const proxy of proxies) {
      try {
        const result = await twitchApi.testProxy({
          host: proxy.host,
          port: proxy.port,
          username: proxy.username || undefined,
          password: proxy.password || undefined,
        }, userId);

        await storage.updateProxy(proxy.id, userId, {
          status: result.valid ? "valid" : "invalid",
          responseTime: result.responseTime,
          lastChecked: new Date(),
        });

        if (result.valid) {
          results.valid++;
        } else {
          results.invalid++;
        }
      } catch (error) {
        results.errors.push(`Proxy ${proxy.host}:${proxy.port} - ${error}`);
      }
      
      processed++;
      await storage.updateOperation(operationId, userId, { progress: processed });
    }
    
    await storage.updateOperation(operationId, userId, {
      status: "completed",
      completedAt: new Date(),
      results: JSON.stringify(results),
    });
  }

  async function validateTokensInBackground(operationId: number, userId: string) {
    const tokens = await storage.getTokens(userId);
    const total = tokens.length;
    
    await storage.updateOperation(operationId, userId, { total, progress: 0 });
    
    let processed = 0;
    const results = { valid: 0, invalid: 0, expired: 0, errors: [] as string[] };
    
    for (const token of tokens) {
      try {
        const result = await twitchApi.validateToken(token.token, userId);
        
        let status = "invalid";
        let userDetails = {};

        if (result.valid) {
          status = "valid";
          
          // Get full user details
          const userInfo = await twitchApi.getUserByToken(token.token, userId);
          if (!userInfo.error) {
            userDetails = {
              username: userInfo.username,
              displayName: userInfo.displayName,
              description: userInfo.description,
              profileImageUrl: userInfo.profileImageUrl,
              accountCreatedAt: userInfo.createdAt ? new Date(userInfo.createdAt) : undefined,
            };
          }
          
          if (result.expiresIn) {
            userDetails = {
              ...userDetails,
              expiresAt: new Date(Date.now() + result.expiresIn * 1000),
            };
            if (result.expiresIn < 86400) { // Less than 24 hours
              status = "expired";
            }
          }
        }

        await storage.updateToken(token.id, userId, {
          status,
          ...userDetails,
          lastChecked: new Date(),
        });

        if (status === "valid") {
          results.valid++;
        } else if (status === "expired") {
          results.expired++;
        } else {
          results.invalid++;
        }
      } catch (error) {
        results.errors.push(`Token ${token.token.substring(0, 20)}... - ${error}`);
      }
      
      processed++;
      await storage.updateOperation(operationId, userId, { progress: processed });
    }
    
    await storage.updateOperation(operationId, userId, {
      status: "completed",
      completedAt: new Date(),
      results: JSON.stringify(results),
    });
  }

  async function usernameLookupInBackground(operationId: number, userId: string) {
    const tokens = await storage.getTokensByStatus("valid", userId);
    const total = tokens.length;
    
    await storage.updateOperation(operationId, userId, { total, progress: 0 });
    
    let processed = 0;
    const results = { resolved: 0, failed: 0, errors: [] as string[] };
    
    for (const token of tokens) {
      if (token.username) {
        processed++;
        await storage.updateOperation(operationId, userId, { progress: processed });
        continue;
      }
      
      try {
        const result = await twitchApi.getUserByToken(token.token, userId);
        
        if (!result.error) {
          await storage.updateToken(token.id, userId, { 
            username: result.username,
            displayName: result.displayName,
            description: result.description,
            profileImageUrl: result.profileImageUrl,
            accountCreatedAt: result.createdAt ? new Date(result.createdAt) : undefined,
          });
          results.resolved++;
        } else {
          results.failed++;
          results.errors.push(`Token ${token.token.substring(0, 20)}... - ${result.error}`);
        }
      } catch (error) {
        results.errors.push(`Token ${token.token.substring(0, 20)}... - ${error}`);
        results.failed++;
      }
      
      processed++;
      await storage.updateOperation(operationId, userId, { progress: processed });
    }
    
    await storage.updateOperation(operationId, userId, {
      status: "completed",
      completedAt: new Date(),
      results: JSON.stringify(results),
    });
  }
  // Global error handler (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
