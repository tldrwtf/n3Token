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
  const [proxyInput, setProxyInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proxies = [], isLoading } = useQuery({
    queryKey: ["/api/proxies"],
  });

  const importProxiesMutation = useMutation({
    mutationFn: async (proxies: any[]) => {
      const response = await apiRequest("POST", "/api/proxies/bulk", { proxies });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
      toast({
        title: "Success",
        description: "Proxies imported successfully",
      });
      setProxyInput("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import proxies",
        variant: "destructive",
      });
    },
  });

  const validateAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/operations/validate-proxies");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Validation Started",
        description: "Proxy validation is running in the background",
      });
    },
  });

  const testProxyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/proxies/${id}/test`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
      toast({
        title: "Test Complete",
        description: "Proxy test completed",
      });
    },
  });

  const deleteProxyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/proxies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
      toast({
        title: "Deleted",
        description: "Proxy deleted successfully",
      });
    },
  });

  const handleImportProxies = () => {
    if (!proxyInput.trim()) return;
    
    const lines = proxyInput.trim().split('\n');
    const proxies = lines.map(line => {
      const parts = line.trim().split(':');
      if (parts.length < 2) return null;
      
      return {
        host: parts[0],
        port: parseInt(parts[1]),
        username: parts[2] || null,
        password: parts[3] || null,
        status: "unchecked",
        responseTime: null,
      };
    }).filter(proxy => proxy !== null);

    importProxiesMutation.mutate(proxies);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload/proxies', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/proxies"] });
        toast({
          title: "Success",
          description: "Proxy file uploaded successfully",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload proxy file",
        variant: "destructive",
      });
    }
  };

  const handleRowAction = (action: string, proxy: any) => {
    switch (action) {
      case "test":
        testProxyMutation.mutate(proxy.id);
        break;
      case "delete":
        deleteProxyMutation.mutate(proxy.id);
        break;
    }
  };

  const columns = [
    {
      key: "host",
      label: "Proxy",
      render: (value: string, row: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{value}:{row.port}</div>
          {row.username && (
            <div className="text-sm text-gray-500">{row.username}:{row.password}</div>
          )}
        </div>
      ),
    },
    { key: "status", label: "Status" },
    {
      key: "responseTime",
      label: "Response Time",
      render: (value: number | null) => value ? `${value}ms` : "-",
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
    { value: "checking", label: "Checking" },
    { value: "unchecked", label: "Unchecked" },
  ];

  const actions = [
    { label: "Test", action: "test" },
    { label: "Delete", action: "delete", variant: "destructive" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Network className="mr-2 h-5 w-5" />
            Import Proxies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Upload File</Label>
              <FileUpload
                onFileUpload={handleFileUpload}
                accept=".txt,.csv"
                placeholder="Drop your proxy file here or click to browse"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Paste Proxies</Label>
              <Textarea
                placeholder="ip:port:username:password&#10;127.0.0.1:8080:user:pass"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
                className="h-32 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleImportProxies}
                disabled={!proxyInput.trim() || importProxiesMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Import Proxies
              </Button>
              <Button
                onClick={() => validateAllMutation.mutate()}
                disabled={validateAllMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
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
      <DataTable
        data={proxies}
        columns={columns}
        searchPlaceholder="Search proxies..."
        filterOptions={filterOptions}
        onRowAction={handleRowAction}
        actions={actions}
      />
    </div>
  );
}
