import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseFileUploadOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File, endpoint: string) => {
    if (options.maxSize && file.size > options.maxSize) {
      const error = `File size exceeds ${Math.round(options.maxSize / 1024 / 1024)}MB limit`;
      options.onError?.(error);
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (options.acceptedTypes && !options.acceptedTypes.some(type => file.name.endsWith(type))) {
      const error = `File type not supported. Accepted types: ${options.acceptedTypes.join(", ")}`;
      options.onError?.(error);
      toast({
        title: "Upload Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      options.onSuccess?.(data);
      toast({
        title: "Upload Successful",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      options.onError?.(errorMessage);
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [options, toast]);

  return {
    uploadFile,
    isUploading,
  };
}
