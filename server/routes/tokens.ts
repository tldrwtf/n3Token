import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { validateRequest, validateParams, validateQuery, userRateLimit } from "../middleware";
import { 
  idParamSchema, 
  createTokenSchema, 
  updateTokenSchema, 
  bulkTokensSchema,
  paginationSchema,
  statusFilterSchema
} from "../validation";
import { twitchApi } from "../services/twitchApi";

const router = Router();

// Apply authentication to all token routes
router.use(isAuthenticated);

// GET /api/tokens - List tokens with pagination and filtering
router.get("/", 
  validateQuery(paginationSchema.merge(statusFilterSchema)),
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { page, limit, offset, status } = req.query;
      
      let tokens;
      if (status) {
        tokens = await storage.getTokensByStatus(status, userId);
      } else {
        tokens = await storage.getTokens(userId);
      }
      
      // Apply pagination
      const total = tokens.length;
      const paginatedTokens = tokens.slice(offset, offset + limit);
      
      res.json({
        data: paginatedTokens,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tokens" });
    }
  }
);

// POST /api/tokens - Create single token
router.post("/",
  validateRequest(createTokenSchema),
  userRateLimit("create_token", 50, 15), // 50 per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const token = await storage.createToken({ 
        ...req.body, 
        userId,
        status: "unchecked" 
      });
      res.status(201).json(token);
    } catch (error) {
      res.status(400).json({ error: "Failed to create token" });
    }
  }
);

// POST /api/tokens/bulk - Create multiple tokens
router.post("/bulk",
  validateRequest(bulkTokensSchema),
  userRateLimit("bulk_create_token", 5, 60), // 5 per hour
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { tokens } = req.body;
      const validatedTokens = tokens.map((token: any) => ({ 
        ...token, 
        userId,
        status: "unchecked" 
      }));
      const createdTokens = await storage.createTokens(validatedTokens);
      res.status(201).json({ 
        message: `Created ${createdTokens.length} tokens`,
        data: createdTokens 
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create tokens" });
    }
  }
);

// GET /api/tokens/:id - Get single token
router.get("/:id",
  validateParams(idParamSchema),
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const tokens = await storage.getTokens(userId);
      const token = tokens.find(t => t.id === id);
      
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      res.json(token);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch token" });
    }
  }
);

// PUT /api/tokens/:id - Update token
router.put("/:id",
  validateParams(idParamSchema),
  validateRequest(updateTokenSchema),
  userRateLimit("update_token", 100, 15), // 100 per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const token = await storage.updateToken(id, userId, req.body);
      
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      res.json(token);
    } catch (error) {
      res.status(400).json({ error: "Failed to update token" });
    }
  }
);

// DELETE /api/tokens/:id - Delete token
router.delete("/:id",
  validateParams(idParamSchema),
  userRateLimit("delete_token", 100, 15), // 100 per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const success = await storage.deleteToken(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete token" });
    }
  }
);

// POST /api/tokens/:id/validate - Validate single token
router.post("/:id/validate",
  validateParams(idParamSchema),
  userRateLimit("validate_token", 10, 5), // 10 per 5 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const tokens = await storage.getTokens(userId);
      const token = tokens.find(t => t.id === id);
      
      if (!token) {
        return res.status(404).json({ error: "Token not found" });
      }
      
      // Get next available proxy
      const proxy = await storage.getNextValidProxy(userId);
      if (!proxy) {
        return res.status(400).json({ error: "No valid proxies available" });
      }
      
      // Validate token with Twitch API
      const result = await twitchApi.validateToken(token.token, userId);
      const userDetails = await twitchApi.getUserByToken(token.token, userId);
      
      let status = result.valid ? "valid" : "invalid";
      let tokenUpdate = {};
      let expiresAt = null;
      
      if (result.valid && !userDetails.error) {
        tokenUpdate = {
          username: userDetails.username,
          displayName: userDetails.displayName || userDetails.username,
          profileImageUrl: userDetails.profileImageUrl,
          accountCreatedAt: userDetails.createdAt ? new Date(userDetails.createdAt) : undefined,
        };
      }
      
      if (result.expiresIn) {
        expiresAt = new Date(Date.now() + result.expiresIn * 1000);
        if (result.expiresIn < 86400) { // Less than 24 hours
          status = "expired";
        }
      }
      
      const updatedToken = await storage.updateToken(id, userId, {
        status,
        ...tokenUpdate,
        expiresAt,
        lastChecked: new Date(),
      });
      
      res.json(updatedToken);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate token" });
    }
  }
);

export default router;
