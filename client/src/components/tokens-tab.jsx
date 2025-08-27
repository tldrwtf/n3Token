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
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, Key, RefreshCw, ChevronDown, ChevronUp, Copy, User, Calendar } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import DataTable from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
export default function TokensTab() {
    var _this = this;
    var _a = useState(""), tokenInput = _a[0], setTokenInput = _a[1];
    var _b = useState(new Set()), expandedRows = _b[0], setExpandedRows = _b[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _c = useQuery({
        queryKey: ["/api/tokens"],
    }), _d = _c.data, tokens = _d === void 0 ? [] : _d, isLoading = _c.isLoading;
    var importTokensMutation = useMutation({
        mutationFn: function (tokens) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/tokens/bulk", { tokens: tokens })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
            toast({
                title: "Success",
                description: "Tokens imported successfully",
            });
            setTokenInput("");
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: "Failed to import tokens",
                variant: "destructive",
            });
        },
    });
    var validateAllMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/operations/validate-tokens")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Validation Started",
                description: "Token validation is running in the background",
            });
        },
    });
    var usernameLookupMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/operations/username-lookup")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Lookup Started",
                description: "Username lookup is running in the background",
            });
        },
    });
    var validateTokenMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/tokens/".concat(id, "/validate"))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
            toast({
                title: "Validation Complete",
                description: "Token validation completed",
            });
        },
    });
    var deleteTokenMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/tokens/".concat(id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
            toast({
                title: "Deleted",
                description: "Token deleted successfully",
            });
        },
    });
    var handleImportTokens = function () {
        if (!tokenInput.trim())
            return;
        var lines = tokenInput.trim().split('\n');
        var tokens = lines.map(function (line) {
            var parts = line.trim().split(',');
            var token = parts[0];
            var username = parts[1] || null;
            if (!token)
                return null;
            return {
                token: token.startsWith('oauth:') ? token : "oauth:".concat(token),
                username: username,
                status: "unchecked",
                loginCredentials: null,
            };
        }).filter(function (token) { return token !== null; });
        importTokensMutation.mutate(tokens);
    };
    var handleFileUpload = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var formData, response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formData = new FormData();
                    formData.append('file', file);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetch('/api/upload/tokens', {
                            method: 'POST',
                            body: formData,
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
                        toast({
                            title: "Success",
                            description: "Token file uploaded successfully",
                        });
                    }
                    else {
                        throw new Error('Upload failed');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    toast({
                        title: "Error",
                        description: "Failed to upload token file",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRowAction = function (action, token) {
        switch (action) {
            case "validate":
                validateTokenMutation.mutate(token.id);
                break;
            case "delete":
                deleteTokenMutation.mutate(token.id);
                break;
        }
    };
    var toggleRowExpansion = function (id) {
        setExpandedRows(function (prev) {
            var newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            }
            else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    var columns = [
        {
            key: "expand",
            label: "",
            render: function (_, row) { return (<Button variant="ghost" size="sm" onClick={function () { return toggleRowExpansion(row.id); }} className="h-8 w-8 p-0">
          {expandedRows.has(row.id) ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
        </Button>); },
        },
        {
            key: "token",
            label: "Token",
            render: function (value, row) { return (<div>
          <div className="text-sm font-mono text-gray-900">
            {value.substring(0, 15)}...{value.substring(value.length - 8)}
          </div>
          {expandedRows.has(row.id) && (<div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* User Profile Section */}
              {(row.profileImageUrl || row.displayName || row.description) && (<div className="border-b pb-4">
                  <div className="flex items-start space-x-4">
                    {row.profileImageUrl && (<Avatar className="h-16 w-16">
                        <AvatarImage src={row.profileImageUrl} alt={row.displayName || row.username}/>
                        <AvatarFallback>
                          <User className="h-8 w-8"/>
                        </AvatarFallback>
                      </Avatar>)}
                    <div className="flex-1">
                      {row.displayName && (<h4 className="font-semibold text-lg">{row.displayName}</h4>)}
                      {row.username && (<p className="text-sm text-gray-500">@{row.username}</p>)}
                      {row.description && (<p className="text-sm text-gray-700 mt-2">{row.description}</p>)}
                    </div>
                  </div>
                </div>)}
              
              {/* Account Details */}
              {row.accountCreatedAt && (<div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2"/>
                  <span>Account created: {new Date(row.accountCreatedAt).toLocaleDateString()}</span>
                </div>)}
              
              {/* Full Token */}
              <div>
                <Label className="text-sm font-medium">Full Token</Label>
                <div className="flex items-center mt-1">
                  <code className="text-xs bg-gray-100 p-2 rounded flex-1 overflow-x-auto">{value}</code>
                  <Button variant="ghost" size="sm" onClick={function () {
                        navigator.clipboard.writeText(value);
                        toast({ title: "Copied", description: "Token copied to clipboard" });
                    }} className="ml-2">
                    <Copy className="h-4 w-4"/>
                  </Button>
                </div>
              </div>
            </div>)}
        </div>); },
        },
        {
            key: "username",
            label: "Username",
            render: function (value, row) { return (<div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 mr-3">
            {row.profileImageUrl ? (<Avatar className="h-8 w-8">
                <AvatarImage src={row.profileImageUrl} alt={value || ""}/>
                <AvatarFallback>
                  <User className="h-4 w-4"/>
                </AvatarFallback>
              </Avatar>) : (<div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500"/>
              </div>)}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {value || "Unknown"}
          </div>
        </div>); },
        },
        {
            key: "status",
            label: "Status",
            render: function (value) {
                var statusColors = {
                    valid: "bg-green-100 text-green-800",
                    invalid: "bg-red-100 text-red-800",
                    expired: "bg-yellow-100 text-yellow-800",
                    checking: "bg-blue-100 text-blue-800",
                    unchecked: "bg-gray-100 text-gray-800",
                };
                return (<Badge className={statusColors[value] || statusColors.unchecked}>
            {value}
          </Badge>);
            },
        },
        {
            key: "expiresAt",
            label: "Expires",
            render: function (value) {
                if (!value)
                    return "Unknown";
                var date = new Date(value);
                var now = new Date();
                var diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? "".concat(diffDays, " days") : "Expired";
            },
        },
        {
            key: "lastChecked",
            label: "Last Checked",
            render: function (value) { return value ? new Date(value).toLocaleString() : "Never"; },
        },
    ];
    var filterOptions = [
        { value: "valid", label: "Valid" },
        { value: "invalid", label: "Invalid" },
        { value: "expired", label: "Expired" },
        { value: "checking", label: "Checking" },
        { value: "unchecked", label: "Unchecked" },
    ];
    var actions = [
        { label: "Validate", action: "validate" },
        { label: "Delete", action: "delete", variant: "destructive" },
    ];
    // Statistics
    var stats = {
        valid: tokens.filter(function (t) { return t.status === "valid"; }).length,
        invalid: tokens.filter(function (t) { return t.status === "invalid"; }).length,
        expired: tokens.filter(function (t) { return t.status === "expired"; }).length,
        checking: tokens.filter(function (t) { return t.status === "checking"; }).length,
    };
    return (<div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5"/>
            Import OAuth Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Upload Token File</Label>
              <FileUpload onFileUpload={handleFileUpload} accept=".txt,.csv,.json" placeholder="Drop your token file here or click to browse"/>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Paste Tokens</Label>
              <Textarea placeholder="oauth:token1&#10;oauth:token2&#10;..." value={tokenInput} onChange={function (e) { return setTokenInput(e.target.value); }} className="h-32 resize-none"/>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
              <Button onClick={handleImportTokens} disabled={!tokenInput.trim() || importTokensMutation.isPending} className="bg-primary hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4"/>
                Import Tokens
              </Button>
              <Button onClick={function () { return validateAllMutation.mutate(); }} disabled={validateAllMutation.isPending} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4"/>
                Validate All
              </Button>
              <Button onClick={function () { return usernameLookupMutation.mutate(); }} disabled={usernameLookupMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="mr-2 h-4 w-4"/>
                Lookup Usernames
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              Total: {tokens.length} tokens
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600"/>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Valid Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.valid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">×</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Invalid Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.invalid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">⏰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-blue-600"/>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Checking</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.checking}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token List */}
      <DataTable data={tokens} columns={columns} searchPlaceholder="Search tokens or usernames..." filterOptions={filterOptions} onRowAction={handleRowAction} actions={actions}/>
    </div>);
}
