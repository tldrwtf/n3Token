import { 
  type Proxy, type Token, type Operation, type User, type UpsertUser, type RateLimit,
  type InsertProxy, type InsertToken, type InsertOperation, type InsertRateLimit 
} from "@shared/schema";
import { IStorage } from "./storage";

export class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private proxies: Map<number, Proxy> = new Map();
  private tokens: Map<number, Token> = new Map();
  private operations: Map<number, Operation> = new Map();
  private rateLimits: Map<string, RateLimit> = new Map();
  private nextId = 1;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      passwordHash: userData.passwordHash || null,
      createdAt: this.users.get(userData.id)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Proxy operations
  async createProxy(insertProxy: InsertProxy): Promise<Proxy> {
    const proxy: Proxy = {
      id: this.nextId++,
      userId: insertProxy.userId,
      host: insertProxy.host,
      port: insertProxy.port,
      username: insertProxy.username || null,
      password: insertProxy.password || null,
      status: insertProxy.status || "unchecked",
      responseTime: null,
      lastChecked: null,
      lastUsedAt: null,
      failureCount: 0,
      createdAt: new Date(),
    };
    this.proxies.set(proxy.id, proxy);
    return proxy;
  }

  async getProxies(userId: string): Promise<Proxy[]> {
    return Array.from(this.proxies.values()).filter(p => p.userId === userId);
  }

  async getProxiesByUser(userId: string): Promise<Proxy[]> {
    return this.getProxies(userId);
  }

  async updateProxy(id: number, userId: string, updates: Partial<Proxy>): Promise<Proxy | undefined> {
    const proxy = this.proxies.get(id);
    if (!proxy || proxy.userId !== userId) return undefined;
    
    const updated = { ...proxy, ...updates };
    this.proxies.set(id, updated);
    return updated;
  }

  async deleteProxy(id: number, userId: string): Promise<boolean> {
    const proxy = this.proxies.get(id);
    if (!proxy || proxy.userId !== userId) return false;
    
    this.proxies.delete(id);
    return true;
  }

  async getNextValidProxy(userId: string): Promise<Proxy | undefined> {
    const userProxies = Array.from(this.proxies.values()).filter(p => p.userId === userId);
    
    // Reset rate-limited proxies after 1 minute
    const oneMinuteAgo = new Date(Date.now() - 60000);
    userProxies.forEach(proxy => {
      if (proxy.status === "rate_limited" && proxy.lastChecked && proxy.lastChecked <= oneMinuteAgo) {
        proxy.status = "valid";
        this.proxies.set(proxy.id, proxy);
      }
    });
    
    // Find valid proxy
    const validProxies = userProxies
      .filter(p => p.status === "valid")
      .sort((a, b) => (a.lastUsedAt?.getTime() || 0) - (b.lastUsedAt?.getTime() || 0));
    
    return validProxies[0];
  }

  // Token operations
  async createToken(insertToken: InsertToken): Promise<Token> {
    const token: Token = {
      id: this.nextId++,
      userId: insertToken.userId,
      token: insertToken.token,
      username: insertToken.username || null,
      displayName: insertToken.displayName || null,
      description: insertToken.description || null,
      profileImageUrl: insertToken.profileImageUrl || null,
      accountCreatedAt: insertToken.accountCreatedAt || null,
      status: insertToken.status || "unchecked",
      expiresAt: null,
      lastChecked: null,
      loginCredentials: insertToken.loginCredentials || null,
      createdAt: new Date(),
    };
    this.tokens.set(token.id, token);
    return token;
  }

  async getTokens(userId: string): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(t => t.userId === userId);
  }

  async getTokensByUser(userId: string): Promise<Token[]> {
    return this.getTokens(userId);
  }

  async updateToken(id: number, userId: string, updates: Partial<Token>): Promise<Token | undefined> {
    const token = this.tokens.get(id);
    if (!token || token.userId !== userId) return undefined;
    
    const updated = { ...token, ...updates };
    this.tokens.set(id, updated);
    return updated;
  }

  async deleteToken(id: number, userId: string): Promise<boolean> {
    const token = this.tokens.get(id);
    if (!token || token.userId !== userId) return false;
    
    this.tokens.delete(id);
    return true;
  }

  async getTokenByValue(tokenValue: string, userId: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(t => t.token === tokenValue && t.userId === userId);
  }

  // Operation operations
  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    const operation: Operation = {
      id: this.nextId++,
      userId: insertOperation.userId,
      type: insertOperation.type,
      status: insertOperation.status || "pending",
      progress: insertOperation.progress || 0,
      total: insertOperation.total || 0,
      results: insertOperation.results || null,
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
    };
    this.operations.set(operation.id, operation);
    return operation;
  }

  async getOperations(userId: string): Promise<Operation[]> {
    return Array.from(this.operations.values())
      .filter(o => o.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOperationsByUser(userId: string): Promise<Operation[]> {
    return this.getOperations(userId);
  }

  async updateOperation(id: number, userId: string, updates: Partial<Operation>): Promise<Operation | undefined> {
    const operation = this.operations.get(id);
    if (!operation || operation.userId !== userId) return undefined;
    
    const updated = { ...operation, ...updates };
    this.operations.set(id, updated);
    return updated;
  }

  async getActiveOperation(userId: string): Promise<Operation | undefined> {
    return Array.from(this.operations.values()).find(o => o.userId === userId && o.status === "running");
  }

  // Bulk operations
  async createProxies(insertProxies: InsertProxy[]): Promise<Proxy[]> {
    const created: Proxy[] = [];
    for (const insertProxy of insertProxies) {
      created.push(await this.createProxy(insertProxy));
    }
    return created;
  }

  async createTokens(insertTokens: InsertToken[]): Promise<Token[]> {
    const created: Token[] = [];
    for (const insertToken of insertTokens) {
      created.push(await this.createToken(insertToken));
    }
    return created;
  }

  async getProxiesByStatus(status: string, userId: string): Promise<Proxy[]> {
    return Array.from(this.proxies.values()).filter(p => p.status === status && p.userId === userId);
  }

  async getTokensByStatus(status: string, userId: string): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(t => t.status === status && t.userId === userId);
  }

  // Rate limiting
  async checkRateLimit(userId: string, endpoint: string, limit: number, windowMinutes: number): Promise<boolean> {
    const key = `${userId}:${endpoint}`;
    const rateLimit = this.rateLimits.get(key);
    
    if (!rateLimit) return true;
    
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    if (rateLimit.windowStart <= windowStart) return true;
    
    return rateLimit.count < limit;
  }

  async incrementRateLimit(userId: string, endpoint: string): Promise<void> {
    const key = `${userId}:${endpoint}`;
    const windowStart = new Date(Date.now() - 5 * 60 * 1000);
    
    const existing = this.rateLimits.get(key);
    
    if (existing && existing.windowStart > windowStart) {
      existing.count += 1;
      this.rateLimits.set(key, existing);
    } else {
      const newRateLimit: RateLimit = {
        id: this.nextId++,
        userId,
        endpoint,
        count: 1,
        windowStart: new Date(),
      };
      this.rateLimits.set(key, newRateLimit);
    }
  }
}