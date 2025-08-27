import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

  // Global error handler (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
