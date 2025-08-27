import { Router } from "express";
import { storage } from "../storage";
import { requireAuth, validateRequest, validateParams, validateQuery, userRateLimit } from "../middleware";
import { 
  idParamSchema, 
  createProxySchema, 
  updateProxySchema, 
  bulkProxiesSchema,
  paginationSchema,
  statusFilterSchema,
  searchQuerySchema
} from "../validation";

const router = Router();

// Apply authentication and rate limiting to all proxy routes
router.use(requireAuth);

// GET /api/proxies - List proxies with enhanced security and pagination
router.get("/", 
  userRateLimit('list_proxies', 60, 1), // 60 requests per minute
  validateQuery(paginationSchema.merge(statusFilterSchema)),
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { page, limit, offset, status } = req.query;
      
      console.log('Proxy list request:', {
        correlationId: req.correlationId,
        userId,
        status,
        page,
        limit,
        timestamp: new Date().toISOString()
      });
      
      let proxies;
      if (status) {
        proxies = await storage.getProxiesByStatus(status, userId);
      } else {
        proxies = await storage.getProxies(userId);
      }
      
      // Apply pagination
      const total = proxies.length;
      const paginatedProxies = proxies.slice(offset, offset + limit);
      
      res.json({
        data: paginatedProxies,
        correlationId: req.correlationId,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proxies" });
    }
  }
);

// POST /api/proxies - Create single proxy
router.post("/",
  validateRequest(createProxySchema),
  userRateLimit("create_proxy", 50, 15), // 50 per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const proxy = await storage.createProxy({ ...req.body, userId });
      res.status(201).json(proxy);
    } catch (error) {
      res.status(400).json({ error: "Failed to create proxy" });
    }
  }
);

// POST /api/proxies/bulk - Create multiple proxies
router.post("/bulk",
  validateRequest(bulkProxiesSchema),
  userRateLimit("bulk_create_proxy", 5, 60), // 5 per hour
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { proxies } = req.body;
      const validatedProxies = proxies.map((proxy: any) => ({ ...proxy, userId }));
      const createdProxies = await storage.createProxies(validatedProxies);
      res.status(201).json({ 
        message: `Created ${createdProxies.length} proxies`,
        data: createdProxies 
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to create proxies" });
    }
  }
);

// GET /api/proxies/:id - Get single proxy
router.get("/:id",
  validateParams(idParamSchema),
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const proxies = await storage.getProxies(userId);
      const proxy = proxies.find(p => p.id === id);
      
      if (!proxy) {
        return res.status(404).json({ error: "Proxy not found" });
      }
      
      res.json(proxy);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proxy" });
    }
  }
);

// PUT /api/proxies/:id - Update proxy
router.put("/:id",
  validateParams(idParamSchema),
  validateRequest(updateProxySchema),
  userRateLimit("update_proxy", 100, 15), // 100 per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const proxy = await storage.updateProxy(id, userId, req.body);
      
      if (!proxy) {
        return res.status(404).json({ error: "Proxy not found" });
      }
      
      res.json(proxy);
    } catch (error) {
      res.status(400).json({ error: "Failed to update proxy" });
    }
  }
);

// DELETE /api/proxies/:id - Delete proxy
router.delete("/:id",
  validateParams(idParamSchema),
  userRateLimit("delete_proxy", 100, 15), // 100 per 15 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const success = await storage.deleteProxy(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Proxy not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete proxy" });
    }
  }
);

// POST /api/proxies/:id/test - Test proxy
router.post("/:id/test",
  validateParams(idParamSchema),
  userRateLimit("test_proxy", 20, 5), // 20 per 5 minutes
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const proxies = await storage.getProxies(userId);
      const proxy = proxies.find(p => p.id === id);
      
      if (!proxy) {
        return res.status(404).json({ error: "Proxy not found" });
      }
      
      // Simulate proxy test (replace with actual test logic)
      const testResult = {
        success: Math.random() > 0.3, // 70% success rate for demo
        responseTime: Math.floor(Math.random() * 1000) + 100,
        status: Math.random() > 0.3 ? 'valid' : 'invalid'
      };
      
      // Update proxy with test results
      await storage.updateProxy(id, userId, {
        status: testResult.status as any,
        responseTime: testResult.responseTime,
        lastChecked: new Date()
      });
      
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ error: "Failed to test proxy" });
    }
  }
);

export default router;
