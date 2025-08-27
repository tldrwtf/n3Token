import { pgTable, text, serial, integer, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
// Session storage table for authentication (mandatory for Replit Auth)
export var sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
}, function (table) { return [index("IDX_session_expire").on(table.expire)]; });
// User storage table
export var users = pgTable("users", {
    id: varchar("id").primaryKey().notNull(),
    email: varchar("email").unique().notNull(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    passwordHash: varchar("password_hash"), // For standalone authentication
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export var proxies = pgTable("proxies", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(function () { return users.id; }),
    host: text("host").notNull(),
    port: integer("port").notNull(),
    username: text("username"),
    password: text("password"),
    status: text("status").notNull().default("unchecked"), // "valid", "invalid", "checking", "unchecked", "rate_limited"
    responseTime: integer("response_time"), // in milliseconds
    lastChecked: timestamp("last_checked"),
    lastUsedAt: timestamp("last_used_at"),
    failureCount: integer("failure_count").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
});
export var tokens = pgTable("tokens", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(function () { return users.id; }),
    token: text("token").notNull(),
    username: text("username"),
    displayName: text("display_name"),
    description: text("description"),
    profileImageUrl: text("profile_image_url"),
    accountCreatedAt: timestamp("account_created_at"),
    status: text("status").notNull().default("unchecked"), // "valid", "invalid", "expired", "checking", "unchecked"
    expiresAt: timestamp("expires_at"),
    lastChecked: timestamp("last_checked"),
    loginCredentials: text("login_credentials"), // JSON string for refresh purposes
    createdAt: timestamp("created_at").defaultNow(),
}, function (table) { return [
    index("idx_tokens_user_token").on(table.userId, table.token),
]; });
export var operations = pgTable("operations", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(function () { return users.id; }),
    type: text("type").notNull(), // "validate_tokens", "validate_proxies", "username_lookup", "refresh_tokens"
    status: text("status").notNull().default("pending"), // "pending", "running", "completed", "failed"
    progress: integer("progress").notNull().default(0),
    total: integer("total").notNull().default(0),
    results: text("results"), // JSON string with operation results
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
});
// Rate limiting table
export var rateLimits = pgTable("rate_limits", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(function () { return users.id; }),
    endpoint: varchar("endpoint").notNull(),
    count: integer("count").notNull().default(1),
    windowStart: timestamp("window_start").notNull().defaultNow(),
}, function (table) { return [
    index("idx_rate_limits_user_endpoint").on(table.userId, table.endpoint, table.windowStart),
]; });
// Define relations
export var usersRelations = relations(users, function (_a) {
    var many = _a.many;
    return ({
        proxies: many(proxies),
        tokens: many(tokens),
        operations: many(operations),
        rateLimits: many(rateLimits),
    });
});
export var proxiesRelations = relations(proxies, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [proxies.userId],
            references: [users.id],
        }),
    });
});
export var tokensRelations = relations(tokens, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [tokens.userId],
            references: [users.id],
        }),
    });
});
export var operationsRelations = relations(operations, function (_a) {
    var one = _a.one;
    return ({
        user: one(users, {
            fields: [operations.userId],
            references: [users.id],
        }),
    });
});
// Schema for insert operations
export var insertProxySchema = createInsertSchema(proxies).omit({
    id: true,
    lastChecked: true,
    lastUsedAt: true,
    createdAt: true,
});
export var insertTokenSchema = createInsertSchema(tokens).omit({
    id: true,
    lastChecked: true,
    expiresAt: true,
    createdAt: true,
});
export var insertOperationSchema = createInsertSchema(operations).omit({
    id: true,
    startedAt: true,
    completedAt: true,
    createdAt: true,
});
export var insertRateLimitSchema = createInsertSchema(rateLimits).omit({
    id: true,
    windowStart: true,
});
