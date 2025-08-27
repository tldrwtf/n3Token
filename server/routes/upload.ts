import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { validateQuery, userRateLimit, uploadRateLimit } from "../middleware";
import { exportQuerySchema, validateFileUpload } from "../validation";
import multer from "multer";
import fs from "fs";
import { z } from "zod";

const router = Router();
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Apply authentication to all routes
router.use(isAuthenticated);

// GET /api/export/proxies OR /api/upload/proxies (for export) - Export proxies
router.get(["/proxies", "/export/proxies"], 
  validateQuery(exportQuerySchema),
  userRateLimit("export", 10, 60), // 10 exports per hour
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status, format } = req.query;
      
      let proxies;
      if (status) {
        proxies = await storage.getProxiesByStatus(status, userId);
      } else {
        proxies = await storage.getProxies(userId);
      }
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="proxies.json"');
        res.json(proxies);
      } else {
        // CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="proxies.csv"');
        
        const csv = proxies.map(proxy => {
          const auth = proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@` : '';
          return `${auth}${proxy.host}:${proxy.port}`;
        }).join('\n');
        
        res.send(csv);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to export proxies" });
    }
  }
);

// GET /api/export/tokens OR /api/upload/tokens (for export) - Export tokens
router.get(["/tokens", "/export/tokens"], 
  validateQuery(exportQuerySchema),
  userRateLimit("export", 10, 60), // 10 exports per hour
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status, format } = req.query;
      
      let tokens;
      if (status) {
        tokens = await storage.getTokensByStatus(status, userId);
      } else {
        tokens = await storage.getTokens(userId);
      }
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="tokens.json"');
        res.json(tokens);
      } else {
        // CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="tokens.csv"');
        
        const csv = tokens.map(token => 
          `${token.token}${token.username ? `,${token.username}` : ''}`
        ).join('\n');
        
        res.send(csv);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to export tokens" });
    }
  }
);

// POST /api/upload/proxies - Upload proxy file
router.post("/proxies", 
  uploadRateLimit,
  upload.single('file'),
  validateFileUpload(['text/plain', 'text/csv', 'application/octet-stream']),
  userRateLimit("upload", 5, 60), // 5 uploads per hour
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      const proxies = lines.map((line: string) => {
        const trimmed = line.trim();
        
        // Parse different proxy formats
        let host: string, port: number, username: string | undefined, password: string | undefined;
        
        if (trimmed.includes('@')) {
          // Format: user:pass@host:port
          const [auth, hostPort] = trimmed.split('@');
          const [user, pass] = auth.split(':');
          const [h, p] = hostPort.split(':');
          
          host = h;
          port = parseInt(p);
          username = user;
          password = pass;
        } else {
          // Format: host:port or host:port:user:pass
          const parts = trimmed.split(':');
          if (parts.length >= 2) {
            host = parts[0];
            port = parseInt(parts[1]);
            if (parts.length >= 4) {
              username = parts[2];
              password = parts[3];
            }
          } else {
            return null;
          }
        }
        
        // Validate parsed data
        if (!host || isNaN(port) || port < 1 || port > 65535) {
          return null;
        }
        
        return {
          userId,
          host,
          port,
          username: username || null,
          password: password || null,
          status: "unchecked" as const
        };
      }).filter((proxy: any): proxy is NonNullable<typeof proxy> => proxy !== null);
      
      if (proxies.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "No valid proxies found in file" });
      }
      
      const createdProxies = await storage.createProxies(proxies);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.status(201).json({ 
        message: `Successfully imported ${createdProxies.length} proxies`,
        data: createdProxies 
      });
    } catch (error) {
      // Clean up file on error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          // File cleanup error, log but don't throw
          console.error('Failed to cleanup uploaded file:', e);
        }
      }
      res.status(500).json({ error: "Failed to process proxy file" });
    }
  }
);

// POST /api/upload/tokens - Upload token file
router.post("/tokens", 
  uploadRateLimit,
  upload.single('file'),
  validateFileUpload(['text/plain', 'text/csv', 'application/octet-stream']),
  userRateLimit("upload", 5, 60), // 5 uploads per hour
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      const tokens = lines.map((line: string) => {
        const parts = line.trim().split(',');
        const tokenValue = parts[0]?.trim();
        
        if (!tokenValue || tokenValue.length < 10) {
          return null;
        }
        
        return {
          userId,
          token: tokenValue,
          username: parts[1]?.trim() || null,
          displayName: null,
          description: null,
          profileImageUrl: null,
          accountCreatedAt: null,
          status: "unchecked" as const,
          loginCredentials: null,
        };
      }).filter((token: any): token is NonNullable<typeof token> => token !== null);
      
      if (tokens.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "No valid tokens found in file" });
      }
      
      const createdTokens = await storage.createTokens(tokens);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.status(201).json({ 
        message: `Successfully imported ${createdTokens.length} tokens`,
        data: createdTokens 
      });
    } catch (error) {
      // Clean up file on error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          // File cleanup error, log but don't throw
          console.error('Failed to cleanup uploaded file:', e);
        }
      }
      res.status(500).json({ error: "Failed to process token file" });
    }
  }
);

export default router;
