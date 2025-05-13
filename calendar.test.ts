import { NextRequest } from 'next/server';
import { GET, POST } from './contentcreator-app/src/app/api/calendar/route';
import { prisma } from './contentcreator-app/src/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
jest.mock('./contentcreator-app/src/lib/prisma', () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Calendar API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/calendar', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/calendar'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return events for authenticated user', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock event data
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Test Event 1',
          description: 'Test Description 1',
          startTime: new Date('2025-05-15T10:00:00Z'),
          endTime: new Date('2025-05-15T11:00:00Z'),
          userId: 'user-123',
          projectId: 'project-1',
          type: 'SHOOTING',
          location: 'Studio A',
        },
      ];

      // Mock prisma response
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/calendar'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(200);
      expect(data).toEqual(mockEvents);
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { startTime: 'asc' },
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

    it('should apply date range filters from query parameters', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock event data
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Test Event 1',
          description: 'Test Description 1',
          startTime: new Date('2025-05-15T10:00:00Z'),
          endTime: new Date('2025-05-15T11:00:00Z'),
          userId: 'user-123',
          projectId: 'project-1',
          type: 'SHOOTING',
          location: 'Studio A',
        },
      ];

      // Mock prisma response
      (prisma.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      // Create mock request with query parameters
      const req = new NextRequest(
        new URL('http://localhost:3000/api/calendar?startDate=2025-05-01&endDate=2025-05-31&projectId=project-1&type=SHOOTING')
      );
      
      // Call the handler
      const response = await GET(req);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { 
          userId: 'user-123',
          startTime: { gte: new Date('2025-05-01T00:00:00Z') },
          endTime: { lte: new Date('2025-05-31T23:59:59Z') },
          projectId: 'project-1',
          type: 'SHOOTING',
        },
        orderBy: { startTime: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should handle errors properly', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock prisma error
      (prisma.event.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(new URL('http://localhost:3000/api/calendar'));
      
      // Call the handler
      const response = await GET(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch events' });
    });
  });

  describe('POST /api/calendar', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated session
      (getServerSession as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/calendar'),
        {
          method: 'POST',
          body: JSON.stringify({ title: 'New Event' }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 if required fields are missing', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Create mock request with missing required fields
      const req = new NextRequest(
        new URL('http://localhost:3000/api/calendar'),
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
      expect(data).toEqual({ error: 'Title, start time, and end time are required' });
    });

    it('should create a new event successfully', async () => {
      // Mock authenticated session
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: 'user-123' },
      });

      // Mock event data
      const newEvent = {
        id: 'event-1',
        title: 'New Event',
        description: 'Test Description',
        startTime: new Date('2025-05-15T10:00:00Z'),
        endTime: new Date('2025-05-15T11:00:00Z'),
        userId: 'user-123',
        projectId: 'project-1',
        type: 'SHOOTING',
        location: 'Studio A',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock prisma response
      (prisma.event.create as jest.Mock).mockResolvedValue(newEvent);

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/calendar'),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Event',
            description: 'Test Description',
            startTime: '2025-05-15T10:00:00Z',
            endTime: '2025-05-15T11:00:00Z',
            projectId: 'project-1',
            type: 'SHOOTING',
            location: 'Studio A',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(201);
      expect(data).toEqual(newEvent);
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: 'New Event',
          description: 'Test Description',
          startTime: new Date('2025-05-15T10:00:00Z'),
          endTime: new Date('2025-05-15T11:00:00Z'),
          projectId: 'project-1',
          type: 'SHOOTING',
          location: 'Studio A',
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
      (prisma.event.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const req = new NextRequest(
        new URL('http://localhost:3000/api/calendar'),
        {
          method: 'POST',
          body: JSON.stringify({
            title: 'New Event',
            startTime: '2025-05-15T10:00:00Z',
            endTime: '2025-05-15T11:00:00Z',
          }),
        }
      );
      
      // Call the handler
      const response = await POST(req);
      const data = await response.json();
      
      // Assertions
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create event' });
    });
  });
});
