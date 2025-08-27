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
import { Plus, CheckCircle, Network } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import DataTable from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
export default function ProxiesTab() {
    var _this = this;
    var _a = useState(""), proxyInput = _a[0], setProxyInput = _a[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var _b = useQuery({
        queryKey: ["/api/proxies"],
    }), _c = _b.data, proxies = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var importProxiesMutation = useMutation({
        mutationFn: function (proxies) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/proxies/bulk", { proxies: proxies })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
            toast({
                title: "Success",
                description: "Proxies imported successfully",
            });
            setProxyInput("");
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: "Failed to import proxies",
                variant: "destructive",
            });
        },
    });
    var validateAllMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/operations/validate-proxies")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Validation Started",
                description: "Proxy validation is running in the background",
            });
        },
    });
    var testProxyMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/proxies/".concat(id, "/test"))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
            toast({
                title: "Test Complete",
                description: "Proxy test completed",
            });
        },
    });
    var deleteProxyMutation = useMutation({
        mutationFn: function (id) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/proxies/".concat(id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
            toast({
                title: "Deleted",
                description: "Proxy deleted successfully",
            });
        },
    });
    var handleImportProxies = function () {
        if (!proxyInput.trim())
            return;
        var lines = proxyInput.trim().split('\n');
        var proxies = lines.map(function (line) {
            var parts = line.trim().split(':');
            if (parts.length < 2)
                return null;
            return {
                host: parts[0],
                port: parseInt(parts[1]),
                username: parts[2] || null,
                password: parts[3] || null,
                status: "unchecked",
                responseTime: null,
            };
        }).filter(function (proxy) { return proxy !== null; });
        importProxiesMutation.mutate(proxies);
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
                    return [4 /*yield*/, fetch('/api/upload/proxies', {
                            method: 'POST',
                            body: formData,
                        })];
                case 2:
                    response = _a.sent();
                    if (response.ok) {
                        queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
                        toast({
                            title: "Success",
                            description: "Proxy file uploaded successfully",
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
                        description: "Failed to upload proxy file",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleRowAction = function (action, proxy) {
        switch (action) {
            case "test":
                testProxyMutation.mutate(proxy.id);
                break;
            case "delete":
                deleteProxyMutation.mutate(proxy.id);
                break;
        }
    };
    var columns = [
        {
            key: "host",
            label: "Proxy",
            render: function (value, row) { return (<div>
          <div className="text-sm font-medium text-gray-900">{value}:{row.port}</div>
          {row.username && (<div className="text-sm text-gray-500">{row.username}:{row.password}</div>)}
        </div>); },
        },
        { key: "status", label: "Status" },
        {
            key: "responseTime",
            label: "Response Time",
            render: function (value) { return value ? "".concat(value, "ms") : "-"; },
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
        { value: "checking", label: "Checking" },
        { value: "unchecked", label: "Unchecked" },
    ];
    var actions = [
        { label: "Test", action: "test" },
        { label: "Delete", action: "delete", variant: "destructive" },
    ];
    return (<div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5"/>
            Import Proxies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Upload File</Label>
              <FileUpload onFileUpload={handleFileUpload} accept=".txt,.csv" placeholder="Drop your proxy file here or click to browse"/>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Paste Proxies</Label>
              <Textarea placeholder="ip:port:username:password&#10;127.0.0.1:8080:user:pass" value={proxyInput} onChange={function (e) { return setProxyInput(e.target.value); }} className="h-32 resize-none"/>
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
              <Button onClick={handleImportProxies} disabled={!proxyInput.trim() || importProxiesMutation.isPending} className="bg-primary hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4"/>
                Import Proxies
              </Button>
              <Button onClick={function () { return validateAllMutation.mutate(); }} disabled={validateAllMutation.isPending} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4"/>
                Validate All
              </Button>
            </div>
            <span className="text-sm text-gray-500">
              Total: {proxies.length} proxies
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Proxy List */}
      <DataTable data={proxies} columns={columns} searchPlaceholder="Search proxies..." filterOptions={filterOptions} onRowAction={handleRowAction} actions={actions}/>
    </div>);
}
