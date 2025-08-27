import { 
  proxies, tokens, operations, users, rateLimits,
  type Proxy, type Token, type Operation, type User, type UpsertUser, type RateLimit,
  type InsertProxy, type InsertToken, type InsertOperation, type InsertRateLimit 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import { MemoryStorage } from "./memoryStorage";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Proxy operations
  createProxy(proxy: InsertProxy): Promise<Proxy>;
  getProxies(userId: string): Promise<Proxy[]>;
  getProxiesByUser(userId: string): Promise<Proxy[]>;
  updateProxy(id: number, userId: string, updates: Partial<Proxy>): Promise<Proxy | undefined>;
  deleteProxy(id: number, userId: string): Promise<boolean>;
  getNextValidProxy(userId: string): Promise<Proxy | undefined>;
  
  // Token operations
  createToken(token: InsertToken): Promise<Token>;
  getTokens(userId: string): Promise<Token[]>;
  getTokensByUser(userId: string): Promise<Token[]>;
  updateToken(id: number, userId: string, updates: Partial<Token>): Promise<Token | undefined>;
  deleteToken(id: number, userId: string): Promise<boolean>;
  getTokenByValue(token: string, userId: string): Promise<Token | undefined>;
  
  // Operation operations
  createOperation(operation: InsertOperation): Promise<Operation>;
  getOperations(userId: string): Promise<Operation[]>;
  getOperationsByUser(userId: string): Promise<Operation[]>;
  updateOperation(id: number, userId: string, updates: Partial<Operation>): Promise<Operation | undefined>;
  getActiveOperation(userId: string): Promise<Operation | undefined>;
  
  // Bulk operations
  createProxies(proxies: InsertProxy[]): Promise<Proxy[]>;
  createTokens(tokens: InsertToken[]): Promise<Token[]>;
  getProxiesByStatus(status: string, userId: string): Promise<Proxy[]>;
  getTokensByStatus(status: string, userId: string): Promise<Token[]>;
  
  // Rate limiting
  checkRateLimit(userId: string, endpoint: string, limit: number, windowMinutes: number): Promise<boolean>;
  incrementRateLimit(userId: string, endpoint: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Proxy operations
  async createProxy(insertProxy: InsertProxy): Promise<Proxy> {
    const [proxy] = await db.insert(proxies).values(insertProxy).returning();
    return proxy;
  }

  async getProxies(userId: string): Promise<Proxy[]> {
    return db.select().from(proxies).where(eq(proxies.userId, userId));
  }

  async getProxiesByUser(userId: string): Promise<Proxy[]> {
    return this.getProxies(userId);
  }

  async updateProxy(id: number, userId: string, updates: Partial<Proxy>): Promise<Proxy | undefined> {
    const [proxy] = await db
      .update(proxies)
      .set(updates)
      .where(and(eq(proxies.id, id), eq(proxies.userId, userId)))
      .returning();
    return proxy;
  }

  async deleteProxy(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(proxies)
      .where(and(eq(proxies.id, id), eq(proxies.userId, userId)));
    return true;
  }

  async getNextValidProxy(userId: string): Promise<Proxy | undefined> {
    // First, check if any rate_limited proxies can be used again (after 1 minute cooldown)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    await db
      .update(proxies)
      .set({ status: "valid" })
      .where(and(
        eq(proxies.userId, userId),
        eq(proxies.status, "rate_limited"),
        sql`${proxies.lastChecked} <= ${oneMinuteAgo}`
      ));
    
    // Get a valid proxy that hasn't been used recently
    const [proxy] = await db
      .select()
      .from(proxies)
      .where(and(
        eq(proxies.userId, userId),
        eq(proxies.status, "valid")
      ))
      .orderBy(proxies.lastUsedAt)
      .limit(1);
    
    return proxy;
  }

  // Token operations
  async createToken(insertToken: InsertToken): Promise<Token> {
    const [token] = await db.insert(tokens).values(insertToken).returning();
    return token;
  }

  async getTokens(userId: string): Promise<Token[]> {
    return db.select().from(tokens).where(eq(tokens.userId, userId));
  }

  async getTokensByUser(userId: string): Promise<Token[]> {
    return this.getTokens(userId);
  }

  async updateToken(id: number, userId: string, updates: Partial<Token>): Promise<Token | undefined> {
    const [token] = await db
      .update(tokens)
      .set(updates)
      .where(and(eq(tokens.id, id), eq(tokens.userId, userId)))
      .returning();
    return token;
  }

  async deleteToken(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(tokens)
      .where(and(eq(tokens.id, id), eq(tokens.userId, userId)));
    return true;
  }

  async getTokenByValue(tokenValue: string, userId: string): Promise<Token | undefined> {
    const [token] = await db
      .select()
      .from(tokens)
      .where(and(eq(tokens.token, tokenValue), eq(tokens.userId, userId)));
    return token;
  }

  // Operation operations
  async createOperation(insertOperation: InsertOperation): Promise<Operation> {
    const [operation] = await db
      .insert(operations)
      .values({
        ...insertOperation,
        startedAt: new Date(),
      })
      .returning();
    return operation;
  }

  async getOperations(userId: string): Promise<Operation[]> {
    return db
      .select()
      .from(operations)
      .where(eq(operations.userId, userId))
      .orderBy(desc(operations.createdAt));
  }

  async getOperationsByUser(userId: string): Promise<Operation[]> {
    return this.getOperations(userId);
  }

  async updateOperation(id: number, userId: string, updates: Partial<Operation>): Promise<Operation | undefined> {
    const [operation] = await db
      .update(operations)
      .set(updates)
      .where(and(eq(operations.id, id), eq(operations.userId, userId)))
      .returning();
    return operation;
  }

  async getActiveOperation(userId: string): Promise<Operation | undefined> {
    const [operation] = await db
      .select()
      .from(operations)
      .where(and(
        eq(operations.userId, userId),
        eq(operations.status, "running")
      ));
    return operation;
  }

  // Bulk operations
  async createProxies(insertProxies: InsertProxy[]): Promise<Proxy[]> {
    const createdProxies = await db.insert(proxies).values(insertProxies).returning();
    return createdProxies;
  }

  async createTokens(insertTokens: InsertToken[]): Promise<Token[]> {
    const createdTokens = await db.insert(tokens).values(insertTokens).returning();
    return createdTokens;
  }

  async getProxiesByStatus(status: string, userId: string): Promise<Proxy[]> {
    return db
      .select()
      .from(proxies)
      .where(and(eq(proxies.status, status), eq(proxies.userId, userId)));
  }

  async getTokensByStatus(status: string, userId: string): Promise<Token[]> {
    return db
      .select()
      .from(tokens)
      .where(and(eq(tokens.status, status), eq(tokens.userId, userId)));
  }

  // Rate limiting
  async checkRateLimit(userId: string, endpoint: string, limit: number, windowMinutes: number): Promise<boolean> {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
    
    const [result] = await db
      .select()
      .from(rateLimits)
      .where(and(
        eq(rateLimits.userId, userId),
        eq(rateLimits.endpoint, endpoint),
        gt(rateLimits.windowStart, windowStart)
      ));
    
    return !result || result.count < limit;
  }

  async incrementRateLimit(userId: string, endpoint: string): Promise<void> {
    const windowStart = new Date(Date.now() - 5 * 60 * 1000); // 5 minute window
    
    const [existing] = await db
      .select()
      .from(rateLimits)
      .where(and(
        eq(rateLimits.userId, userId),
        eq(rateLimits.endpoint, endpoint),
        gt(rateLimits.windowStart, windowStart)
      ));
    
    if (existing) {
      await db
        .update(rateLimits)
        .set({ count: existing.count + 1 })
        .where(eq(rateLimits.id, existing.id));
    } else {
      await db.insert(rateLimits).values({
        userId,
        endpoint,
        count: 1,
        windowStart: new Date(),
      });
    }
  }
}

// Use memory storage if no database is available
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemoryStorage();
