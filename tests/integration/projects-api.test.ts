import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '../../contentcreator-app/src/app/api/projects/route';
import { GET as GET_PROJECT } from '../../contentcreator-app/src/app/api/projects/[id]/route';
import { prisma } from '../../contentcreator-app/src/lib/prisma';

// Mock Prisma
jest.mock('../../contentcreator-app/src/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock authentication
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: 'user1', name: 'Test User', email: 'test@example.com' },
  })),
}));

describe('Projects API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/projects', () => {
    it('returns all projects for the authenticated user', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Project 1',
          description: 'Description 1',
          dueDate: new Date(),
          status: 'in-progress',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const req = new NextRequest('http://localhost:3000/api/projects');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ projects: mockProjects });
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      const newProject = {
        title: 'New Project',
        description: 'New Description',
        dueDate: new Date().toISOString(),
        status: 'not-started',
      };

      const createdProject = {
        ...newProject,
        id: '2',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(createdProject);

      const req = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data).toEqual({ project: createdProject });
      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          ...newProject,
          userId: 'user1',
        },
      });
    });

    it('returns 400 for invalid data', async () => {
      const invalidProject = {
        // Missing required title
        description: 'New Description',
      };

      const req = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(invalidProject),
      });

      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('returns a specific project', async () => {
      const mockProject = {
        id: '1',
        title: 'Project 1',
        description: 'Description 1',
        dueDate: new Date(),
        status: 'in-progress',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const req = new NextRequest('http://localhost:3000/api/projects/1');
      const { params } = { params: { id: '1' } };
      
      const res = await GET_PROJECT(req, params);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ project: mockProject });
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: '1', userId: 'user1' },
      });
    });

    it('returns 404 for non-existent project', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3000/api/projects/999');
      const { params } = { params: { id: '999' } };
      
      const res = await GET_PROJECT(req, params);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('updates a project', async () => {
      const updatedProject = {
        id: '1',
        title: 'Updated Project',
        description: 'Updated Description',
        dueDate: new Date().toISOString(),
        status: 'completed',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.project.update as jest.Mock).mockResolvedValue(updatedProject);

      const req = new NextRequest('http://localhost:3000/api/projects/1', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Project',
          description: 'Updated Description',
          status: 'completed',
        }),
      });
      
      const { params } = { params: { id: '1' } };
      
      const res = await PUT(req, params);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ project: updatedProject });
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('deletes a project', async () => {
      const deletedProject = {
        id: '1',
        title: 'Project 1',
        userId: 'user1',
      };

      (prisma.project.delete as jest.Mock).mockResolvedValue(deletedProject);

      const req = new NextRequest('http://localhost:3000/api/projects/1', {
        method: 'DELETE',
      });
      
      const { params } = { params: { id: '1' } };
      
      const res = await DELETE(req, params);

      expect(res.status).toBe(204);
    });
  });
});
