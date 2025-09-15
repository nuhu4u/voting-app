/**
 * Tests for JWT Utils
 */

import JWTUtils from '@/lib/auth/jwt-utils';

// Mock JWT token for testing
const createMockJWT = (payload: any, header: any = { alg: 'HS256', typ: 'JWT' }) => {
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  return `${headerB64}.${payloadB64}.${signature}`;
};

describe('JWTUtils', () => {
  describe('decodeToken', () => {
    it('should decode valid JWT token', () => {
      const payload = {
        sub: 'user123',
        email: 'test@example.com',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const token = createMockJWT(payload);
      const decoded = JWTUtils.decodeToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.payload.sub).toBe('user123');
      expect(decoded?.payload.email).toBe('test@example.com');
      expect(decoded?.payload.role).toBe('user');
    });

    it('should return null for invalid token format', () => {
      const decoded = JWTUtils.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed token', () => {
      const decoded = JWTUtils.decodeToken('header.payload');
      expect(decoded).toBeNull();
    });
  });

  describe('isValidFormat', () => {
    it('should return true for valid JWT format', () => {
      const token = createMockJWT({ sub: 'user123' });
      expect(JWTUtils.isValidFormat(token)).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(JWTUtils.isValidFormat('invalid-token')).toBe(false);
      expect(JWTUtils.isValidFormat('header.payload')).toBe(false);
      expect(JWTUtils.isValidFormat('')).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return true for expired token', () => {
      const payload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      const token = createMockJWT(payload);
      expect(JWTUtils.isExpired(token)).toBe(true);
    });

    it('should return false for valid token', () => {
      const payload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      const token = createMockJWT(payload);
      expect(JWTUtils.isExpired(token)).toBe(false);
    });
  });

  describe('isExpiringSoon', () => {
    it('should return true for token expiring within threshold', () => {
      const payload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
      };

      const token = createMockJWT(payload);
      expect(JWTUtils.isExpiringSoon(token, 10)).toBe(true);
    });

    it('should return false for token not expiring soon', () => {
      const payload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      const token = createMockJWT(payload);
      expect(JWTUtils.isExpiringSoon(token, 5)).toBe(false);
    });
  });

  describe('getExpirationTime', () => {
    it('should return expiration time in milliseconds', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { sub: 'user123', exp: expTime };
      const token = createMockJWT(payload);

      const result = JWTUtils.getExpirationTime(token);
      expect(result).toBe(expTime * 1000);
    });

    it('should return null for invalid token', () => {
      const result = JWTUtils.getExpirationTime('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('getTimeUntilExpiration', () => {
    it('should return time until expiration in seconds', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600;
      const payload = { sub: 'user123', exp: expTime };
      const token = createMockJWT(payload);

      const result = JWTUtils.getTimeUntilExpiration(token);
      expect(result).toBeGreaterThan(3500); // Should be close to 3600
      expect(result).toBeLessThanOrEqual(3600);
    });

    it('should return 0 for expired token', () => {
      const expTime = Math.floor(Date.now() / 1000) - 3600;
      const payload = { sub: 'user123', exp: expTime };
      const token = createMockJWT(payload);

      const result = JWTUtils.getTimeUntilExpiration(token);
      expect(result).toBe(0);
    });
  });

  describe('getSubject', () => {
    it('should return subject from token', () => {
      const payload = { sub: 'user123', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createMockJWT(payload);

      const result = JWTUtils.getSubject(token);
      expect(result).toBe('user123');
    });

    it('should return null for invalid token', () => {
      const result = JWTUtils.getSubject('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('getClaim', () => {
    it('should return specific claim from token', () => {
      const payload = { 
        sub: 'user123', 
        role: 'admin',
        permissions: ['read', 'write'],
        exp: Math.floor(Date.now() / 1000) + 3600 
      };
      const token = createMockJWT(payload);

      expect(JWTUtils.getClaim(token, 'role')).toBe('admin');
      expect(JWTUtils.getClaim(token, 'permissions')).toEqual(['read', 'write']);
      expect(JWTUtils.getClaim(token, 'nonexistent')).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true for matching role', () => {
      const payload = { sub: 'user123', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createMockJWT(payload);

      expect(JWTUtils.hasRole(token, 'admin')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      const payload = { sub: 'user123', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createMockJWT(payload);

      expect(JWTUtils.hasRole(token, 'admin')).toBe(false);
    });
  });

  describe('hasAnyRole', () => {
    it('should return true for matching role', () => {
      const payload = { sub: 'user123', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createMockJWT(payload);

      expect(JWTUtils.hasAnyRole(token, ['admin', 'user'])).toBe(true);
    });

    it('should return false for non-matching roles', () => {
      const payload = { sub: 'user123', role: 'guest', exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createMockJWT(payload);

      expect(JWTUtils.hasAnyRole(token, ['admin', 'user'])).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for matching permission', () => {
      const payload = { 
        sub: 'user123', 
        permissions: ['read', 'write'],
        exp: Math.floor(Date.now() / 1000) + 3600 
      };
      const token = createMockJWT(payload);

      expect(JWTUtils.hasPermission(token, 'read')).toBe(true);
    });

    it('should return false for non-matching permission', () => {
      const payload = { 
        sub: 'user123', 
        permissions: ['read', 'write'],
        exp: Math.floor(Date.now() / 1000) + 3600 
      };
      const token = createMockJWT(payload);

      expect(JWTUtils.hasPermission(token, 'delete')).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should validate correct token', () => {
      const payload = {
        sub: 'user123',
        email: 'test@example.com',
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const token = createMockJWT(payload);
      const result = JWTUtils.validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.isExpiringSoon).toBe(false);
      expect(result.decodedToken).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('should detect expired token', () => {
      const payload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
      };

      const token = createMockJWT(payload);
      const result = JWTUtils.validateToken(token);

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.isExpiringSoon).toBe(true);
    });

    it('should detect expiring soon token', () => {
      const payload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
        iat: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      const token = createMockJWT(payload);
      const result = JWTUtils.validateToken(token);

      expect(result.isValid).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.isExpiringSoon).toBe(true);
    });

    it('should handle invalid token format', () => {
      const result = JWTUtils.validateToken('invalid-token');

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.isExpiringSoon).toBe(true);
      expect(result.error).toBe('Invalid token format');
    });

    it('should handle missing required fields', () => {
      const payload = {
        email: 'test@example.com',
        // Missing sub, exp, iat
      };

      const token = createMockJWT(payload);
      const result = JWTUtils.validateToken(token);

      expect(result.isValid).toBe(false);
      expect(result.isExpired).toBe(true);
      expect(result.isExpiringSoon).toBe(true);
      expect(result.error).toBe('Missing required token fields');
    });
  });

  describe('getTokenAge', () => {
    it('should return token age in seconds', () => {
      const iat = Math.floor(Date.now() / 1000) - 1800; // 30 minutes ago
      const payload = { sub: 'user123', iat, exp: Math.floor(Date.now() / 1000) + 3600 };
      const token = createMockJWT(payload);

      const age = JWTUtils.getTokenAge(token);
      expect(age).toBeGreaterThan(1700); // Should be close to 1800
      expect(age).toBeLessThanOrEqual(1800);
    });

    it('should return null for invalid token', () => {
      const age = JWTUtils.getTokenAge('invalid-token');
      expect(age).toBeNull();
    });
  });
});
