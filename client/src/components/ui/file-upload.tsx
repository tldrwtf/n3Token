import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
  placeholder?: string;
  className?: string;
}

export default function FileUpload({
  onFileUpload,
  accept = ".txt,.csv,.json",
  maxSize = 5 * 1024 * 1024, // 5MB
  placeholder = "Drop your file here or click to browse",
  className,
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(",").reduce((acc, ext) => {
      acc[ext.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 transition-colors cursor-pointer",
        isDragActive && "border-primary bg-gray-50",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
      <p className="text-sm text-gray-600">{placeholder}</p>
      <p className="text-xs text-gray-500 mt-1">
        Supports {accept} files (max {Math.round(maxSize / 1024 / 1024)}MB)
      </p>
    </div>
  );
}
