/**
 * Network Detection Utility
 * Tries to find the correct backend server IP address
 */

const POSSIBLE_IPS = [
  '172.20.10.2',   // Current working network IP
  '192.168.52.2',  // Alternative network IP
  '192.168.56.1',  // Alternative network IP
  '192.168.1.100', // Common WiFi network
  '192.168.0.100', // Alternative WiFi network
  '10.0.2.2',      // Android emulator host
  '192.168.1.1',   // Router IP
];

const BACKEND_PORT = 3001;

export class NetworkDetector {
  private static cachedIP: string | null = null;
  
  /**
   * Test if a backend server is reachable at the given IP
   */
  static async testConnection(ip: string, port: number = BACKEND_PORT): Promise<boolean> {
    try {
      console.log(`🔗 Testing connection to ${ip}:${port}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(`http://${ip}:${port}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const isReachable = response.ok;
      console.log(`🔗 Connection to ${ip}:${port} - ${isReachable ? 'SUCCESS' : 'FAILED'}`);
      
      return isReachable;
    } catch (error) {
      console.log(`🔗 Connection to ${ip}:${port} - FAILED (${error})`);
      return false;
    }
  }
  
  /**
   * Find the correct backend IP by testing multiple possibilities
   */
  static async findBackendIP(): Promise<string | null> {
    // Return cached IP if available
    if (this.cachedIP) {
      console.log(`🔗 Using cached IP: ${this.cachedIP}`);
      const isStillReachable = await this.testConnection(this.cachedIP);
      if (isStillReachable) {
        return this.cachedIP;
      } else {
        console.log(`🔗 Cached IP ${this.cachedIP} no longer reachable, searching again...`);
        this.cachedIP = null;
      }
    }
    
    console.log('🔗 Searching for backend server...');
    
    // Test each possible IP
    for (const ip of POSSIBLE_IPS) {
      const isReachable = await this.testConnection(ip);
      if (isReachable) {
        this.cachedIP = ip;
        console.log(`✅ Found backend server at: ${ip}:${BACKEND_PORT}`);
        return ip;
      }
    }
    
    console.error('❌ No reachable backend server found');
    return null;
  }
  
  /**
   * Get the complete API base URL
   */
  static async getApiBaseUrl(): Promise<string> {
    const backendIP = await this.findBackendIP();
    
    if (backendIP) {
      return `http://${backendIP}:${BACKEND_PORT}/api`;
    }
    
    // Fallback to working network IP
    console.warn('⚠️ Using fallback API URL');
    return 'http://172.20.10.2:3001/api';
  }
  
  /**
   * Clear cached IP (useful for troubleshooting)
   */
  static clearCache(): void {
    this.cachedIP = null;
    console.log('🔗 Network cache cleared');
  }
}

