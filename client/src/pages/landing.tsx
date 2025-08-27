import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key, Shield, RefreshCw, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            n3Token - Twitch OAuth Token Manager
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bulk maanage Twitch OAuth tokens with proxies and advanced
            validation, rotation, and monitoring capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5 text-purple-600" />
                Token Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Import, validate, and manage OAuth tokens with automatic
                username lookup, expiration tracking, and detailed user profile
                information.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-blue-600" />
                Proxied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All API requests run through validated proxies with automatic
                rotation, failover, and rate limit handling for maximum
                reliability.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-green-600" />
                Bulk Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Process hundreds of tokens and proxies simultaneously with
                background validation and real-time progress tracking.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-orange-600" />
                User Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View complete user information including profile pictures, bios,
                and account creation dates for validated tokens.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={() => (window.location.href = "/auth")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            Log In to Get Started
          </Button>
          <p className="mt-4 text-sm text-gray-500">
            Create an account or login to access the token manager.
          </p>
        </div>
      </div>
    </div>
  );
}
