import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function LogoutButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "Failed to log out",
      });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}