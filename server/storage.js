var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { proxies, tokens, operations, users, rateLimits } from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, desc, sql } from "drizzle-orm";
import { MemoryStorage } from "./memoryStorage";
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    // User operations
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.id, id))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.select().from(users).where(eq(users.email, email))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.upsertUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .insert(users)
                            .values(userData)
                            .onConflictDoUpdate({
                            target: users.id,
                            set: __assign(__assign({}, userData), { updatedAt: new Date() }),
                        })
                            .returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    // Proxy operations
    DatabaseStorage.prototype.createProxy = function (insertProxy) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(proxies).values(insertProxy).returning()];
                    case 1:
                        proxy = (_a.sent())[0];
                        return [2 /*return*/, proxy];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProxies = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db.select().from(proxies).where(eq(proxies.userId, userId))];
            });
        });
    };
    DatabaseStorage.prototype.getProxiesByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getProxies(userId)];
            });
        });
    };
    DatabaseStorage.prototype.updateProxy = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(proxies)
                            .set(updates)
                            .where(and(eq(proxies.id, id), eq(proxies.userId, userId)))
                            .returning()];
                    case 1:
                        proxy = (_a.sent())[0];
                        return [2 /*return*/, proxy];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteProxy = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .delete(proxies)
                            .where(and(eq(proxies.id, id), eq(proxies.userId, userId)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    DatabaseStorage.prototype.getNextValidProxy = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var oneMinuteAgo, proxy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        oneMinuteAgo = new Date(Date.now() - 60000);
                        return [4 /*yield*/, db
                                .update(proxies)
                                .set({ status: "valid" })
                                .where(and(eq(proxies.userId, userId), eq(proxies.status, "rate_limited"), sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", " <= ", ""], ["", " <= ", ""])), proxies.lastChecked, oneMinuteAgo)))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db
                                .select()
                                .from(proxies)
                                .where(and(eq(proxies.userId, userId), eq(proxies.status, "valid")))
                                .orderBy(proxies.lastUsedAt)
                                .limit(1)];
                    case 2:
                        proxy = (_a.sent())[0];
                        return [2 /*return*/, proxy];
                }
            });
        });
    };
    // Token operations
    DatabaseStorage.prototype.createToken = function (insertToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(tokens).values(insertToken).returning()];
                    case 1:
                        token = (_a.sent())[0];
                        return [2 /*return*/, token];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTokens = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db.select().from(tokens).where(eq(tokens.userId, userId))];
            });
        });
    };
    DatabaseStorage.prototype.getTokensByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getTokens(userId)];
            });
        });
    };
    DatabaseStorage.prototype.updateToken = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(tokens)
                            .set(updates)
                            .where(and(eq(tokens.id, id), eq(tokens.userId, userId)))
                            .returning()];
                    case 1:
                        token = (_a.sent())[0];
                        return [2 /*return*/, token];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteToken = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .delete(tokens)
                            .where(and(eq(tokens.id, id), eq(tokens.userId, userId)))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTokenByValue = function (tokenValue, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(tokens)
                            .where(and(eq(tokens.token, tokenValue), eq(tokens.userId, userId)))];
                    case 1:
                        token = (_a.sent())[0];
                        return [2 /*return*/, token];
                }
            });
        });
    };
    // Operation operations
    DatabaseStorage.prototype.createOperation = function (insertOperation) {
        return __awaiter(this, void 0, void 0, function () {
            var operation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .insert(operations)
                            .values(__assign(__assign({}, insertOperation), { startedAt: new Date() }))
                            .returning()];
                    case 1:
                        operation = (_a.sent())[0];
                        return [2 /*return*/, operation];
                }
            });
        });
    };
    DatabaseStorage.prototype.getOperations = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(operations)
                        .where(eq(operations.userId, userId))
                        .orderBy(desc(operations.createdAt))];
            });
        });
    };
    DatabaseStorage.prototype.getOperationsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOperations(userId)];
            });
        });
    };
    DatabaseStorage.prototype.updateOperation = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var operation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .update(operations)
                            .set(updates)
                            .where(and(eq(operations.id, id), eq(operations.userId, userId)))
                            .returning()];
                    case 1:
                        operation = (_a.sent())[0];
                        return [2 /*return*/, operation];
                }
            });
        });
    };
    DatabaseStorage.prototype.getActiveOperation = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var operation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db
                            .select()
                            .from(operations)
                            .where(and(eq(operations.userId, userId), eq(operations.status, "running")))];
                    case 1:
                        operation = (_a.sent())[0];
                        return [2 /*return*/, operation];
                }
            });
        });
    };
    // Bulk operations
    DatabaseStorage.prototype.createProxies = function (insertProxies) {
        return __awaiter(this, void 0, void 0, function () {
            var createdProxies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(proxies).values(insertProxies).returning()];
                    case 1:
                        createdProxies = _a.sent();
                        return [2 /*return*/, createdProxies];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTokens = function (insertTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var createdTokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db.insert(tokens).values(insertTokens).returning()];
                    case 1:
                        createdTokens = _a.sent();
                        return [2 /*return*/, createdTokens];
                }
            });
        });
    };
    DatabaseStorage.prototype.getProxiesByStatus = function (status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(proxies)
                        .where(and(eq(proxies.status, status), eq(proxies.userId, userId)))];
            });
        });
    };
    DatabaseStorage.prototype.getTokensByStatus = function (status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, db
                        .select()
                        .from(tokens)
                        .where(and(eq(tokens.status, status), eq(tokens.userId, userId)))];
            });
        });
    };
    // Rate limiting
    DatabaseStorage.prototype.checkRateLimit = function (userId, endpoint, limit, windowMinutes) {
        return __awaiter(this, void 0, void 0, function () {
            var windowStart, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
                        return [4 /*yield*/, db
                                .select()
                                .from(rateLimits)
                                .where(and(eq(rateLimits.userId, userId), eq(rateLimits.endpoint, endpoint), gt(rateLimits.windowStart, windowStart)))];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, !result || result.count < limit];
                }
            });
        });
    };
    DatabaseStorage.prototype.incrementRateLimit = function (userId, endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var windowStart, existing;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        windowStart = new Date(Date.now() - 5 * 60 * 1000);
                        return [4 /*yield*/, db
                                .select()
                                .from(rateLimits)
                                .where(and(eq(rateLimits.userId, userId), eq(rateLimits.endpoint, endpoint), gt(rateLimits.windowStart, windowStart)))];
                    case 1:
                        existing = (_a.sent())[0];
                        if (!existing) return [3 /*break*/, 3];
                        return [4 /*yield*/, db
                                .update(rateLimits)
                                .set({ count: existing.count + 1 })
                                .where(eq(rateLimits.id, existing.id))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.insert(rateLimits).values({
                            userId: userId,
                            endpoint: endpoint,
                            count: 1,
                            windowStart: new Date(),
                        })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return DatabaseStorage;
}());
export { DatabaseStorage };
// Use memory storage if no database is available
export var storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemoryStorage();
var templateObject_1;
