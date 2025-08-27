import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
export default function FileUpload(_a) {
    var onFileUpload = _a.onFileUpload, _b = _a.accept, accept = _b === void 0 ? ".txt,.csv,.json" : _b, _c = _a.maxSize, maxSize = _c === void 0 ? 5 * 1024 * 1024 : _c, // 5MB
    _d = _a.placeholder, // 5MB
    placeholder = _d === void 0 ? "Drop your file here or click to browse" : _d, className = _a.className;
    var onDrop = useCallback(function (acceptedFiles) {
        if (acceptedFiles.length > 0) {
            onFileUpload(acceptedFiles[0]);
        }
    }, [onFileUpload]);
    var _e = useDropzone({
        onDrop: onDrop,
        accept: accept.split(",").reduce(function (acc, ext) {
            acc[ext.trim()] = [];
            return acc;
        }, {}),
        maxSize: maxSize,
        multiple: false,
    }), getRootProps = _e.getRootProps, getInputProps = _e.getInputProps, isDragActive = _e.isDragActive;
    return (<div {...getRootProps()} className={cn("border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary hover:bg-gray-50 transition-colors cursor-pointer", isDragActive && "border-primary bg-gray-50", className)}>
      <input {...getInputProps()}/>
      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2"/>
      <p className="text-sm text-gray-600">{placeholder}</p>
      <p className="text-xs text-gray-500 mt-1">
        Supports {accept} files (max {Math.round(maxSize / 1024 / 1024)}MB)
      </p>
    </div>);
}
