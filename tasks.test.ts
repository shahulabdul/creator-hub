import { NextRequest } from 'next/server';
import { GET, POST } from './contentcreator-app/src/app/api/tasks/route';
import { prisma } from './contentcreator-app/src/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('./contentcreator-app/src/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Tasks API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/tasks'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return tasks for authenticated user', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock task data
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'Test Description 1',
          status: 'TODO',
          priority: 'HIGH',
          userId: 'user-123',
          projectId: 'project-1',
          dueDate: new Date().toISOString(),
        },
      ];

      // Mock prisma response
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/tasks'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(200);
      expect(data).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
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

      // Mock task data
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'Test Description 1',
          status: 'TODO',
          priority: 'HIGH',
          userId: 'user-123',
          projectId: 'project-1',
          dueDate: new Date().toISOString(),
        },
      ];

      // Mock prisma response
      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      // Create mock request with query parameters
      const req = new NextRequest(
        new URL('http://localhost:3000/api/tasks?status=TODO&projectId=project-1&priority=HIGH')
      );
      
      // Call the handler
      const response = await GET(req);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'user-123',
          status: 'TODO',
          projectId: 'project-1',
          priority: 'HIGH'
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
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/tasks'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch tasks' });
    });
  });

  describe('POST /api/tasks', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/tasks'),
        {
          method: 'POST',
          body: JSON.stringify({ title: 'New Task' }),
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
        new URL('http://localhost:3000/api/tasks'),
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

    it('should create a new task successfully', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock task data
      const newTask = {
        id: 'task-1',
        title: 'New Task',
        description: 'Test Description',
        status: 'TODO',
        priority: 'HIGH',
        userId: 'user-123',
        projectId: 'project-1',
        dueDate: '2025-06-01T00:00:00.000Z',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock prisma response
      (prisma.task.create as jest.Mock).mockResolvedValue(newTask);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/tasks'),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Task',
            description: 'Test Description',
            status: 'TODO',
            priority: 'HIGH',
            projectId: 'project-1',
            dueDate: '2025-06-01T00:00:00.000Z',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(201);
      expect(data).toEqual(newTask);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'New Task',
          description: 'Test Description',
          status: 'TODO',
          priority: 'HIGH',
          projectId: 'project-1',
          dueDate: '2025-06-01T00:00:00.000Z',
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
      (prisma.task.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/tasks'),
        {
          method: 'POST',
          body: JSON.stringify({ title: 'New Task' }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create task' });
    });
  });
});
