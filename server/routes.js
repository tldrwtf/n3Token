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
import { createServer } from "http";
import { storage } from "./storage";
import { twitchApi } from "./services/twitchApi";
import { insertProxySchema, insertTokenSchema } from "@shared/schema";
import multer from "multer";
import { setupAuth, isAuthenticated } from "./auth";
import fs from "fs";
var upload = multer({ dest: 'uploads/' });
export function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        // Background operation functions
        function validateProxiesInBackground(operationId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var proxies, total, processed, results, _i, proxies_1, proxy, result, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, storage.getProxies(userId)];
                        case 1:
                            proxies = _a.sent();
                            total = proxies.length;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { total: total, progress: 0 })];
                        case 2:
                            _a.sent();
                            processed = 0;
                            results = { valid: 0, invalid: 0, errors: [] };
                            _i = 0, proxies_1 = proxies;
                            _a.label = 3;
                        case 3:
                            if (!(_i < proxies_1.length)) return [3 /*break*/, 11];
                            proxy = proxies_1[_i];
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 7, , 8]);
                            return [4 /*yield*/, twitchApi.testProxy({
                                    host: proxy.host,
                                    port: proxy.port,
                                    username: proxy.username || undefined,
                                    password: proxy.password || undefined,
                                }, userId)];
                        case 5:
                            result = _a.sent();
                            return [4 /*yield*/, storage.updateProxy(proxy.id, userId, {
                                    status: result.valid ? "valid" : "invalid",
                                    responseTime: result.responseTime,
                                    lastChecked: new Date(),
                                })];
                        case 6:
                            _a.sent();
                            if (result.valid) {
                                results.valid++;
                            }
                            else {
                                results.invalid++;
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            error_1 = _a.sent();
                            results.errors.push("Proxy ".concat(proxy.host, ":").concat(proxy.port, " - ").concat(error_1));
                            return [3 /*break*/, 8];
                        case 8:
                            processed++;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { progress: processed })];
                        case 9:
                            _a.sent();
                            _a.label = 10;
                        case 10:
                            _i++;
                            return [3 /*break*/, 3];
                        case 11: return [4 /*yield*/, storage.updateOperation(operationId, userId, {
                                status: "completed",
                                completedAt: new Date(),
                                results: JSON.stringify(results),
                            })];
                        case 12:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function validateTokensInBackground(operationId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var tokens, total, processed, results, _i, tokens_1, token, result, status_1, userDetails, userInfo, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, storage.getTokens(userId)];
                        case 1:
                            tokens = _a.sent();
                            total = tokens.length;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { total: total, progress: 0 })];
                        case 2:
                            _a.sent();
                            processed = 0;
                            results = { valid: 0, invalid: 0, expired: 0, errors: [] };
                            _i = 0, tokens_1 = tokens;
                            _a.label = 3;
                        case 3:
                            if (!(_i < tokens_1.length)) return [3 /*break*/, 13];
                            token = tokens_1[_i];
                            _a.label = 4;
                        case 4:
                            _a.trys.push([4, 9, , 10]);
                            return [4 /*yield*/, twitchApi.validateToken(token.token, userId)];
                        case 5:
                            result = _a.sent();
                            status_1 = "invalid";
                            userDetails = {};
                            if (!result.valid) return [3 /*break*/, 7];
                            status_1 = "valid";
                            return [4 /*yield*/, twitchApi.getUserByToken(token.token, userId)];
                        case 6:
                            userInfo = _a.sent();
                            if (!userInfo.error) {
                                userDetails = {
                                    username: userInfo.username,
                                    displayName: userInfo.displayName,
                                    description: userInfo.description,
                                    profileImageUrl: userInfo.profileImageUrl,
                                    accountCreatedAt: userInfo.createdAt ? new Date(userInfo.createdAt) : undefined,
                                };
                            }
                            if (result.expiresIn) {
                                userDetails = __assign(__assign({}, userDetails), { expiresAt: new Date(Date.now() + result.expiresIn * 1000) });
                                if (result.expiresIn < 86400) { // Less than 24 hours
                                    status_1 = "expired";
                                }
                            }
                            _a.label = 7;
                        case 7: return [4 /*yield*/, storage.updateToken(token.id, userId, __assign(__assign({ status: status_1 }, userDetails), { lastChecked: new Date() }))];
                        case 8:
                            _a.sent();
                            if (status_1 === "valid") {
                                results.valid++;
                            }
                            else if (status_1 === "expired") {
                                results.expired++;
                            }
                            else {
                                results.invalid++;
                            }
                            return [3 /*break*/, 10];
                        case 9:
                            error_2 = _a.sent();
                            results.errors.push("Token ".concat(token.token.substring(0, 20), "... - ").concat(error_2));
                            return [3 /*break*/, 10];
                        case 10:
                            processed++;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { progress: processed })];
                        case 11:
                            _a.sent();
                            _a.label = 12;
                        case 12:
                            _i++;
                            return [3 /*break*/, 3];
                        case 13: return [4 /*yield*/, storage.updateOperation(operationId, userId, {
                                status: "completed",
                                completedAt: new Date(),
                                results: JSON.stringify(results),
                            })];
                        case 14:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        function usernameLookupInBackground(operationId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var tokens, total, processed, results, _i, tokens_2, token, result, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, storage.getTokensByStatus("valid", userId)];
                        case 1:
                            tokens = _a.sent();
                            total = tokens.length;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { total: total, progress: 0 })];
                        case 2:
                            _a.sent();
                            processed = 0;
                            results = { resolved: 0, failed: 0, errors: [] };
                            _i = 0, tokens_2 = tokens;
                            _a.label = 3;
                        case 3:
                            if (!(_i < tokens_2.length)) return [3 /*break*/, 14];
                            token = tokens_2[_i];
                            if (!token.username) return [3 /*break*/, 5];
                            processed++;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { progress: processed })];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 13];
                        case 5:
                            _a.trys.push([5, 10, , 11]);
                            return [4 /*yield*/, twitchApi.getUserByToken(token.token, userId)];
                        case 6:
                            result = _a.sent();
                            if (!!result.error) return [3 /*break*/, 8];
                            return [4 /*yield*/, storage.updateToken(token.id, userId, {
                                    username: result.username,
                                    displayName: result.displayName,
                                    description: result.description,
                                    profileImageUrl: result.profileImageUrl,
                                    accountCreatedAt: result.createdAt ? new Date(result.createdAt) : undefined,
                                })];
                        case 7:
                            _a.sent();
                            results.resolved++;
                            return [3 /*break*/, 9];
                        case 8:
                            results.failed++;
                            results.errors.push("Token ".concat(token.token.substring(0, 20), "... - ").concat(result.error));
                            _a.label = 9;
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            error_3 = _a.sent();
                            results.errors.push("Token ".concat(token.token.substring(0, 20), "... - ").concat(error_3));
                            results.failed++;
                            return [3 /*break*/, 11];
                        case 11:
                            processed++;
                            return [4 /*yield*/, storage.updateOperation(operationId, userId, { progress: processed })];
                        case 12:
                            _a.sent();
                            _a.label = 13;
                        case 13:
                            _i++;
                            return [3 /*break*/, 3];
                        case 14: return [4 /*yield*/, storage.updateOperation(operationId, userId, {
                                status: "completed",
                                completedAt: new Date(),
                                results: JSON.stringify(results),
                            })];
                        case 15:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Health check endpoint
                    app.get('/health', function (req, res) {
                        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
                    });
                    // Auth middleware
                    return [4 /*yield*/, setupAuth(app)];
                case 1:
                    // Auth middleware
                    _a.sent();
                    // Auth routes
                    app.get('/api/auth/user', isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, user, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.getUser(userId)];
                                case 1:
                                    user = _a.sent();
                                    res.json(user);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_4 = _a.sent();
                                    console.error("Error fetching user:", error_4);
                                    res.status(500).json({ message: "Failed to fetch user" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Proxy routes
                    app.get("/api/proxies", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, proxies, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.getProxies(userId)];
                                case 1:
                                    proxies = _a.sent();
                                    res.json(proxies);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_5 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch proxies" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/proxies", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, proxyData, proxy, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    proxyData = insertProxySchema.parse(req.body);
                                    return [4 /*yield*/, storage.createProxy(__assign(__assign({}, proxyData), { userId: userId }))];
                                case 1:
                                    proxy = _a.sent();
                                    res.json(proxy);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_6 = _a.sent();
                                    res.status(400).json({ error: "Invalid proxy data" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/proxies/bulk", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId_1, proxies, validatedProxies, createdProxies, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId_1 = req.user.id;
                                    proxies = req.body.proxies;
                                    validatedProxies = proxies.map(function (proxy) { return (__assign(__assign({}, insertProxySchema.parse(proxy)), { userId: userId_1 })); });
                                    return [4 /*yield*/, storage.createProxies(validatedProxies)];
                                case 1:
                                    createdProxies = _a.sent();
                                    res.json(createdProxies);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_7 = _a.sent();
                                    res.status(400).json({ error: "Invalid proxy data" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/proxies/:id", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, id, updates, proxy, error_8;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    id = parseInt(req.params.id);
                                    updates = req.body;
                                    return [4 /*yield*/, storage.updateProxy(id, userId, updates)];
                                case 1:
                                    proxy = _a.sent();
                                    if (!proxy) {
                                        return [2 /*return*/, res.status(404).json({ error: "Proxy not found" })];
                                    }
                                    res.json(proxy);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_8 = _a.sent();
                                    res.status(400).json({ error: "Failed to update proxy" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/api/proxies/:id", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, id, success, error_9;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    id = parseInt(req.params.id);
                                    return [4 /*yield*/, storage.deleteProxy(id, userId)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ error: "Proxy not found" })];
                                    }
                                    res.json({ success: true });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_9 = _a.sent();
                                    res.status(400).json({ error: "Failed to delete proxy" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/proxies/:id/test", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, id_1, proxies, proxy, result, updatedProxy, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    userId = req.user.id;
                                    id_1 = parseInt(req.params.id);
                                    return [4 /*yield*/, storage.getProxies(userId)];
                                case 1:
                                    proxies = _a.sent();
                                    proxy = proxies.find(function (p) { return p.id === id_1; });
                                    if (!proxy) {
                                        return [2 /*return*/, res.status(404).json({ error: "Proxy not found" })];
                                    }
                                    return [4 /*yield*/, storage.updateProxy(id_1, userId, { status: "checking", lastChecked: new Date() })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, twitchApi.testProxy({
                                            host: proxy.host,
                                            port: proxy.port,
                                            username: proxy.username || undefined,
                                            password: proxy.password || undefined,
                                        }, userId)];
                                case 3:
                                    result = _a.sent();
                                    return [4 /*yield*/, storage.updateProxy(id_1, userId, {
                                            status: result.valid ? "valid" : "invalid",
                                            responseTime: result.responseTime,
                                            lastChecked: new Date(),
                                        })];
                                case 4:
                                    updatedProxy = _a.sent();
                                    res.json(updatedProxy);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_10 = _a.sent();
                                    res.status(500).json({ error: "Failed to test proxy" });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Token routes
                    app.get("/api/tokens", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, tokens, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.getTokens(userId)];
                                case 1:
                                    tokens = _a.sent();
                                    res.json(tokens);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_11 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch tokens" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/tokens", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, tokenData, token, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    tokenData = insertTokenSchema.parse(req.body);
                                    return [4 /*yield*/, storage.createToken(__assign(__assign({}, tokenData), { userId: userId }))];
                                case 1:
                                    token = _a.sent();
                                    res.json(token);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_12 = _a.sent();
                                    res.status(400).json({ error: "Invalid token data" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/tokens/bulk", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId_2, tokens, validatedTokens, createdTokens, error_13;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId_2 = req.user.id;
                                    tokens = req.body.tokens;
                                    validatedTokens = tokens.map(function (token) { return (__assign(__assign({}, insertTokenSchema.parse(token)), { userId: userId_2 })); });
                                    return [4 /*yield*/, storage.createTokens(validatedTokens)];
                                case 1:
                                    createdTokens = _a.sent();
                                    res.json(createdTokens);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_13 = _a.sent();
                                    res.status(400).json({ error: "Invalid token data" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.put("/api/tokens/:id", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, id, updates, token, error_14;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    id = parseInt(req.params.id);
                                    updates = req.body;
                                    return [4 /*yield*/, storage.updateToken(id, userId, updates)];
                                case 1:
                                    token = _a.sent();
                                    if (!token) {
                                        return [2 /*return*/, res.status(404).json({ error: "Token not found" })];
                                    }
                                    res.json(token);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_14 = _a.sent();
                                    res.status(400).json({ error: "Failed to update token" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.delete("/api/tokens/:id", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, id, success, error_15;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    id = parseInt(req.params.id);
                                    return [4 /*yield*/, storage.deleteToken(id, userId)];
                                case 1:
                                    success = _a.sent();
                                    if (!success) {
                                        return [2 /*return*/, res.status(404).json({ error: "Token not found" })];
                                    }
                                    res.json({ success: true });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_15 = _a.sent();
                                    res.status(400).json({ error: "Failed to delete token" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/tokens/:id/validate", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, id_2, tokens, token, result, status_2, username, expiresAt, userDetails, userInfo, updatedToken, error_16;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 7, , 8]);
                                    userId = req.user.id;
                                    id_2 = parseInt(req.params.id);
                                    return [4 /*yield*/, storage.getTokens(userId)];
                                case 1:
                                    tokens = _a.sent();
                                    token = tokens.find(function (t) { return t.id === id_2; });
                                    if (!token) {
                                        return [2 /*return*/, res.status(404).json({ error: "Token not found" })];
                                    }
                                    return [4 /*yield*/, storage.updateToken(id_2, userId, { status: "checking", lastChecked: new Date() })];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, twitchApi.validateToken(token.token, userId)];
                                case 3:
                                    result = _a.sent();
                                    status_2 = "invalid";
                                    username = token.username;
                                    expiresAt = token.expiresAt;
                                    userDetails = {};
                                    if (!result.valid) return [3 /*break*/, 5];
                                    status_2 = "valid";
                                    username = result.username || username;
                                    if (result.expiresIn) {
                                        expiresAt = new Date(Date.now() + result.expiresIn * 1000);
                                    }
                                    return [4 /*yield*/, twitchApi.getUserByToken(token.token, userId)];
                                case 4:
                                    userInfo = _a.sent();
                                    if (!userInfo.error) {
                                        userDetails = {
                                            username: userInfo.username,
                                            displayName: userInfo.displayName,
                                            description: userInfo.description,
                                            profileImageUrl: userInfo.profileImageUrl,
                                            accountCreatedAt: userInfo.createdAt ? new Date(userInfo.createdAt) : undefined,
                                        };
                                    }
                                    _a.label = 5;
                                case 5: return [4 /*yield*/, storage.updateToken(id_2, userId, __assign(__assign({ status: status_2 }, userDetails), { expiresAt: expiresAt, lastChecked: new Date() }))];
                                case 6:
                                    updatedToken = _a.sent();
                                    res.json(updatedToken);
                                    return [3 /*break*/, 8];
                                case 7:
                                    error_16 = _a.sent();
                                    res.status(500).json({ error: "Failed to validate token" });
                                    return [3 /*break*/, 8];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Bulk operations
                    app.post("/api/operations/validate-proxies", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, operation, error_17;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.createOperation({
                                            userId: userId,
                                            type: "validate_proxies",
                                            status: "running",
                                            progress: 0,
                                            total: 0,
                                            results: null,
                                        })];
                                case 1:
                                    operation = _a.sent();
                                    // Start validation in background
                                    validateProxiesInBackground(operation.id, userId);
                                    res.json(operation);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_17 = _a.sent();
                                    res.status(500).json({ error: "Failed to start proxy validation" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/operations/validate-tokens", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, operation, error_18;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.createOperation({
                                            userId: userId,
                                            type: "validate_tokens",
                                            status: "running",
                                            progress: 0,
                                            total: 0,
                                            results: null,
                                        })];
                                case 1:
                                    operation = _a.sent();
                                    // Start validation in background
                                    validateTokensInBackground(operation.id, userId);
                                    res.json(operation);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_18 = _a.sent();
                                    res.status(500).json({ error: "Failed to start token validation" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/operations/username-lookup", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, operation, error_19;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.createOperation({
                                            userId: userId,
                                            type: "username_lookup",
                                            status: "running",
                                            progress: 0,
                                            total: 0,
                                            results: null,
                                        })];
                                case 1:
                                    operation = _a.sent();
                                    // Start lookup in background
                                    usernameLookupInBackground(operation.id, userId);
                                    res.json(operation);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_19 = _a.sent();
                                    res.status(500).json({ error: "Failed to start username lookup" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/operations/active", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, operation, error_20;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.getActiveOperation(userId)];
                                case 1:
                                    operation = _a.sent();
                                    res.json(operation);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_20 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch active operation" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/operations", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, operations, error_21;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId = req.user.id;
                                    return [4 /*yield*/, storage.getOperations(userId)];
                                case 1:
                                    operations = _a.sent();
                                    res.json(operations);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_21 = _a.sent();
                                    res.status(500).json({ error: "Failed to fetch operations" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Export routes
                    app.get("/api/export/proxies", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, status_3, proxies, csv, error_22;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    userId = req.user.id;
                                    status_3 = req.query.status;
                                    proxies = void 0;
                                    if (!status_3) return [3 /*break*/, 2];
                                    return [4 /*yield*/, storage.getProxiesByStatus(status_3, userId)];
                                case 1:
                                    proxies = _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, storage.getProxies(userId)];
                                case 3:
                                    proxies = _a.sent();
                                    _a.label = 4;
                                case 4:
                                    res.setHeader('Content-Type', 'text/csv');
                                    res.setHeader('Content-Disposition', 'attachment; filename="proxies.csv"');
                                    csv = proxies.map(function (proxy) {
                                        return "".concat(proxy.host, ":").concat(proxy.port).concat(proxy.username ? ":".concat(proxy.username, ":").concat(proxy.password) : '');
                                    }).join('\n');
                                    res.send(csv);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_22 = _a.sent();
                                    res.status(500).json({ error: "Failed to export proxies" });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.get("/api/export/tokens", isAuthenticated, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, status_4, tokens, csv, error_23;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    userId = req.user.id;
                                    status_4 = req.query.status;
                                    tokens = void 0;
                                    if (!status_4) return [3 /*break*/, 2];
                                    return [4 /*yield*/, storage.getTokensByStatus(status_4, userId)];
                                case 1:
                                    tokens = _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, storage.getTokens(userId)];
                                case 3:
                                    tokens = _a.sent();
                                    _a.label = 4;
                                case 4:
                                    res.setHeader('Content-Type', 'text/csv');
                                    res.setHeader('Content-Disposition', 'attachment; filename="tokens.csv"');
                                    csv = tokens.map(function (token) {
                                        return "".concat(token.token).concat(token.username ? ",".concat(token.username) : '');
                                    }).join('\n');
                                    res.send(csv);
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_23 = _a.sent();
                                    res.status(500).json({ error: "Failed to export tokens" });
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // File upload routes
                    app.post("/api/upload/proxies", isAuthenticated, upload.single('file'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var filePath, userId, content, lines, proxies, errors, i, line, parts, host, portStr, username, password, port, validatedProxies, createdProxies, error_24;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    filePath = null;
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 3, 4, 5]);
                                    userId = req.user.id;
                                    if (!req.file) {
                                        return [2 /*return*/, res.status(400).json({ error: "No file uploaded" })];
                                    }
                                    filePath = req.file.path;
                                    if (!filePath) {
                                        return [2 /*return*/, res.status(400).json({ error: "Invalid file path" })];
                                    }
                                    // Validate file exists and is readable
                                    if (!fs.existsSync(filePath)) {
                                        return [2 /*return*/, res.status(400).json({ error: "Uploaded file not found" })];
                                    }
                                    content = fs.readFileSync(filePath, 'utf8');
                                    lines = content.split('\n').filter(function (line) { return line.trim(); });
                                    if (lines.length === 0) {
                                        return [2 /*return*/, res.status(400).json({ error: "File is empty or contains no valid proxy entries" })];
                                    }
                                    proxies = [];
                                    errors = [];
                                    for (i = 0; i < lines.length; i++) {
                                        line = lines[i].trim();
                                        if (!line)
                                            continue;
                                        parts = line.split(':');
                                        if (parts.length < 2) {
                                            errors.push("Line ".concat(i + 1, ": Invalid format. Expected host:port[:username:password]"));
                                            continue;
                                        }
                                        host = parts[0].trim();
                                        portStr = parts[1].trim();
                                        username = ((_a = parts[2]) === null || _a === void 0 ? void 0 : _a.trim()) || null;
                                        password = ((_b = parts[3]) === null || _b === void 0 ? void 0 : _b.trim()) || null;
                                        if (!host) {
                                            errors.push("Line ".concat(i + 1, ": Host is required"));
                                            continue;
                                        }
                                        port = parseInt(portStr, 10);
                                        if (isNaN(port) || port < 1 || port > 65535) {
                                            errors.push("Line ".concat(i + 1, ": Invalid port number: ").concat(portStr));
                                            continue;
                                        }
                                        proxies.push({
                                            userId: userId,
                                            host: host,
                                            port: port,
                                            username: username,
                                            password: password,
                                            status: "unchecked",
                                            responseTime: null,
                                            failureCount: 0,
                                        });
                                    }
                                    if (proxies.length === 0) {
                                        return [2 /*return*/, res.status(400).json({
                                                error: "No valid proxies found in file",
                                                details: errors.slice(0, 10) // Show first 10 errors
                                            })];
                                    }
                                    validatedProxies = proxies.map(function (proxy) {
                                        try {
                                            return insertProxySchema.parse(proxy);
                                        }
                                        catch (validationError) {
                                            throw new Error("Proxy validation failed: ".concat(validationError));
                                        }
                                    });
                                    return [4 /*yield*/, storage.createProxies(validatedProxies)];
                                case 2:
                                    createdProxies = _c.sent();
                                    res.json(__assign({ success: true, count: createdProxies.length, proxies: createdProxies }, (errors.length > 0 && { warnings: errors.slice(0, 5) }) // Show first 5 warnings
                                    ));
                                    return [3 /*break*/, 5];
                                case 3:
                                    error_24 = _c.sent();
                                    console.error("Error processing proxy file:", error_24);
                                    res.status(500).json({
                                        error: "Failed to process proxy file",
                                        details: error_24 instanceof Error ? error_24.message : "Unknown error"
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    // Clean up uploaded file
                                    if (filePath && fs.existsSync(filePath)) {
                                        try {
                                            fs.unlinkSync(filePath);
                                        }
                                        catch (cleanupError) {
                                            console.error("Failed to clean up uploaded file:", cleanupError);
                                        }
                                    }
                                    return [7 /*endfinally*/];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    app.post("/api/upload/tokens", isAuthenticated, upload.single('file'), function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var userId_3, fs_1, content, lines, tokens, createdTokens, error_25;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    userId_3 = req.user.id;
                                    if (!req.file) {
                                        return [2 /*return*/, res.status(400).json({ error: "No file uploaded" })];
                                    }
                                    fs_1 = require('fs');
                                    content = fs_1.readFileSync(req.file.path, 'utf8');
                                    lines = content.split('\n').filter(function (line) { return line.trim(); });
                                    tokens = lines.map(function (line) {
                                        var parts = line.trim().split(',');
                                        var token = parts[0];
                                        var username = parts[1] || null;
                                        if (!token)
                                            return null;
                                        return {
                                            userId: userId_3,
                                            token: token.startsWith('oauth:') ? token : "oauth:".concat(token),
                                            username: username,
                                            status: "unchecked",
                                            loginCredentials: null,
                                        };
                                    }).filter(function (token) { return token !== null; });
                                    return [4 /*yield*/, storage.createTokens(tokens)];
                                case 1:
                                    createdTokens = _a.sent();
                                    // Clean up uploaded file
                                    fs_1.unlinkSync(req.file.path);
                                    res.json(createdTokens);
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_25 = _a.sent();
                                    res.status(500).json({ error: "Failed to process token file" });
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    httpServer = createServer(app);
                    return [2 /*return*/, httpServer];
            }
        });
    });
}
