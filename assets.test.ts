import { NextRequest } from 'next/server';
import { GET, POST } from './contentcreator-app/src/app/api/assets/route';
import { prisma } from './contentcreator-app/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock dependencies
jest.mock('./contentcreator-app/src/lib/prisma', () => ({
  prisma: {
    asset: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    config: {},
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => ({
    input: params,
  })),
}));

describe('Assets API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/assets', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/assets'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return assets for authenticated user', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock asset data
      const mockAssets = [
        {
          id: 'asset-1',
          name: 'Test Asset 1',
          description: 'Test Description 1',
          type: 'IMAGE',
          url: 'https://example.com/test-asset-1.jpg',
          userId: 'user-123',
          projectId: 'project-1',
          tags: ['tag1', 'tag2'],
        },
      ];

      // Mock prisma response
      (prisma.asset.findMany as jest.Mock).mockResolvedValue(mockAssets);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/assets'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(200);
      expect(data).toEqual(mockAssets);
      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    });

    it('should apply filters from query parameters', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock asset data
      const mockAssets = [
        {
          id: 'asset-1',
          name: 'Test Asset 1',
          description: 'Test Description 1',
          type: 'IMAGE',
          url: 'https://example.com/test-asset-1.jpg',
          userId: 'user-123',
          projectId: 'project-1',
          tags: ['tag1', 'tag2'],
        },
      ];

      // Mock prisma response
      (prisma.asset.findMany as jest.Mock).mockResolvedValue(mockAssets);

      // Create mock request with query parameters
      const req = new NextRequest(
        new URL('http://localhost:3000/api/assets?type=IMAGE&projectId=project-1&tag=tag1')
      );
      
      // Call the handler
      const response = await GET(req);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(prisma.asset.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'user-123',
          type: 'IMAGE',
          projectId: 'project-1',
          tags: { has: 'tag1' },
        },
        orderBy: { updatedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should handle errors properly', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock prisma error
      (prisma.asset.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/assets'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch assets' });
    });
  });

  describe('POST /api/assets', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        {
          method: 'POST',
          body: JSON.stringify({ name: 'New Asset' }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if name is missing', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Create mock request with missing name
      const req = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        {
          method: 'POST',
          body: JSON.stringify({ description: 'Test Description' }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Name and type are required' });
    });

    it('should generate a presigned URL for asset upload', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock S3 presigned URL
      const mockPresignedUrl = 'https://example-bucket.s3.amazonaws.com/uploads/user-123/asset-1.jpg?signature=xyz';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockPresignedUrl);

      // Mock asset data
      const newAsset = {
        id: 'asset-1',
        name: 'New Asset',
        description: 'Test Description',
        type: 'IMAGE',
        key: 'uploads/user-123/asset-1.jpg',
        url: 'https://example-bucket.s3.amazonaws.com/uploads/user-123/asset-1.jpg',
        userId: 'user-123',
        projectId: 'project-1',
        tags: ['tag1', 'tag2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock prisma response
      (prisma.asset.create as jest.Mock).mockResolvedValue(newAsset);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'New Asset',
            description: 'Test Description',
            type: 'IMAGE',
            projectId: 'project-1',
            tags: ['tag1', 'tag2'],
            contentType: 'image/jpeg',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(201);
      expect(data).toEqual({
        ...newAsset,
        uploadUrl: mockPresignedUrl,
      });
      expect(prisma.asset.create).toHaveBeenCalledWith({
        data: {
          name: 'New Asset',
          description: 'Test Description',
          type: 'IMAGE',
          projectId: 'project-1',
          tags: ['tag1', 'tag2'],
          key: expect.any(String),
          url: expect.any(String),
          userId: 'user-123',
        },
      });
      expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock prisma error
      (prisma.asset.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/assets'),
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'New Asset',
            type: 'IMAGE',
            contentType: 'image/jpeg',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create asset' });
    });
  });
});
