import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Search, RefreshCw, Download, FileText } from "lucide-react";
import ProgressIndicator from "@/components/ui/progress-indicator";
import { apiRequest } from "@/lib/queryClient";

export default function OperationsTab() {
  const [useProxy, setUseProxy] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);
  const [autoRemove, setAutoRemove] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeOperation } = useQuery({
    queryKey: ["/api/operations/active"],
    refetchInterval: 2000,
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ["/api/tokens"],
  });

  const { data: proxies = [] } = useQuery({
    queryKey: ["/api/proxies"],
  });

  const startValidationMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", `/api/operations/${type}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations/active"] });
      toast({
        title: "Operation Started",
        description: "Bulk operation is running in the background",
      });
    },
  });

  const handleStartOperation = (type: string) => {
    startValidationMutation.mutate(type);
  };

  const handleExport = (type: string) => {
    const baseUrl = `/api/export/${type}`;
    const url = type === "tokens" ? `${baseUrl}?status=valid` : `${baseUrl}?status=valid`;
    window.open(url, "_blank");
  };

  const getProgressPercentage = () => {
    if (!activeOperation || activeOperation.total === 0) return 0;
    return (activeOperation.progress / activeOperation.total) * 100;
  };

  const getResults = () => {
    if (!activeOperation?.results) return null;
    try {
      return JSON.parse(activeOperation.results);
    } catch {
      return null;
    }
  };

  const results = getResults();

  return (
    <div className="space-y-6">
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
                  <Checkbox
                    id="use-proxy"
                    checked={useProxy}
                    onCheckedChange={setUseProxy}
                  />
                  <Label htmlFor="use-proxy" className="text-sm text-gray-700">
                    Use proxy rotation
                  </Label>
                </div>
                <Button
                  onClick={() => handleStartOperation("validate-tokens")}
                  disabled={startValidationMutation.isPending}
                  className="bg-primary hover:bg-blue-700"
                >
                  Start Validation
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Username Lookup</h3>
              <p className="text-sm text-gray-600 mb-3">Reverse lookup usernames for all tokens</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skip-existing"
                    checked={skipExisting}
                    onCheckedChange={setSkipExisting}
                  />
                  <Label htmlFor="skip-existing" className="text-sm text-gray-700">
                    Skip existing usernames
                  </Label>
                </div>
                <Button
                  onClick={() => handleStartOperation("username-lookup")}
                  disabled={startValidationMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Start Lookup
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Proxy Validation</h3>
              <p className="text-sm text-gray-600 mb-3">Test all proxy servers for connectivity</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="auto-remove"
                    checked={autoRemove}
                    onCheckedChange={setAutoRemove}
                  />
                  <Label htmlFor="auto-remove" className="text-sm text-gray-700">
                    Remove failed proxies
                  </Label>
                </div>
                <Button
                  onClick={() => handleStartOperation("validate-proxies")}
                  disabled={startValidationMutation.isPending}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
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
            {activeOperation ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {activeOperation.type === "validate_tokens" && "Token Validation"}
                    {activeOperation.type === "validate_proxies" && "Proxy Validation"}
                    {activeOperation.type === "username_lookup" && "Username Lookup"}
                  </h3>
                  <span className="text-sm text-gray-500 capitalize">{activeOperation.status}</span>
                </div>
                <Progress value={getProgressPercentage()} className="w-full mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{activeOperation.progress} / {activeOperation.total} processed</span>
                  <span>
                    {activeOperation.status === "running" ? "In progress..." : "Complete"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-500 text-center">No active operations</p>
              </div>
            )}

            {results && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Recent Results</h3>
                <div className="space-y-2">
                  {results.valid !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valid items found</span>
                      <span className="font-medium text-green-600">{results.valid}</span>
                    </div>
                  )}
                  {results.invalid !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Invalid items found</span>
                      <span className="font-medium text-red-600">{results.invalid}</span>
                    </div>
                  )}
                  {results.resolved !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Usernames resolved</span>
                      <span className="font-medium text-blue-600">{results.resolved}</span>
                    </div>
                  )}
                  {results.expired !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expired tokens</span>
                      <span className="font-medium text-yellow-600">{results.expired}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <Button
                onClick={() => handleExport("tokens")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Valid ({tokens.filter((t: any) => t.status === "valid").length})
              </Button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Working Proxies</h3>
              <p className="text-sm text-gray-600 mb-3">Export all validated proxy servers</p>
              <Button
                onClick={() => handleExport("proxies")}
                className="w-full bg-primary hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Valid ({proxies.filter((p: any) => p.status === "valid").length})
              </Button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Complete Dataset</h3>
              <p className="text-sm text-gray-600 mb-3">Export all data with status information</p>
              <Button
                onClick={() => {
                  handleExport("tokens");
                  handleExport("proxies");
                }}
                className="w-full bg-gray-600 hover:bg-gray-700"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <ProgressIndicator operation={activeOperation} />
    </div>
  );
}
