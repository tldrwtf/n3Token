var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
export function useFileUpload(options) {
    var _this = this;
    if (options === void 0) { options = {}; }
    var _a = useState(false), isUploading = _a[0], setIsUploading = _a[1];
    var toast = useToast().toast;
    var uploadFile = useCallback(function (file, endpoint) { return __awaiter(_this, void 0, void 0, function () {
        var error, error, formData, response, data, error_1, errorMessage;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (options.maxSize && file.size > options.maxSize) {
                        error = "File size exceeds ".concat(Math.round(options.maxSize / 1024 / 1024), "MB limit");
                        (_a = options.onError) === null || _a === void 0 ? void 0 : _a.call(options, error);
                        toast({
                            title: "Upload Error",
                            description: error,
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    if (options.acceptedTypes && !options.acceptedTypes.some(function (type) { return file.name.endsWith(type); })) {
                        error = "File type not supported. Accepted types: ".concat(options.acceptedTypes.join(", "));
                        (_b = options.onError) === null || _b === void 0 ? void 0 : _b.call(options, error);
                        toast({
                            title: "Upload Error",
                            description: error,
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    setIsUploading(true);
                    formData = new FormData();
                    formData.append('file', file);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch(endpoint, {
                            method: 'POST',
                            body: formData,
                        })];
                case 2:
                    response = _e.sent();
                    if (!response.ok) {
                        throw new Error("HTTP ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _e.sent();
                    (_c = options.onSuccess) === null || _c === void 0 ? void 0 : _c.call(options, data);
                    toast({
                        title: "Upload Successful",
                        description: "".concat(file.name, " uploaded successfully"),
                    });
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _e.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : "Upload failed";
                    (_d = options.onError) === null || _d === void 0 ? void 0 : _d.call(options, errorMessage);
                    toast({
                        title: "Upload Error",
                        description: errorMessage,
                        variant: "destructive",
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsUploading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [options, toast]);
    return {
        uploadFile: uploadFile,
        isUploading: isUploading,
    };
}
