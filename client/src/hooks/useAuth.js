import { useQuery } from "@tanstack/react-query";
export function useAuth() {
    var _a = useQuery({
        queryKey: ["/api/auth/user"],
        retry: false,
    }), user = _a.data, isLoading = _a.isLoading;
    return {
        user: user,
        isLoading: isLoading,
        isAuthenticated: !!user,
    };
}
