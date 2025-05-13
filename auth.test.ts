import { NextRequest } from 'next/server';
import { authOptions } from './contentcreator-app/src/app/api/auth/[...nextauth]/route';
import { prisma } from './contentcreator-app/src/lib/prisma';

// Mock dependencies
jest.mock('./contentcreator-app/src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth Configuration', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('NextAuth Configuration', () => {
    it('should have Google provider configured', () => {
      // Check if Google provider is configured
      const googleProvider = authOptions.providers.find(
        (provider) => provider.id === 'google'
      );
      
      expect(googleProvider).toBeDefined();
      expect(googleProvider.name).toBe('Google');
    });

    it('should have callbacks configured', () => {
      // Check if callbacks are configured
      expect(authOptions.callbacks).toBeDefined();
      expect(typeof authOptions.callbacks.jwt).toBe('function');
      expect(typeof authOptions.callbacks.session).toBe('function');
    });

    it('should include user ID in JWT token', async () => {
      // Mock user data
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      
      const account = {
        provider: 'google',
        type: 'oauth',
      };
      
      // Call the JWT callback
      const token = await authOptions.callbacks.jwt({
        token: { sub: 'oauth-id' },
        user,
        account,
      });
      
      // Assertions
      expect(token.id).toBe('user-123');
    });

    it('should add user ID to session', async () => {
      // Mock token data
      const token = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        sub: 'oauth-id',
      };
      
      // Call the session callback
      const session = await authOptions.callbacks.session({
        session: { user: { name: 'Test User', email: 'test@example.com' } },
        token,
      });
      
      // Assertions
      expect(session.user.id).toBe('user-123');
    });
  });

  describe('User Creation', () => {
    it('should create a new user if not found', async () => {
      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock user creation
      const newUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);
      
      // Mock OAuth profile
      const profile = {
        email: 'test@example.com',
        name: 'Test User',
      };
      
      // Call the signIn callback if it exists
      if (authOptions.callbacks.signIn) {
        const result = await authOptions.callbacks.signIn({
          user: { email: 'test@example.com', name: 'Test User' },
          account: { provider: 'google', type: 'oauth' },
          profile,
        });
        
        // Assertions
        expect(result).toBe(true);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
        expect(prisma.user.create).toHaveBeenCalled();
      }
    });

    it('should return existing user if found', async () => {
      // Mock user found
      const existingUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      
      // Mock OAuth profile
      const profile = {
        email: 'test@example.com',
        name: 'Test User',
      };
      
      // Call the signIn callback if it exists
      if (authOptions.callbacks.signIn) {
        const result = await authOptions.callbacks.signIn({
          user: { email: 'test@example.com', name: 'Test User' },
          account: { provider: 'google', type: 'oauth' },
          profile,
        });
        
        // Assertions
        expect(result).toBe(true);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
        expect(prisma.user.create).not.toHaveBeenCalled();
      }
    });
  });
});
