import { z } from "zod";

// Enhanced validation utilities
const sanitizeString = (str: string) => str.trim().replace(/[\x00-\x1F\x7F]/g, '');

// IP address validation
const ipAddressSchema = z.string().refine(
  (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },
  { message: "Invalid IP address format" }
);

// Enhanced domain validation
const domainSchema = z.string().refine(
  (domain) => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain) && domain.length <= 253;
  },
  { message: "Invalid domain format" }
);

// Parameter validation schemas
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be numeric").transform(Number)
});

// Query validation schemas with enhanced security
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).max(100000).optional().default(0)
});

export const statusFilterSchema = z.object({
  status: z.enum(['valid', 'invalid', 'expired', 'unchecked', 'rate_limited']).optional()
});

// Enhanced proxy validation schemas with security checks
export const createProxySchema = z.object({
  host: z.string()
    .min(1, "Host is required")
    .max(255, "Host too long")
    .transform(sanitizeString)
    .refine((host) => {
      // Validate as IP or domain
      try {
        return ipAddressSchema.safeParse(host).success || domainSchema.safeParse(host).success;
      } catch {
        return false;
      }
    }, { message: "Invalid host format" })
    .refine((host) => {
      // Block local/private networks for security
      if (host === 'localhost' || 
          host.startsWith('127.') || 
          host.startsWith('10.') ||
          host.startsWith('192.168.') ||
          /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) {
        return false;
      }
      return true;
    }, { message: "Private/local addresses not allowed" }),
  port: z.number()
    .int("Port must be an integer")
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535")
    .refine((port) => {
      // Block commonly dangerous ports
      const dangerousPorts = [22, 23, 25, 53, 135, 139, 445, 1433, 1521, 3306, 3389, 5432];
      return !dangerousPorts.includes(port);
    }, { message: "Port not allowed for security reasons" }),
  username: z.string()
    .min(1, "Username cannot be empty")
    .max(100, "Username too long")
    .transform(sanitizeString)
    .optional(),
  password: z.string()
    .min(1, "Password cannot be empty")
    .max(200, "Password too long")
    .optional()
});

export const updateProxySchema = z.object({
  host: z.string()
    .min(1, "Host cannot be empty")
    .max(255, "Host too long")
    .transform(sanitizeString)
    .refine((host) => {
      try {
        return ipAddressSchema.safeParse(host).success || domainSchema.safeParse(host).success;
      } catch {
        return false;
      }
    }, { message: "Invalid host format" })
    .refine((host) => {
      if (host === 'localhost' || 
          host.startsWith('127.') || 
          host.startsWith('10.') ||
          host.startsWith('192.168.') ||
          /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host)) {
        return false;
      }
      return true;
    }, { message: "Private/local addresses not allowed" })
    .optional(),
  port: z.number()
    .int("Port must be an integer")
    .min(1, "Port must be at least 1")
    .max(65535, "Port must be at most 65535")
    .refine((port) => {
      const dangerousPorts = [22, 23, 25, 53, 135, 139, 445, 1433, 1521, 3306, 3389, 5432];
      return !dangerousPorts.includes(port);
    }, { message: "Port not allowed for security reasons" })
    .optional(),
  username: z.string()
    .min(1, "Username cannot be empty")
    .max(100, "Username too long")
    .transform(sanitizeString)
    .optional(),
  password: z.string()
    .min(1, "Password cannot be empty")
    .max(200, "Password too long")
    .optional(),
  status: z.enum(['valid', 'invalid', 'unchecked', 'rate_limited']).optional()
});

export const bulkProxiesSchema = z.object({
  proxies: z.array(createProxySchema)
    .min(1, "At least one proxy required")
    .max(100, "Too many proxies (max 100)")
});

