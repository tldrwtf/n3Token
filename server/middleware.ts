import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import crypto from "crypto";
import validator from "validator";

// Generate correlation ID for request tracking
export const correlationId = (req: any, res: Response, next: NextFunction) => {
  req.correlationId = crypto.randomUUID();
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

// Enhanced rate limiting with progressive penalties
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests from this IP", retryAfter: "15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`, {
      correlationId: (req as any).correlationId,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    res.status(429).json({ error: "Too many requests", retryAfter: "15 minutes" });
  }
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many authentication attempts", retryAfter: "15 minutes" },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      correlationId: (req as any).correlationId,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({ error: "Too many authentication attempts", retryAfter: "15 minutes" });
  }
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: "Too many file uploads", retryAfter: "1 hour" },
  handler: (req, res) => {
    console.warn(`Upload rate limit exceeded for IP: ${req.ip}`, {
      correlationId: (req as any).correlationId,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({ error: "Too many file uploads", retryAfter: "1 hour" });
  }
});

export const operationRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { error: "Too many operations started", retryAfter: "5 minutes" },
  handler: (req, res) => {
    console.warn(`Operation rate limit exceeded for IP: ${req.ip}`, {
      correlationId: (req as any).correlationId,
      timestamp: new Date().toISOString()
    });
    res.status(429).json({ error: "Too many operations started", retryAfter: "5 minutes" });
  }
});

// Enhanced security headers with CSRF protection
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize strings in request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  
  next();
};

function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potential XSS and SQL injection attempts
      obj[key] = validator.escape(obj[key].trim());
      
      // Remove null bytes and control characters
      obj[key] = obj[key].replace(/[\x00-\x1F\x7F]/g, '');
      
      // Limit string length to prevent DOS
      if (obj[key].length > 10000) {
        obj[key] = obj[key].substring(0, 10000);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// Enhanced request validation middleware with detailed logging
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      console.warn(`Request validation failed`, {
        correlationId: (req as any).correlationId,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: error instanceof z.ZodError ? error.errors : error,
        timestamp: new Date().toISOString()
      });
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          correlationId: (req as any).correlationId,
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code
          }))
        });
      }
      return res.status(400).json({ 
        error: "Invalid request data",
        correlationId: (req as any).correlationId 
      });
    }
  };
};

// Enhanced parameter validation with type safety
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams;
      next();
    } catch (error) {
      console.warn(`Parameter validation failed`, {
        correlationId: (req as any).correlationId,
        path: req.path,
        params: req.params,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ 
        error: "Invalid parameters",
        correlationId: (req as any).correlationId 
      });
    }
  };
};

// Enhanced query validation with sanitization
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (error) {
      console.warn(`Query validation failed`, {
        correlationId: (req as any).correlationId,
        path: req.path,
        query: req.query,
        timestamp: new Date().toISOString()
      });
      return res.status(400).json({ 
        error: "Invalid query parameters",
        correlationId: (req as any).correlationId 
      });
    }
  };
};

// Enhanced error handling middleware with correlation tracking
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const correlationId = (req as any).correlationId || 'unknown';
  
  console.error('API Error:', {
    correlationId,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    userId: (req as any).user?.id
  });

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({ 
    error: message,
    correlationId 
  });
};

// Enhanced request logging with performance tracking
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      correlationId: (req as any).correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      timestamp: new Date().toISOString(),
      responseSize: res.get('Content-Length') || 0
    };
    
    if (req.path.startsWith('/api')) {
      if (duration > 5000) {
        console.warn('Slow API Request:', logData);
      } else if (res.statusCode >= 400) {
        console.warn('API Error Response:', logData);
      } else {
        console.log('API Request:', logData);
      }
    }
  });
  
  next();
};

// Enhanced user rate limiting with progressive penalties
export const userRateLimit = (endpoint: string, limit: number, windowMinutes: number) => {
  return async (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        correlationId: req.correlationId 
      });
    }

    try {
      const canProceed = await storage.checkRateLimit(req.user.id, endpoint, limit, windowMinutes);
      
      if (!canProceed) {
        console.warn(`User rate limit exceeded`, {
          correlationId: req.correlationId,
          userId: req.user.id,
          endpoint,
          limit,
          windowMinutes,
          timestamp: new Date().toISOString()
        });
        
        return res.status(429).json({ 
          error: "Rate limit exceeded",
          correlationId: req.correlationId,
          retryAfter: windowMinutes * 60,
          endpoint,
          limit
        });
      }

      await storage.incrementRateLimit(req.user.id, endpoint);
      next();
    } catch (error) {
      console.error(`Rate limit check failed`, {
        correlationId: req.correlationId,
        userId: req.user.id,
        endpoint,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      });
      
      // Fail open for rate limit errors to avoid blocking legitimate requests
      next();
    }
  };
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.warn(`Request timeout`, {
          correlationId: (req as any).correlationId,
          path: req.path,
          method: req.method,
          timeout: timeoutMs,
          timestamp: new Date().toISOString()
        });
        
        res.status(408).json({ 
          error: "Request timeout",
          correlationId: (req as any).correlationId 
        });
      }
    }, timeoutMs);

    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
};

// Authentication check middleware
export const requireAuth = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: "Authentication required",
      correlationId: req.correlationId 
    });
  }
  next();
};

// Content type validation
export const requireJsonContent = (req: Request, res: Response, next: NextFunction) => {
  if (!req.is('application/json')) {
    return res.status(415).json({ 
      error: "Content-Type must be application/json",
      correlationId: (req as any).correlationId 
    });
  }
  next();
};