import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { twitchApi } from "./services/twitchApi";
import { insertProxySchema, insertTokenSchema, insertOperationSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { setupAuth, isAuthenticated } from "./auth";

const upload = multer({ dest: 'uploads/' });

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Proxy routes
  app.get("/api/proxies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const proxies = await storage.getProxies(userId);
      res.json(proxies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proxies" });
    }
  });

  app.post("/api/proxies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const proxyData = insertProxySchema.parse(req.body);
      const proxy = await storage.createProxy({ ...proxyData, userId });
      res.json(proxy);
    } catch (error) {
      res.status(400).json({ error: "Invalid proxy data" });
    }
  });

  app.post("/api/proxies/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { proxies } = req.body;
      const validatedProxies = proxies.map((proxy: any) => ({
        ...insertProxySchema.parse(proxy),
        userId
      }));
      const createdProxies = await storage.createProxies(validatedProxies);
      res.json(createdProxies);
    } catch (error) {
      res.status(400).json({ error: "Invalid proxy data" });
    }
  });

  app.put("/api/proxies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const updates = req.body;
      const proxy = await storage.updateProxy(id, userId, updates);
      if (!proxy) {
        return res.status(404).json({ error: "Proxy not found" });
      }
      res.json(proxy);
    } catch (error) {
      res.status(400).json({ error: "Failed to update proxy" });
    }
  });

  app.delete("/api/proxies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const success = await storage.deleteProxy(id, userId);
      if (!success) {
        return res.status(404).json({ error: "Proxy not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete proxy" });
    }
  });

  app.post("/api/proxies/:id/test", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const proxies = await storage.getProxies(userId);
      const proxy = proxies.find(p => p.id === id);
      
      if (!proxy) {
        return res.status(404).json({ error: "Proxy not found" });
      }

      await storage.updateProxy(id, userId, { status: "checking", lastChecked: new Date() });
      
      const result = await twitchApi.testProxy({
        host: proxy.host,
        port: proxy.port,
        username: proxy.username || undefined,
        password: proxy.password || undefined,
      }, userId);

      const updatedProxy = await storage.updateProxy(id, userId, {
        status: result.valid ? "valid" : "invalid",
        responseTime: result.responseTime,
        lastChecked: new Date(),
      });

      res.json(updatedProxy);
    } catch (error) {
      res.status(500).json({ error: "Failed to test proxy" });
    }
  });

  // Token routes
  app.get("/api/tokens", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tokens = await storage.getTokens(userId);
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  });

  app.post("/api/tokens", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tokenData = insertTokenSchema.parse(req.body);
      const token = await storage.createToken({ ...tokenData, userId });
      res.json(token);
    } catch (error) {
      res.status(400).json({ error: "Invalid token data" });
    }
  });

  app.post("/api/tokens/bulk", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { tokens } = req.body;
      const validatedTokens = tokens.map((token: any) => ({
        ...insertTokenSchema.parse(token),
        userId
      }));
      const createdTokens = await storage.createTokens(validatedTokens);
      res.json(createdTokens);
    } catch (error) {
      res.status(400).json({ error: "Invalid token data" });
    }
  });

  app.put("/api/tokens/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const updates = req.body;
      const token = await storage.updateToken(id, userId, updates);
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json(token);
    } catch (error) {
      res.status(400).json({ error: "Failed to update token" });
    }
  });

  app.delete("/api/tokens/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const success = await storage.deleteToken(id, userId);
      if (!success) {
        return res.status(404).json({ error: "Token not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete token" });
    }
  });

  app.post("/api/tokens/:id/validate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id);
      const tokens = await storage.getTokens(userId);
      const token = tokens.find(t => t.id === id);
      
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }

      await storage.updateToken(id, userId, { status: "checking", lastChecked: new Date() });
      
      const result = await twitchApi.validateToken(token.token, userId);
      
      let status = "invalid";
      let username = token.username;
      let expiresAt = token.expiresAt;
      let userDetails = {};

      if (result.valid) {
        status = "valid";
        username = result.username || username;
        if (result.expiresIn) {
          expiresAt = new Date(Date.now() + result.expiresIn * 1000);
        }
        
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
      }

      const updatedToken = await storage.updateToken(id, userId, {
        status,
        ...userDetails,
        expiresAt,
        lastChecked: new Date(),
      });

      res.json(updatedToken);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate token" });
    }
  });

  // Bulk operations
  app.post("/api/operations/validate-proxies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const operation = await storage.createOperation({
        userId,
        type: "validate_proxies",
        status: "running",
        progress: 0,
        total: 0,
        results: null,
      });

      // Start validation in background
      validateProxiesInBackground(operation.id, userId);

      res.json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start proxy validation" });
    }
  });

  app.post("/api/operations/validate-tokens", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const operation = await storage.createOperation({
        userId,
        type: "validate_tokens",
        status: "running",
        progress: 0,
        total: 0,
        results: null,
      });

      // Start validation in background
      validateTokensInBackground(operation.id, userId);

      res.json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start token validation" });
    }
  });

  app.post("/api/operations/username-lookup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const operation = await storage.createOperation({
        userId,
        type: "username_lookup",
        status: "running",
        progress: 0,
        total: 0,
        results: null,
      });

      // Start lookup in background
      usernameLookupInBackground(operation.id, userId);

      res.json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start username lookup" });
    }
  });

  app.get("/api/operations/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const operation = await storage.getActiveOperation(userId);
      res.json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active operation" });
    }
  });

  app.get("/api/operations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const operations = await storage.getOperations(userId);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch operations" });
    }
  });

  // Export routes
  app.get("/api/export/proxies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      let proxies;
      
      if (status) {
        proxies = await storage.getProxiesByStatus(status as string, userId);
      } else {
        proxies = await storage.getProxies(userId);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="proxies.csv"');
      
      const csv = proxies.map(proxy => 
        `${proxy.host}:${proxy.port}${proxy.username ? `:${proxy.username}:${proxy.password}` : ''}`
      ).join('\n');
      
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export proxies" });
    }
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
    try {
      const userId = req.user.id;
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fs = require('fs');
      const content = fs.readFileSync(req.file.path, 'utf8');
      const lines = content.split('\n').filter((line: string) => line.trim());
      
      const proxies = lines.map((line: string) => {
        const parts = line.trim().split(':');
        if (parts.length < 2) return null;
        
        return {
          userId,
          host: parts[0],
          port: parseInt(parts[1]),
          username: parts[2] || null,
          password: parts[3] || null,
          status: "unchecked" as const,
          responseTime: null,
          failureCount: 0,
        };
      }).filter((proxy: any) => proxy !== null);

      const createdProxies = await storage.createProxies(proxies);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(createdProxies);
    } catch (error) {
      res.status(500).json({ error: "Failed to process proxy file" });
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

  const httpServer = createServer(app);
  return httpServer;
}