// Enhanced token validation schemas with security
export const createTokenSchema = z.object({
  token: z.string()
    .min(10, "Token must be at least 10 characters")
    .max(2000, "Token too long")
    .refine((token) => {
      // Ensure token doesn't contain obvious credential patterns
      const lowerToken = token.toLowerCase();
      const suspiciousPatterns = ['password', 'secret', 'key=', 'token=', 'api_key='];
      return !suspiciousPatterns.some(pattern => lowerToken.includes(pattern));
    }, { message: "Token contains suspicious patterns" })
    .refine((token) => {
      // Basic entropy check
      const uniqueChars = new Set(token).size;
      return uniqueChars >= Math.min(8, token.length / 3);
    }, { message: "Token lacks sufficient entropy" }),
  username: z.string()
    .min(1, "Username cannot be empty")
    .max(50, "Username too long")
    .transform(sanitizeString)
    .refine((username) => !/[<>'"&]/.test(username), {
      message: "Username contains invalid characters"
    })
    .optional(),
  displayName: z.string()
    .min(1, "Display name cannot be empty")
    .max(100, "Display name too long")
    .transform(sanitizeString)
    .refine((name) => !/[<>'"&]/.test(name), {
      message: "Display name contains invalid characters"
    })
    .optional(),
  description: z.string()
    .max(500, "Description too long")
    .transform(sanitizeString)
    .optional(),
  loginCredentials: z.string()
    .max(1000, "Login credentials too long")
    .optional()
});

export const updateTokenSchema = z.object({
  username: z.string()
    .min(1, "Username cannot be empty")
    .max(50, "Username too long")
    .transform(sanitizeString)
    .refine((username) => !/[<>'"&]/.test(username), {
      message: "Username contains invalid characters"
    })
    .optional(),
  displayName: z.string()
    .min(1, "Display name cannot be empty")
    .max(100, "Display name too long")
    .transform(sanitizeString)
    .refine((name) => !/[<>'"&]/.test(name), {
      message: "Display name contains invalid characters"
    })
    .optional(),
  description: z.string()
    .max(500, "Description too long")
    .transform(sanitizeString)
    .optional(),
  status: z.enum(['valid', 'invalid', 'expired', 'unchecked']).optional(),
  loginCredentials: z.string()
    .max(1000, "Login credentials too long")
    .optional()
});

export const bulkTokensSchema = z.object({
  tokens: z.array(createTokenSchema)
    .min(1, "At least one token required")
    .max(100, "Too many tokens (max 100)")
});

// Enhanced export validation schemas
export const exportQuerySchema = z.object({
  status: z.enum(['valid', 'invalid', 'expired', 'unchecked']).optional(),
  format: z.enum(['csv', 'json']).optional().default('csv')
});

// Enhanced file upload validation with security checks
export const validateFileUpload = (allowedTypes: string[], maxSize: number = 5 * 1024 * 1024) => {
  return (req: any, res: any, next: any) => {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded",
        correlationId: req.correlationId
      });
    }

    // Enhanced file type validation
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        correlationId: req.correlationId
      });
    }

    // Enhanced file size validation
    if (req.file.size > maxSize) {
      return res.status(413).json({ 
        error: `File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`,
        correlationId: req.correlationId
      });
    }

    // Filename validation
    const filename = req.file.originalname || req.file.filename;
    if (filename) {
      // Check for dangerous file extensions
      const dangerousExts = ['.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar', '.php', '.asp'];
      const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
      if (dangerousExts.includes(ext)) {
        return res.status(400).json({ 
          error: "File type not allowed for security reasons",
          correlationId: req.correlationId
        });
      }

      // Check filename patterns
      if (!/^[a-zA-Z0-9._-]+$/.test(filename.replace(/\.[^.]+$/, ''))) {
        return res.status(400).json({ 
          error: "Filename contains invalid characters",
          correlationId: req.correlationId
        });
      }
    }

    next();
  };
};

// Search query validation with SQL injection protection
export const searchQuerySchema = z.object({
  q: z.string()
    .min(1, "Search query is required")
    .max(200, "Search query too long")
    .transform(sanitizeString)
    .refine((query) => {
      // Prevent SQL injection patterns
      const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)|(\-\-)|(\;)|(\')(\/\*)|(\*\/)|(\bOR\b.*\=)|(\bAND\b.*\=)/i;
      return !sqlPatterns.test(query);
    }, { message: "Search query contains invalid patterns" }),
  type: z.enum(['all', 'proxies', 'tokens']).default('all'),
  status: z.enum(['valid', 'invalid', 'expired', 'unchecked', 'rate_limited']).optional()
});
