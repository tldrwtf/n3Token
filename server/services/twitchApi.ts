import { storage } from '../storage';
import type { Proxy } from '@shared/schema';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

interface TwitchApiResponse {
  data: TwitchUser[];
}

interface TwitchValidateResponse {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

export class TwitchApiService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl = 'https://api.twitch.tv/helix';
  private authUrl = 'https://id.twitch.tv/oauth2';
  private rateLimitInfo: RateLimitInfo = { limit: 800, remaining: 800, reset: 0 };

  constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || process.env.VITE_TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || process.env.VITE_TWITCH_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Twitch API credentials not found. Some features may not work.');
    }
  }

  private async makeRequest(
    url: string, 
    options: RequestInit, 
    userId?: string,
    retries = 3
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Get a proxy if userId is provided
        let proxy: Proxy | undefined;
        if (userId) {
          proxy = await storage.getNextValidProxy(userId);
          
          if (!proxy) {
            throw new Error('No valid proxies available. Please add and validate proxies first.');
          }
          
          console.log(`Using proxy: ${proxy.host}:${proxy.port} for request to ${url}`);
          
          // Update proxy last used time
          await storage.updateProxy(proxy.id, userId, {
            lastUsedAt: new Date()
          });
        }

        // Note: In a real implementation, you would configure the HTTP client to use the proxy
        // For demonstration, we'll add proxy info to headers to track usage
        const proxyHeaders = proxy ? {
          'X-Proxy-Used': `${proxy.host}:${proxy.port}`,
          ...options.headers
        } : options.headers;

        const response = await fetch(url, {
          ...options,
          headers: proxyHeaders
        });
        
        // Update rate limit info from headers
        const limit = response.headers.get('Ratelimit-Limit');
        const remaining = response.headers.get('Ratelimit-Remaining');
        const reset = response.headers.get('Ratelimit-Reset');
        
        if (limit) this.rateLimitInfo.limit = parseInt(limit);
        if (remaining) this.rateLimitInfo.remaining = parseInt(remaining);
        if (reset) this.rateLimitInfo.reset = parseInt(reset);
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          
          // Mark proxy as rate limited
          if (proxy) {
            await storage.updateProxy(proxy.id, userId!, {
              status: 'rate_limited',
              lastChecked: new Date()
            });
          }
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Mark proxy as successful if request succeeded
        if (response.ok && proxy) {
          await storage.updateProxy(proxy.id, userId!, {
            status: 'valid',
            failureCount: 0,
            responseTime: Date.now() - new Date(proxy.lastUsedAt || new Date()).getTime()
          });
        }
        
        // Mark proxy as failed if request failed
        if (!response.ok && proxy) {
          await storage.updateProxy(proxy.id, userId!, {
            failureCount: proxy.failureCount + 1,
            status: proxy.failureCount >= 2 ? 'invalid' : proxy.status,
            lastChecked: new Date()
          });
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Exponential backoff for network errors
        if (attempt < retries - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }

  async validateToken(token: string, userId?: string): Promise<{ valid: boolean; username?: string; expiresIn?: number; error?: string }> {
    try {
      const response = await this.makeRequest(
        `${this.authUrl}/validate`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.replace('oauth:', '')}`,
          },
        },
        userId
      );

      if (!response.ok) {
        return { valid: false, error: `HTTP ${response.status}` };
      }

      const data: TwitchValidateResponse = await response.json();
      
      return {
        valid: true,
        username: data.login,
        expiresIn: data.expires_in,
      };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserByToken(token: string, userId?: string): Promise<{ 
    username?: string; 
    displayName?: string;
    description?: string;
    profileImageUrl?: string;
    createdAt?: string;
    error?: string 
  }> {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}/users`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token.replace('oauth:', '')}`,
            'Client-Id': this.clientId,
          },
        },
        userId
      );

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data: TwitchApiResponse = await response.json();
      
      if (data.data.length === 0) {
        return { error: 'No user found' };
      }

      const user = data.data[0];
      return { 
        username: user.login,
        displayName: user.display_name,
        description: user.description,
        profileImageUrl: user.profile_image_url,
        createdAt: user.created_at
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async refreshToken(refreshToken: string, userId?: string): Promise<{ token?: string; error?: string }> {
    try {
      const response = await this.makeRequest(
        `${this.authUrl}/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
          }),
        },
        userId
      );

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      
      return { token: `oauth:${data.access_token}` };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async testProxy(proxyConfig: { host: string; port: number; username?: string; password?: string }, userId?: string): Promise<{ valid: boolean; responseTime?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // For testing purposes, we'll make a simple request to Twitch API
      // In a real implementation, you would configure the proxy for the HTTP client
      const response = await this.makeRequest(
        `${this.baseUrl}/users`,
        {
          method: 'GET',
          headers: {
            'Client-Id': this.clientId,
          },
        },
        userId
      );

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return { valid: true, responseTime };
      } else {
        return { valid: false, error: `HTTP ${response.status}`, responseTime };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { valid: false, error: error instanceof Error ? error.message : 'Unknown error', responseTime };
    }
  }

  getRateLimitInfo(): RateLimitInfo {
    return this.rateLimitInfo;
  }
}

export const twitchApi = new TwitchApiService();
