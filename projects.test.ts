import { NextRequest } from 'next/server';
import { GET, POST } from './contentcreator-app/src/app/api/projects/route';
import { prisma } from './contentcreator-app/src/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('./contentcreator-app/src/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Projects API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/projects', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/projects'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return projects for authenticated user', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock project data
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Test Project 1',
          description: 'Test Description 1',
          status: 'ACTIVE',
          userId: 'user-123',
          tasks: [],
          events: [],
        },
      ];

      // Mock prisma response
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/projects'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(200);
      expect(data).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          events: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
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

      // Mock project data
      const mockProjects = [
        {
          id: 'project-1',
          title: 'Test Project 1',
          description: 'Test Description 1',
          status: 'ACTIVE',
          userId: 'user-123',
          teamId: 'team-1',
          tasks: [],
          events: [],
        },
      ];

      // Mock prisma response
      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      // Create mock request with query parameters
      const req = new NextRequest(
        new URL('http://localhost:3000/api/projects?status=ACTIVE&teamId=team-1')
      );
      
      // Call the handler
      const response = await GET(req);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'user-123',
          status: 'ACTIVE',
          teamId: 'team-1'
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
      (prisma.project.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/projects'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch projects' });
    });
  });

  describe('POST /api/projects', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/projects'),
        {
          method: 'POST',
          body: JSON.stringify({ title: 'New Project' }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if title is missing', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Create mock request with missing title
      const req = new NextRequest(
        new URL('http://localhost:3000/api/projects'),
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
      expect(data).toEqual({ error: 'Title is required' });
    });

    it('should create a new project successfully', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock project data
      const newProject = {
        id: 'project-1',
        title: 'New Project',
        description: 'Test Description',
        status: 'ACTIVE',
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock prisma response
      (prisma.project.create as jest.Mock).mockResolvedValue(newProject);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/projects'),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Project',
            description: 'Test Description',
            status: 'ACTIVE',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(201);
      expect(data).toEqual(newProject);
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          title: 'New Project',
          description: 'Test Description',
          status: 'ACTIVE',
          userId: 'user-123',
        },
      });
    });

    it('should handle errors properly', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock prisma error
      (prisma.project.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/projects'),
        {
          method: 'POST',
          body: JSON.stringify({ title: 'New Project' }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create project' });
    });
  });
});
