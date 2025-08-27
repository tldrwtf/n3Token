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
var MemoryStorage = /** @class */ (function () {
    function MemoryStorage() {
        this.users = new Map();
        this.proxies = new Map();
        this.tokens = new Map();
        this.operations = new Map();
        this.rateLimits = new Map();
        this.nextId = 1;
    }
    // User operations
    MemoryStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemoryStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.users.values()).find(function (user) { return user.email === email; })];
            });
        });
    };
    MemoryStorage.prototype.upsertUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            var _a;
            return __generator(this, function (_b) {
                user = {
                    id: userData.id,
                    email: userData.email,
                    firstName: userData.firstName || null,
                    lastName: userData.lastName || null,
                    profileImageUrl: userData.profileImageUrl || null,
                    passwordHash: userData.passwordHash || null,
                    createdAt: ((_a = this.users.get(userData.id)) === null || _a === void 0 ? void 0 : _a.createdAt) || new Date(),
                    updatedAt: new Date(),
                };
                this.users.set(userData.id, user);
                return [2 /*return*/, user];
            });
        });
    };
    // Proxy operations
    MemoryStorage.prototype.createProxy = function (insertProxy) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                proxy = {
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
                return [2 /*return*/, proxy];
            });
        });
    };
    MemoryStorage.prototype.getProxies = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.proxies.values()).filter(function (p) { return p.userId === userId; })];
            });
        });
    };
    MemoryStorage.prototype.getProxiesByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getProxies(userId)];
            });
        });
    };
    MemoryStorage.prototype.updateProxy = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy, updated;
            return __generator(this, function (_a) {
                proxy = this.proxies.get(id);
                if (!proxy || proxy.userId !== userId)
                    return [2 /*return*/, undefined];
                updated = __assign(__assign({}, proxy), updates);
                this.proxies.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemoryStorage.prototype.deleteProxy = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var proxy;
            return __generator(this, function (_a) {
                proxy = this.proxies.get(id);
                if (!proxy || proxy.userId !== userId)
                    return [2 /*return*/, false];
                this.proxies.delete(id);
                return [2 /*return*/, true];
            });
        });
    };
    MemoryStorage.prototype.getNextValidProxy = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userProxies, oneMinuteAgo, validProxies;
            var _this = this;
            return __generator(this, function (_a) {
                userProxies = Array.from(this.proxies.values()).filter(function (p) { return p.userId === userId; });
                oneMinuteAgo = new Date(Date.now() - 60000);
                userProxies.forEach(function (proxy) {
                    if (proxy.status === "rate_limited" && proxy.lastChecked && proxy.lastChecked <= oneMinuteAgo) {
                        proxy.status = "valid";
                        _this.proxies.set(proxy.id, proxy);
                    }
                });
                validProxies = userProxies
                    .filter(function (p) { return p.status === "valid"; })
                    .sort(function (a, b) { var _a, _b; return (((_a = a.lastUsedAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = b.lastUsedAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); });
                return [2 /*return*/, validProxies[0]];
            });
        });
    };
    // Token operations
    MemoryStorage.prototype.createToken = function (insertToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                token = {
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
                return [2 /*return*/, token];
            });
        });
    };
    MemoryStorage.prototype.getTokens = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.tokens.values()).filter(function (t) { return t.userId === userId; })];
            });
        });
    };
    MemoryStorage.prototype.getTokensByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getTokens(userId)];
            });
        });
    };
    MemoryStorage.prototype.updateToken = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var token, updated;
            return __generator(this, function (_a) {
                token = this.tokens.get(id);
                if (!token || token.userId !== userId)
                    return [2 /*return*/, undefined];
                updated = __assign(__assign({}, token), updates);
                this.tokens.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemoryStorage.prototype.deleteToken = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var token;
            return __generator(this, function (_a) {
                token = this.tokens.get(id);
                if (!token || token.userId !== userId)
                    return [2 /*return*/, false];
                this.tokens.delete(id);
                return [2 /*return*/, true];
            });
        });
    };
    MemoryStorage.prototype.getTokenByValue = function (tokenValue, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.tokens.values()).find(function (t) { return t.token === tokenValue && t.userId === userId; })];
            });
        });
    };
    // Operation operations
    MemoryStorage.prototype.createOperation = function (insertOperation) {
        return __awaiter(this, void 0, void 0, function () {
            var operation;
            return __generator(this, function (_a) {
                operation = {
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
                return [2 /*return*/, operation];
            });
        });
    };
    MemoryStorage.prototype.getOperations = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.operations.values())
                        .filter(function (o) { return o.userId === userId; })
                        .sort(function (a, b) { var _a, _b; return (((_a = b.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || 0) - (((_b = a.createdAt) === null || _b === void 0 ? void 0 : _b.getTime()) || 0); })];
            });
        });
    };
    MemoryStorage.prototype.getOperationsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getOperations(userId)];
            });
        });
    };
    MemoryStorage.prototype.updateOperation = function (id, userId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var operation, updated;
            return __generator(this, function (_a) {
                operation = this.operations.get(id);
                if (!operation || operation.userId !== userId)
                    return [2 /*return*/, undefined];
                updated = __assign(__assign({}, operation), updates);
                this.operations.set(id, updated);
                return [2 /*return*/, updated];
            });
        });
    };
    MemoryStorage.prototype.getActiveOperation = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.operations.values()).find(function (o) { return o.userId === userId && o.status === "running"; })];
            });
        });
    };
    // Bulk operations
    MemoryStorage.prototype.createProxies = function (insertProxies) {
        return __awaiter(this, void 0, void 0, function () {
            var created, _i, insertProxies_1, insertProxy, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        created = [];
                        _i = 0, insertProxies_1 = insertProxies;
                        _c.label = 1;
                    case 1:
                        if (!(_i < insertProxies_1.length)) return [3 /*break*/, 4];
                        insertProxy = insertProxies_1[_i];
                        _b = (_a = created).push;
                        return [4 /*yield*/, this.createProxy(insertProxy)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, created];
                }
            });
        });
    };
    MemoryStorage.prototype.createTokens = function (insertTokens) {
        return __awaiter(this, void 0, void 0, function () {
            var created, _i, insertTokens_1, insertToken, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        created = [];
                        _i = 0, insertTokens_1 = insertTokens;
                        _c.label = 1;
                    case 1:
                        if (!(_i < insertTokens_1.length)) return [3 /*break*/, 4];
                        insertToken = insertTokens_1[_i];
                        _b = (_a = created).push;
                        return [4 /*yield*/, this.createToken(insertToken)];
                    case 2:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, created];
                }
            });
        });
    };
    MemoryStorage.prototype.getProxiesByStatus = function (status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.proxies.values()).filter(function (p) { return p.status === status && p.userId === userId; })];
            });
        });
    };
    MemoryStorage.prototype.getTokensByStatus = function (status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Array.from(this.tokens.values()).filter(function (t) { return t.status === status && t.userId === userId; })];
            });
        });
    };
    // Rate limiting
    MemoryStorage.prototype.checkRateLimit = function (userId, endpoint, limit, windowMinutes) {
        return __awaiter(this, void 0, void 0, function () {
            var key, rateLimit, windowStart;
            return __generator(this, function (_a) {
                key = "".concat(userId, ":").concat(endpoint);
                rateLimit = this.rateLimits.get(key);
                if (!rateLimit)
                    return [2 /*return*/, true];
                windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);
                if (rateLimit.windowStart <= windowStart)
                    return [2 /*return*/, true];
                return [2 /*return*/, rateLimit.count < limit];
            });
        });
    };
    MemoryStorage.prototype.incrementRateLimit = function (userId, endpoint) {
        return __awaiter(this, void 0, void 0, function () {
            var key, windowStart, existing, newRateLimit;
            return __generator(this, function (_a) {
                key = "".concat(userId, ":").concat(endpoint);
                windowStart = new Date(Date.now() - 5 * 60 * 1000);
                existing = this.rateLimits.get(key);
                if (existing && existing.windowStart > windowStart) {
                    existing.count += 1;
                    this.rateLimits.set(key, existing);
                }
                else {
                    newRateLimit = {
                        id: this.nextId++,
                        userId: userId,
                        endpoint: endpoint,
                        count: 1,
                        windowStart: new Date(),
                    };
                    this.rateLimits.set(key, newRateLimit);
                }
                return [2 /*return*/];
            });
        });
    };
    return MemoryStorage;
}());
export { MemoryStorage };
