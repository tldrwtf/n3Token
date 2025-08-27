import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle, Key, RefreshCw, ChevronDown, ChevronUp, Copy, User, Calendar, Image } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import DataTable from "@/components/ui/data-table";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function TokensTab() {
  const [tokenInput, setTokenInput] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tokens = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tokens"],
  });

  const importTokensMutation = useMutation({
    mutationFn: async (tokens: any[]) => {
      const response = await apiRequest("POST", "/api/tokens/bulk", { tokens });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Success",
        description: "Tokens imported successfully",
      });
      setTokenInput("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import tokens",
        variant: "destructive",
      });
    },
  });

  const validateAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/operations/validate-tokens");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Validation Started",
        description: "Token validation is running in the background",
      });
    },
  });

  const usernameLookupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/operations/username-lookup");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Lookup Started",
        description: "Username lookup is running in the background",
      });
    },
  });

  const validateTokenMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/tokens/${id}/validate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Validation Complete",
        description: "Token validation completed",
      });
    },
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tokens/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Deleted",
        description: "Token deleted successfully",
      });
    },
  });

  const handleImportTokens = () => {
    if (!tokenInput.trim()) return;
    
    const lines = tokenInput.trim().split('\n');
    const tokens = lines.map(line => {
      const parts = line.trim().split(',');
      const token = parts[0];
      const username = parts[1] || null;
      
      if (!token) return null;
      
      return {
        token: token.startsWith('oauth:') ? token : `oauth:${token}`,
        username,
        status: "unchecked",
        loginCredentials: null,
      };
    }).filter(token => token !== null);

    importTokensMutation.mutate(tokens);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload/tokens', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
        toast({
          title: "Success",
          description: "Token file uploaded successfully",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload token file",
        variant: "destructive",
      });
    }
  };

  const handleRowAction = (action: string, token: any) => {
    switch (action) {
      case "validate":
        validateTokenMutation.mutate(token.id);
        break;
      case "delete":
        deleteTokenMutation.mutate(token.id);
        break;
    }
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const columns = [
    {
      key: "expand",
      label: "",
      render: (_: any, row: any) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleRowExpansion(row.id)}
          className="h-8 w-8 p-0"
        >
          {expandedRows.has(row.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      ),
    },
    {
      key: "token",
      label: "Token",
      render: (value: string, row: any) => (
        <div>
          <div className="text-sm font-mono text-gray-900">
            {value.substring(0, 15)}...{value.substring(value.length - 8)}
          </div>
          {expandedRows.has(row.id) && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              {/* User Profile Section */}
              {(row.profileImageUrl || row.displayName || row.description) && (
                <div className="border-b pb-4">
                  <div className="flex items-start space-x-4">
                    {row.profileImageUrl && (
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={row.profileImageUrl} alt={row.displayName || row.username} />
                        <AvatarFallback>
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      {row.displayName && (
                        <h4 className="font-semibold text-lg">{row.displayName}</h4>
                      )}
                      {row.username && (
                        <p className="text-sm text-gray-500">@{row.username}</p>
                      )}
                      {row.description && (
                        <p className="text-sm text-gray-700 mt-2">{row.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Account Details */}
              {row.accountCreatedAt && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Account created: {new Date(row.accountCreatedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {/* Full Token */}
              <div>
                <Label className="text-sm font-medium">Full Token</Label>
                <div className="flex items-center mt-1">
                  <code className="text-xs bg-gray-100 p-2 rounded flex-1 overflow-x-auto">{value}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(value);
                      toast({ title: "Copied", description: "Token copied to clipboard" });
                    }}
                    className="ml-2"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "username",
      label: "Username",
      render: (value: string | null, row: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 mr-3">
            {row.profileImageUrl ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={row.profileImageUrl} alt={value || ""} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {value || "Unknown"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          valid: "bg-green-100 text-green-800",
          invalid: "bg-red-100 text-red-800",
          expired: "bg-yellow-100 text-yellow-800",
          checking: "bg-blue-100 text-blue-800",
          unchecked: "bg-gray-100 text-gray-800",
        };
        return (
          <Badge className={statusColors[value] || statusColors.unchecked}>
            {value}
          </Badge>
        );
      },
    },
    {
      key: "expiresAt",
      label: "Expires",
      render: (value: string | null) => {
        if (!value) return "Unknown";
        const date = new Date(value);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} days` : "Expired";
      },
    },
    {
      key: "lastChecked",
      label: "Last Checked",
      render: (value: string | null) => value ? new Date(value).toLocaleString() : "Never",
    },
  ];

  const filterOptions = [
    { value: "valid", label: "Valid" },
    { value: "invalid", label: "Invalid" },
    { value: "expired", label: "Expired" },
    { value: "checking", label: "Checking" },
    { value: "unchecked", label: "Unchecked" },
  ];

  const actions = [
    { label: "Validate", action: "validate" },
    { label: "Delete", action: "delete", variant: "destructive" as const },
  ];

  // Statistics
  const stats = {
    valid: tokens.filter((t) => t.status === "valid").length,
    invalid: tokens.filter((t) => t.status === "invalid").length,
    expired: tokens.filter((t) => t.status === "expired").length,
    checking: tokens.filter((t) => t.status === "checking").length,
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Import OAuth Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Upload Token File</Label>
              <FileUpload
                onFileUpload={handleFileUpload}
                accept=".txt,.csv,.json"
                placeholder="Drop your token file here or click to browse"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Paste Tokens</Label>
              <Textarea
                placeholder="oauth:token1&#10;oauth:token2&#10;..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="h-32 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleImportTokens}
                disabled={!tokenInput.trim() || importTokensMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Import Tokens
              </Button>
              <Button
                onClick={() => validateAllMutation.mutate()}
                disabled={validateAllMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Validate All
              </Button>
              <Button
                onClick={() => usernameLookupMutation.mutate()}
                disabled={usernameLookupMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
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
                  <RefreshCw className="h-4 w-4 text-blue-600" />
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
      <DataTable
        data={tokens}
        columns={columns}
        searchPlaceholder="Search tokens or usernames..."
        filterOptions={filterOptions}
        onRowAction={handleRowAction}
        actions={actions}
      />
    </div>
  );
}
