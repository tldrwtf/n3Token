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
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
export function getSession() {
    var sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    var sessionStore;
    if (process.env.DATABASE_URL) {
        // Use PostgreSQL store if database is available
        var pgStore = connectPg(session);
        sessionStore = new pgStore({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
            ttl: sessionTtl,
            tableName: "sessions",
        });
    }
    else {
        // Use memory store for development
        var MemoryStoreClass = MemoryStore(session);
        sessionStore = new MemoryStoreClass({
            checkPeriod: 86400000, // prune expired entries every 24h
        });
    }
    return session({
        secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: sessionTtl,
        },
    });
}
export function setupAuth(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.set("trust proxy", 1);
            app.use(getSession());
            app.use(passport.initialize());
            app.use(passport.session());
            // Local strategy for username/password authentication
            passport.use(new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password'
            }, function (email, password, done) { return __awaiter(_this, void 0, void 0, function () {
                var user, isValidPassword, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, storage.getUserByEmail(email)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, done(null, false, { message: 'Invalid email or password' })];
                            }
                            return [4 /*yield*/, bcrypt.compare(password, user.passwordHash || '')];
                        case 2:
                            isValidPassword = _a.sent();
                            if (!isValidPassword) {
                                return [2 /*return*/, done(null, false, { message: 'Invalid email or password' })];
                            }
                            return [2 /*return*/, done(null, user)];
                        case 3:
                            error_1 = _a.sent();
                            return [2 /*return*/, done(error_1)];
                        case 4: return [2 /*return*/];
                    }
                });
            }); }));
            passport.serializeUser(function (user, cb) { return cb(null, user.id); });
            passport.deserializeUser(function (id, cb) { return __awaiter(_this, void 0, void 0, function () {
                var user, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, storage.getUser(id)];
                        case 1:
                            user = _a.sent();
                            cb(null, user);
                            return [3 /*break*/, 3];
                        case 2:
                            error_2 = _a.sent();
                            cb(error_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Login route
            app.post("/api/login", function (req, res, next) {
                passport.authenticate("local", function (err, user, info) {
                    if (err) {
                        return res.status(500).json({ message: "Authentication error" });
                    }
                    if (!user) {
                        return res.status(401).json({ message: (info === null || info === void 0 ? void 0 : info.message) || "Invalid credentials" });
                    }
                    req.logIn(user, function (err) {
                        if (err) {
                            return res.status(500).json({ message: "Login error" });
                        }
                        return res.json({
                            message: "Login successful",
                            user: {
                                id: user.id,
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName
                            }
                        });
                    });
                })(req, res, next);
            });
            // Register route
            app.post("/api/register", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, email, password, firstName, lastName, existingUser, passwordHash, user, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            _a = req.body, email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName;
                            if (!email || !password) {
                                return [2 /*return*/, res.status(400).json({ message: "Email and password are required" })];
                            }
                            return [4 /*yield*/, storage.getUserByEmail(email)];
                        case 1:
                            existingUser = _b.sent();
                            if (existingUser) {
                                return [2 /*return*/, res.status(400).json({ message: "User already exists" })];
                            }
                            return [4 /*yield*/, bcrypt.hash(password, 12)];
                        case 2:
                            passwordHash = _b.sent();
                            return [4 /*yield*/, storage.upsertUser({
                                    id: nanoid(),
                                    email: email,
                                    firstName: firstName || '',
                                    lastName: lastName || '',
                                    passwordHash: passwordHash,
                                })];
                        case 3:
                            user = _b.sent();
                            res.json({
                                message: "Registration successful",
                                user: {
                                    id: user.id,
                                    email: user.email,
                                    firstName: user.firstName,
                                    lastName: user.lastName
                                }
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_3 = _b.sent();
                            console.error("Registration error:", error_3);
                            res.status(500).json({ message: "Registration failed" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Logout route
            app.post("/api/logout", function (req, res) {
                req.logout(function (err) {
                    if (err) {
                        return res.status(500).json({ message: "Logout error" });
                    }
                    res.json({ message: "Logout successful" });
                });
            });
            return [2 /*return*/];
        });
    });
}
export var isAuthenticated = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (!req.isAuthenticated()) {
            return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
        }
        next();
        return [2 /*return*/];
    });
}); };
