import { useState } from "react";
import { Shield, Download, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProxiesTab from "@/components/proxies-tab";
import TokensTab from "@/components/tokens-tab";
import OperationsTab from "@/components/operations-tab";
import { LogoutButton } from "@/components/logout-button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export default function Home() {
    var _a = useState("proxies"), activeTab = _a[0], setActiveTab = _a[1];
    var user = useAuth().user;
    var _b = useQuery({
        queryKey: ["/api/proxies"],
    }).data, proxies = _b === void 0 ? [] : _b;
    var _c = useQuery({
        queryKey: ["/api/tokens"],
    }).data, tokens = _c === void 0 ? [] : _c;
    var handleExportAll = function () {
        window.open("/api/export/proxies", "_blank");
        window.open("/api/export/tokens", "_blank");
    };
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary text-2xl mr-3"/>
              <h1 className="text-xl font-semibold text-gray-900">
                n3Token Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleExportAll} className="bg-primary hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4"/>
                Export All
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5"/>
              </Button>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user === null || user === void 0 ? void 0 : user.profileImageUrl) || ""}/>
                  <AvatarFallback>
                    <User className="h-4 w-4"/>
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">
                  {(user === null || user === void 0 ? void 0 : user.firstName) || (user === null || user === void 0 ? void 0 : user.email)}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proxies" className="flex items-center space-x-2">
              <span>Proxies</span>
            </TabsTrigger>
            <TabsTrigger value="tokens" className="flex items-center space-x-2">
              <span>OAuth Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center space-x-2">
              <span>Bulk Operations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="proxies" className="mt-6">
            <ProxiesTab />
          </TabsContent>

          <TabsContent value="tokens" className="mt-6">
            <TokensTab />
          </TabsContent>

          <TabsContent value="operations" className="mt-6">
            <OperationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}
