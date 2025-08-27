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
import { storage } from '../storage';
var TwitchApiService = /** @class */ (function () {
    function TwitchApiService() {
        this.baseUrl = 'https://api.twitch.tv/helix';
        this.authUrl = 'https://id.twitch.tv/oauth2';
        this.rateLimitInfo = { limit: 800, remaining: 800, reset: 0 };
        this.clientId = process.env.TWITCH_CLIENT_ID || process.env.VITE_TWITCH_CLIENT_ID || '';
        this.clientSecret = process.env.TWITCH_CLIENT_SECRET || process.env.VITE_TWITCH_CLIENT_SECRET || '';
        if (!this.clientId || !this.clientSecret) {
            console.warn('Twitch API credentials not found. Some features may not work.');
        }
    }
    TwitchApiService.prototype.makeRequest = function (url_1, options_1, userId_1) {
        return __awaiter(this, arguments, void 0, function (url, options, userId, retries) {
            var lastError, _loop_1, this_1, attempt, state_1;
            if (retries === void 0) { retries = 3; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lastError = null;
                        _loop_1 = function (attempt) {
                            var proxy, proxyHeaders, response, limit, remaining, reset, retryAfter, waitTime_1, error_1, waitTime_2;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 13, , 16]);
                                        proxy = void 0;
                                        if (!userId) return [3 /*break*/, 3];
                                        return [4 /*yield*/, storage.getNextValidProxy(userId)];
                                    case 1:
                                        proxy = _b.sent();
                                        if (!proxy) {
                                            throw new Error('No valid proxies available. Please add and validate proxies first.');
                                        }
                                        console.log("Using proxy: ".concat(proxy.host, ":").concat(proxy.port, " for request to ").concat(url));
                                        // Update proxy last used time
                                        return [4 /*yield*/, storage.updateProxy(proxy.id, userId, {
                                                lastUsedAt: new Date()
                                            })];
                                    case 2:
                                        // Update proxy last used time
                                        _b.sent();
                                        _b.label = 3;
                                    case 3:
                                        proxyHeaders = proxy ? __assign({ 'X-Proxy-Used': "".concat(proxy.host, ":").concat(proxy.port) }, options.headers) : options.headers;
                                        return [4 /*yield*/, fetch(url, __assign(__assign({}, options), { headers: proxyHeaders }))];
                                    case 4:
                                        response = _b.sent();
                                        limit = response.headers.get('Ratelimit-Limit');
                                        remaining = response.headers.get('Ratelimit-Remaining');
                                        reset = response.headers.get('Ratelimit-Reset');
                                        if (limit)
                                            this_1.rateLimitInfo.limit = parseInt(limit);
                                        if (remaining)
                                            this_1.rateLimitInfo.remaining = parseInt(remaining);
                                        if (reset)
                                            this_1.rateLimitInfo.reset = parseInt(reset);
                                        if (!(response.status === 429)) return [3 /*break*/, 8];
                                        retryAfter = response.headers.get('Retry-After');
                                        waitTime_1 = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
                                        console.log("Rate limited. Waiting ".concat(waitTime_1, "ms before retry..."));
                                        if (!proxy) return [3 /*break*/, 6];
                                        return [4 /*yield*/, storage.updateProxy(proxy.id, userId, {
                                                status: 'rate_limited',
                                                lastChecked: new Date()
                                            })];
                                    case 5:
                                        _b.sent();
                                        _b.label = 6;
                                    case 6: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime_1); })];
                                    case 7:
                                        _b.sent();
                                        return [2 /*return*/, "continue"];
                                    case 8:
                                        if (!(response.ok && proxy)) return [3 /*break*/, 10];
                                        return [4 /*yield*/, storage.updateProxy(proxy.id, userId, {
                                                status: 'valid',
                                                failureCount: 0,
                                                responseTime: Date.now() - new Date(proxy.lastUsedAt || new Date()).getTime()
                                            })];
                                    case 9:
                                        _b.sent();
                                        _b.label = 10;
                                    case 10:
                                        if (!(!response.ok && proxy)) return [3 /*break*/, 12];
                                        return [4 /*yield*/, storage.updateProxy(proxy.id, userId, {
                                                failureCount: proxy.failureCount + 1,
                                                status: proxy.failureCount >= 2 ? 'invalid' : proxy.status,
                                                lastChecked: new Date()
                                            })];
                                    case 11:
                                        _b.sent();
                                        _b.label = 12;
                                    case 12: return [2 /*return*/, { value: response }];
                                    case 13:
                                        error_1 = _b.sent();
                                        lastError = error_1;
                                        if (!(attempt < retries - 1)) return [3 /*break*/, 15];
                                        waitTime_2 = Math.pow(2, attempt) * 1000;
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime_2); })];
                                    case 14:
                                        _b.sent();
                                        _b.label = 15;
                                    case 15: return [3 /*break*/, 16];
                                    case 16: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempt < retries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: throw lastError || new Error('Request failed after retries');
                }
            });
        });
    };
    TwitchApiService.prototype.validateToken = function (token, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest("".concat(this.authUrl, "/validate"), {
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer ".concat(token.replace('oauth:', '')),
                                },
                            }, userId)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, { valid: false, error: "HTTP ".concat(response.status) }];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, {
                                valid: true,
                                username: data.login,
                                expiresIn: data.expires_in,
                            }];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, { valid: false, error: error_2 instanceof Error ? error_2.message : 'Unknown error' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TwitchApiService.prototype.getUserByToken = function (token, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, user, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest("".concat(this.baseUrl, "/users"), {
                                method: 'GET',
                                headers: {
                                    'Authorization': "Bearer ".concat(token.replace('oauth:', '')),
                                    'Client-Id': this.clientId,
                                },
                            }, userId)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, { error: "HTTP ".concat(response.status) }];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        if (data.data.length === 0) {
                            return [2 /*return*/, { error: 'No user found' }];
                        }
                        user = data.data[0];
                        return [2 /*return*/, {
                                username: user.login,
                                displayName: user.display_name,
                                description: user.description,
                                profileImageUrl: user.profile_image_url,
                                createdAt: user.created_at
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, { error: error_3 instanceof Error ? error_3.message : 'Unknown error' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TwitchApiService.prototype.refreshToken = function (refreshToken, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest("".concat(this.authUrl, "/token"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: new URLSearchParams({
                                    grant_type: 'refresh_token',
                                    refresh_token: refreshToken,
                                    client_id: this.clientId,
                                    client_secret: this.clientSecret,
                                }),
                            }, userId)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, { error: "HTTP ".concat(response.status) }];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, { token: "oauth:".concat(data.access_token) }];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, { error: error_4 instanceof Error ? error_4.message : 'Unknown error' }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TwitchApiService.prototype.testProxy = function (proxyConfig, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, response, responseTime, error_5, responseTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.makeRequest("".concat(this.baseUrl, "/users"), {
                                method: 'GET',
                                headers: {
                                    'Client-Id': this.clientId,
                                },
                            }, userId)];
                    case 2:
                        response = _a.sent();
                        responseTime = Date.now() - startTime;
                        if (response.ok) {
                            return [2 /*return*/, { valid: true, responseTime: responseTime }];
                        }
                        else {
                            return [2 /*return*/, { valid: false, error: "HTTP ".concat(response.status), responseTime: responseTime }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        responseTime = Date.now() - startTime;
                        return [2 /*return*/, { valid: false, error: error_5 instanceof Error ? error_5.message : 'Unknown error', responseTime: responseTime }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TwitchApiService.prototype.getRateLimitInfo = function () {
        return this.rateLimitInfo;
    };
    return TwitchApiService;
}());
export { TwitchApiService };
export var twitchApi = new TwitchApiService();
