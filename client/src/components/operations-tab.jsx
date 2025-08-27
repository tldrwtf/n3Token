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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Search, Download, FileText } from "lucide-react";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { apiRequest } from "@/lib/queryClient";
export default function OperationsTab() {
    var _this = this;
    var _a = useState(false), useProxy = _a[0], setUseProxy = _a[1];
    var _b = useState(true), skipExisting = _b[0], setSkipExisting = _b[1];
    var _c = useState(false), autoRemove = _c[0], setAutoRemove = _c[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var activeOperation = useQuery({
        queryKey: ["/api/operations/active"],
        refetchInterval: 2000,
    }).data;
    var _d = useQuery({
        queryKey: ["/api/tokens"],
    }).data, tokens = _d === void 0 ? [] : _d;
    var _e = useQuery({
        queryKey: ["/api/proxies"],
    }).data, proxies = _e === void 0 ? [] : _e;
    var startValidationMutation = useMutation({
        mutationFn: function (type) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/operations/".concat(type))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/operations/active"] });
            toast({
                title: "Operation Started",
                description: "Bulk operation is running in the background",
            });
        },
    });
    var handleStartOperation = function (type) {
        startValidationMutation.mutate(type);
    };
    var handleExport = function (type) {
        var baseUrl = "/api/export/".concat(type);
        var url = type === "tokens" ? "".concat(baseUrl, "?status=valid") : "".concat(baseUrl, "?status=valid");
        window.open(url, "_blank");
    };
    var getProgressPercentage = function () {
        if (!activeOperation || activeOperation.total === 0)
            return 0;
        return (activeOperation.progress / activeOperation.total) * 100;
    };
    var getResults = function () {
        if (!(activeOperation === null || activeOperation === void 0 ? void 0 : activeOperation.results))
            return null;
        try {
            return JSON.parse(activeOperation.results);
        }
        catch (_a) {
            return null;
        }
    };
    var results = getResults();
    return (<div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Operations Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Bulk Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Token Validation</h3>
              <p className="text-sm text-gray-600 mb-3">Validate all tokens and update their status</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="use-proxy" checked={useProxy} onCheckedChange={setUseProxy}/>
                  <Label htmlFor="use-proxy" className="text-sm text-gray-700">
                    Use proxy rotation
                  </Label>
                </div>
                <Button onClick={function () { return handleStartOperation("validate-tokens"); }} disabled={startValidationMutation.isPending} className="bg-primary hover:bg-blue-700">
                  Start Validation
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Username Lookup</h3>
              <p className="text-sm text-gray-600 mb-3">Reverse lookup usernames for all tokens</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="skip-existing" checked={skipExisting} onCheckedChange={setSkipExisting}/>
                  <Label htmlFor="skip-existing" className="text-sm text-gray-700">
                    Skip existing usernames
                  </Label>
                </div>
                <Button onClick={function () { return handleStartOperation("username-lookup"); }} disabled={startValidationMutation.isPending} className="bg-green-600 hover:bg-green-700">
                  <Search className="mr-2 h-4 w-4"/>
                  Start Lookup
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Proxy Validation</h3>
              <p className="text-sm text-gray-600 mb-3">Test all proxy servers for connectivity</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-remove" checked={autoRemove} onCheckedChange={setAutoRemove}/>
                  <Label htmlFor="auto-remove" className="text-sm text-gray-700">
                    Remove failed proxies
                  </Label>
                </div>
                <Button onClick={function () { return handleStartOperation("validate-proxies"); }} disabled={startValidationMutation.isPending} className="bg-yellow-600 hover:bg-yellow-700">
                  <CheckCircle className="mr-2 h-4 w-4"/>
                  Start Validation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress & Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Operation Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeOperation ? (<div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {activeOperation.type === "validate_tokens" && "Token Validation"}
                    {activeOperation.type === "validate_proxies" && "Proxy Validation"}
                    {activeOperation.type === "username_lookup" && "Username Lookup"}
                  </h3>
                  <span className="text-sm text-gray-500 capitalize">{activeOperation.status}</span>
                </div>
                <Progress value={getProgressPercentage()} className="w-full mb-2"/>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{activeOperation.progress} / {activeOperation.total} processed</span>
                  <span>
                    {activeOperation.status === "running" ? "In progress..." : "Complete"}
                  </span>
                </div>
              </div>) : (<div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 text-center">No active operations</p>
              </div>)}

            {results && (<div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Recent Results</h3>
                <div className="space-y-2">
                  {results.valid !== undefined && (<div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valid items found</span>
                      <span className="font-medium text-green-600">{results.valid}</span>
                    </div>)}
                  {results.invalid !== undefined && (<div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Invalid items found</span>
                      <span className="font-medium text-red-600">{results.invalid}</span>
                    </div>)}
                  {results.resolved !== undefined && (<div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Usernames resolved</span>
                      <span className="font-medium text-blue-600">{results.resolved}</span>
                    </div>)}
                  {results.expired !== undefined && (<div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expired tokens</span>
                      <span className="font-medium text-yellow-600">{results.expired}</span>
                    </div>)}
                </div>
              </div>)}
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Valid Tokens</h3>
              <p className="text-sm text-gray-600 mb-3">Export all valid tokens with usernames</p>
              <Button onClick={function () { return handleExport("tokens"); }} className="w-full bg-green-600 hover:bg-green-700">
                <Download className="mr-2 h-4 w-4"/>
                Export Valid ({tokens.filter(function (t) { return t.status === "valid"; }).length})
              </Button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Working Proxies</h3>
              <p className="text-sm text-gray-600 mb-3">Export all validated proxy servers</p>
              <Button onClick={function () { return handleExport("proxies"); }} className="w-full bg-primary hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4"/>
                Export Valid ({proxies.filter(function (p) { return p.status === "valid"; }).length})
              </Button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Complete Dataset</h3>
              <p className="text-sm text-gray-600 mb-3">Export all data with status information</p>
              <Button onClick={function () {
            handleExport("tokens");
            handleExport("proxies");
        }} className="w-full bg-gray-600 hover:bg-gray-700">
                <FileText className="mr-2 h-4 w-4"/>
                Export All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <ProgressIndicator operation={activeOperation}/>
    </div>);
}
