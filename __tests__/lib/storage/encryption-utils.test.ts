/**
 * Tests for Encryption Utils
 */

import EncryptionUtils from '@/lib/storage/encryption-utils';

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
  digestStringAsync: jest.fn(),
}));

describe('EncryptionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateKey', () => {
    it('should generate a random key', async () => {
      const mockRandomBytes = new Uint8Array(32);
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync.mockResolvedValue(mockRandomBytes);

      const key = await EncryptionUtils.generateKey();

      expect(key).toBeTruthy();
      expect(typeof key).toBe('string');
      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(32);
    });

    it('should handle generation errors', async () => {
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync.mockRejectedValue(new Error('Generation failed'));

      await expect(EncryptionUtils.generateKey()).rejects.toThrow('Failed to generate encryption key');
    });
  });

  describe('generateIV', () => {
    it('should generate a random IV', async () => {
      const mockRandomBytes = new Uint8Array(12);
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync.mockResolvedValue(mockRandomBytes);

      const iv = await EncryptionUtils.generateIV();

      expect(iv).toBeTruthy();
      expect(typeof iv).toBe('string');
      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(12);
    });
  });

  describe('generateSalt', () => {
    it('should generate a random salt', async () => {
      const mockRandomBytes = new Uint8Array(16);
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync.mockResolvedValue(mockRandomBytes);

      const salt = await EncryptionUtils.generateSalt();

      expect(salt).toBeTruthy();
      expect(typeof salt).toBe('string');
      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(16);
    });
  });

  describe('deriveKey', () => {
    it('should derive key from password and salt', async () => {
      const Crypto = require('expo-crypto');
      Crypto.digestStringAsync.mockResolvedValue('derived-key');

      const key = await EncryptionUtils.deriveKey('password', 'salt');

      expect(key).toBe('derived-key');
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        'SHA256',
        'passwordsalt',
        { encoding: 'base64' }
      );
    });
  });

  describe('encrypt', () => {
    it('should encrypt data', async () => {
      const mockRandomBytes = new Uint8Array(12);
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync
        .mockResolvedValueOnce(mockRandomBytes) // for IV
        .mockResolvedValueOnce(mockRandomBytes); // for salt

      const result = await EncryptionUtils.encrypt('test data', 'test-key');

      expect(result).toHaveProperty('encrypted');
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('salt');
      expect(typeof result.encrypted).toBe('string');
      expect(typeof result.iv).toBe('string');
      expect(typeof result.salt).toBe('string');
    });

    it('should handle encryption errors', async () => {
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync.mockRejectedValue(new Error('Random generation failed'));

      await expect(EncryptionUtils.encrypt('test data', 'test-key')).rejects.toThrow('Failed to encrypt data');
    });
  });

  describe('decrypt', () => {
    it('should decrypt data successfully', async () => {
      const Crypto = require('expo-crypto');
      Crypto.digestStringAsync.mockResolvedValue('derived-key');

      // Mock the encryption result
      const mockEncrypted = 'encrypted-data';
      const mockIV = 'iv-data';
      const mockSalt = 'salt-data';

      const result = await EncryptionUtils.decrypt(mockEncrypted, 'test-key', mockIV, mockSalt);

      expect(result.success).toBe(true);
      expect(result.decrypted).toBeTruthy();
    });

    it('should handle decryption errors', async () => {
      const Crypto = require('expo-crypto');
      Crypto.digestStringAsync.mockRejectedValue(new Error('Key derivation failed'));

      const result = await EncryptionUtils.decrypt('encrypted', 'key', 'iv', 'salt');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Key derivation failed');
    });
  });

  describe('hash', () => {
    it('should hash data using SHA-256', async () => {
      const Crypto = require('expo-crypto');
      Crypto.digestStringAsync.mockResolvedValue('hashed-data');

      const hash = await EncryptionUtils.hash('test data');

      expect(hash).toBe('hashed-data');
      expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
        'SHA256',
        'test data',
        { encoding: 'base64' }
      );
    });

    it('should handle hashing errors', async () => {
      const Crypto = require('expo-crypto');
      Crypto.digestStringAsync.mockRejectedValue(new Error('Hashing failed'));

      await expect(EncryptionUtils.hash('test data')).rejects.toThrow('Failed to hash data');
    });
  });

  describe('generateSecureRandom', () => {
    it('should generate secure random string', async () => {
      const mockRandomBytes = new Uint8Array(32);
      const Crypto = require('expo-crypto');
      Crypto.getRandomBytesAsync.mockResolvedValue(mockRandomBytes);

      const random = await EncryptionUtils.generateSecureRandom(32);

      expect(random).toBeTruthy();
      expect(typeof random).toBe('string');
      expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(32);
    });
  });

  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = EncryptionUtils.generateUUID();

      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = EncryptionUtils.generateUUID();
      const uuid2 = EncryptionUtils.generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('validateEncryptionParams', () => {
    it('should validate correct parameters', () => {
      expect(EncryptionUtils.validateEncryptionParams('test data', 'valid-key')).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(EncryptionUtils.validateEncryptionParams('', 'valid-key')).toBe(false);
      expect(EncryptionUtils.validateEncryptionParams(null as any, 'valid-key')).toBe(false);
      expect(EncryptionUtils.validateEncryptionParams(123 as any, 'valid-key')).toBe(false);
    });

    it('should reject invalid key', () => {
      expect(EncryptionUtils.validateEncryptionParams('test data', '')).toBe(false);
      expect(EncryptionUtils.validateEncryptionParams('test data', 'short')).toBe(false);
      expect(EncryptionUtils.validateEncryptionParams('test data', null as any)).toBe(false);
    });
  });

  describe('getEncryptionInfo', () => {
    it('should return encryption information', () => {
      const info = EncryptionUtils.getEncryptionInfo();

      expect(info).toEqual({
        algorithm: 'AES-GCM',
        keyLength: 256,
        ivLength: 12,
        saltLength: 16,
        tagLength: 16,
      });
    });
  });
});
