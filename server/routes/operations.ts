import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { userRateLimit, operationRateLimit } from "../middleware";
import { twitchApi } from "../services/twitchApi";

const router = Router();

// Apply authentication to all operation routes
router.use(isAuthenticated);

// POST /api/operations/validate-proxies - Start proxy validation
router.post("/validate-proxies", 
  operationRateLimit,
  userRateLimit("validate_proxies", 3, 30), // 3 per 30 minutes
  async (req: any, res) => {
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
      res.status(202).json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start proxy validation" });
    }
  }
);

// POST /api/operations/validate-tokens - Start token validation
router.post("/validate-tokens",
  operationRateLimit,
  userRateLimit("validate_tokens", 3, 30), // 3 per 30 minutes
  async (req: any, res) => {
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
      res.status(202).json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start token validation" });
    }
  }
);

// POST /api/operations/username-lookup - Start username lookup
router.post("/username-lookup",
  operationRateLimit,
  userRateLimit("username_lookup", 3, 30), // 3 per 30 minutes
  async (req: any, res) => {
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
      res.status(202).json(operation);
    } catch (error) {
      res.status(500).json({ error: "Failed to start username lookup" });
    }
  }
);

// GET /api/operations/active - Get active operation
router.get("/active", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const operation = await storage.getActiveOperation(userId);
    res.json(operation || null);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active operation" });
  }
});

// GET /api/operations - Get operation history
router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.id;
    const operations = await storage.getOperations(userId);
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch operations" });
  }
});

// Background operation functions
async function validateProxiesInBackground(operationId: number, userId: string) {
  try {
    const proxies = await storage.getProxies(userId);
    const total = proxies.length;
    
    await storage.updateOperation(operationId, userId, { total });
    
    let processed = 0;
    const results = { valid: 0, invalid: 0, errors: [] as string[] };
    
    for (const proxy of proxies) {
      try {
        // Simulate proxy validation (replace with actual logic)
        const isValid = Math.random() > 0.3; // 70% success rate
        const responseTime = Math.floor(Math.random() * 1000) + 100;
        
        await storage.updateProxy(proxy.id, userId, {
          status: isValid ? "valid" : "invalid",
          responseTime,
          lastChecked: new Date()
        });
        
        if (isValid) results.valid++;
        else results.invalid++;
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
  } catch (error) {
    await storage.updateOperation(operationId, userId, {
      status: "failed",
      completedAt: new Date(),
      results: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    });
  }
}

async function validateTokensInBackground(operationId: number, userId: string) {
  try {
    const tokens = await storage.getTokens(userId);
    const total = tokens.length;
    
    await storage.updateOperation(operationId, userId, { total });
    
    let processed = 0;
    const results = { valid: 0, invalid: 0, expired: 0, errors: [] as string[] };
    
    for (const token of tokens) {
      try {
        const proxy = await storage.getNextValidProxy(userId);
        if (!proxy) {
          results.errors.push("No valid proxies available");
          break;
        }
        
        const result = await twitchApi.validateToken(token.token, userId);
        const userDetails = await twitchApi.getUserByToken(token.token, userId);
        
        let status = result.valid ? "valid" : "invalid";
        let tokenUpdate = {};
        
        if (result.valid && !userDetails.error) {
          tokenUpdate = {
            username: userDetails.username,
            displayName: userDetails.displayName || userDetails.username,
            profileImageUrl: userDetails.profileImageUrl,
            accountCreatedAt: userDetails.createdAt ? new Date(userDetails.createdAt) : undefined,
          };
        }
        
        if (result.expiresIn) {
          tokenUpdate = {
            ...tokenUpdate,
            expiresAt: new Date(Date.now() + result.expiresIn * 1000),
          };
          if (result.expiresIn < 86400) { // Less than 24 hours
            status = "expired";
          }
        }
        
        await storage.updateToken(token.id, userId, {
          status,
          ...tokenUpdate,
          lastChecked: new Date(),
        });
        
        if (status === "valid") results.valid++;
        else if (status === "expired") results.expired++;
        else results.invalid++;
        
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
  } catch (error) {
    await storage.updateOperation(operationId, userId, {
      status: "failed",
      completedAt: new Date(),
      results: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    });
  }
}

async function usernameLookupInBackground(operationId: number, userId: string) {
  try {
    const tokens = await storage.getTokens(userId);
    const validTokens = tokens.filter(t => t.status === "valid");
    const total = validTokens.length;
    
    await storage.updateOperation(operationId, userId, { total });
    
    let processed = 0;
    const results = { found: 0, notFound: 0, errors: [] as string[] };
    
    for (const token of validTokens) {
      try {
        const userDetails = await twitchApi.getUserByToken(token.token, userId);
        
        if (!userDetails.error && userDetails.username) {
          await storage.updateToken(token.id, userId, {
            username: userDetails.username,
            displayName: userDetails.displayName || userDetails.username,
            description: userDetails.description,
            profileImageUrl: userDetails.profileImageUrl,
            accountCreatedAt: userDetails.createdAt ? new Date(userDetails.createdAt) : undefined,
          });
          results.found++;
        } else {
          results.notFound++;
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
  } catch (error) {
    await storage.updateOperation(operationId, userId, {
      status: "failed",
      completedAt: new Date(),
      results: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
    });
  }
}

export default router;
