import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  operation: any;
  onCancel?: () => void;
  className?: string;
}

export default function ProgressIndicator({
  operation,
  onCancel,
  className = "",
}: ProgressIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(operation?.status === "running");
  }, [operation?.status]);

  if (!visible || !operation) return null;

  const percentage = operation.total > 0 ? (operation.progress / operation.total) * 100 : 0;

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {operation.type === "validate_tokens" && "Validating tokens..."}
            {operation.type === "validate_proxies" && "Validating proxies..."}
            {operation.type === "username_lookup" && "Looking up usernames..."}
            {operation.type === "refresh_tokens" && "Refreshing tokens..."}
          </p>
          <Progress value={percentage} className="w-full mt-2" />
          <p className="text-xs text-gray-500 mt-1">
            {operation.progress} / {operation.total} processed
          </p>
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
