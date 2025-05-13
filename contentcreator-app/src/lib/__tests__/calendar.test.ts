import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../services/calendarService';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/calendar
  rest.get('/api/calendar', (req, res, ctx) => {
    const startDate = req.url.searchParams.get('startDate');
    const endDate = req.url.searchParams.get('endDate');
    
    // Check if date range parameters are provided
    if (startDate && endDate) {
      return res(
        ctx.status(200),
        ctx.json([
          {
            id: 'event-1',
            title: 'Content Planning Session',
            description: 'Plan content for next month',
            startDate: '2025-05-15T10:00:00.000Z',
            endDate: '2025-05-15T11:30:00.000Z',
            projectId: 'project-1',
            project: {
              id: 'project-1',
              title: 'Summer Campaign',
              color: '#FF5733',
            },
            createdAt: '2025-05-01T00:00:00.000Z',
            updatedAt: '2025-05-01T00:00:00.000Z',
          },
          {
            id: 'event-2',
            title: 'Filming Session',
            description: 'Record video for Instagram',
            startDate: '2025-05-16T14:00:00.000Z',
            endDate: '2025-05-16T16:00:00.000Z',
            projectId: 'project-2',
            project: {
              id: 'project-2',
              title: 'Instagram Series',
              color: '#3498DB',
            },
            createdAt: '2025-05-02T00:00:00.000Z',
            updatedAt: '2025-05-02T00:00:00.000Z',
          },
        ])
      );
    }
    
    // Return all events if no date range is specified
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'event-1',
          title: 'Content Planning Session',
          description: 'Plan content for next month',
          startDate: '2025-05-15T10:00:00.000Z',
          endDate: '2025-05-15T11:30:00.000Z',
          projectId: 'project-1',
          project: {
            id: 'project-1',
            title: 'Summer Campaign',
            color: '#FF5733',
          },
          createdAt: '2025-05-01T00:00:00.000Z',
          updatedAt: '2025-05-01T00:00:00.000Z',
        },
        {
          id: 'event-2',
          title: 'Filming Session',
          description: 'Record video for Instagram',
          startDate: '2025-05-16T14:00:00.000Z',
          endDate: '2025-05-16T16:00:00.000Z',
          projectId: 'project-2',
          project: {
            id: 'project-2',
            title: 'Instagram Series',
            color: '#3498DB',
          },
          createdAt: '2025-05-02T00:00:00.000Z',
          updatedAt: '2025-05-02T00:00:00.000Z',
        },
        {
          id: 'event-3',
          title: 'Editing Session',
          description: 'Edit YouTube video',
          startDate: '2025-05-20T09:00:00.000Z',
          endDate: '2025-05-20T12:00:00.000Z',
          projectId: 'project-3',
          project: {
            id: 'project-3',
            title: 'YouTube Channel',
            color: '#E74C3C',
          },
          createdAt: '2025-05-03T00:00:00.000Z',
          updatedAt: '2025-05-03T00:00:00.000Z',
        },
      ])
    );
  }),
  
  // GET /api/calendar/:id
  rest.get('/api/calendar/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'event-1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 'event-1',
          title: 'Content Planning Session',
          description: 'Plan content for next month',
          startDate: '2025-05-15T10:00:00.000Z',
          endDate: '2025-05-15T11:30:00.000Z',
          projectId: 'project-1',
          project: {
            id: 'project-1',
            title: 'Summer Campaign',
            color: '#FF5733',
          },
          createdAt: '2025-05-01T00:00:00.000Z',
          updatedAt: '2025-05-01T00:00:00.000Z',
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Event not found' })
    );
  }),
  
  // POST /api/calendar
  rest.post('/api/calendar', async (req, res, ctx) => {
    const data = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-event-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  
  // PUT /api/calendar/:id
  rest.put('/api/calendar/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const data = await req.json();
    
    if (id === 'event-1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 'event-1',
          ...data,
          updatedAt: new Date().toISOString(),
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Event not found' })
    );
  }),
  
  // DELETE /api/calendar/:id
  rest.delete('/api/calendar/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'event-1') {
      return res(
        ctx.status(200),
        ctx.json({ success: true })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Event not found' })
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Calendar Service', () => {
  it('fetches all events', async () => {
    const events = await getEvents();
    
    expect(events).toHaveLength(3);
    expect(events[0].id).toBe('event-1');
    expect(events[1].id).toBe('event-2');
    expect(events[2].id).toBe('event-3');
  });
  
  it('fetches events within a date range', async () => {
    const startDate = new Date('2025-05-15T00:00:00.000Z');
    const endDate = new Date('2025-05-17T00:00:00.000Z');
    
    const events = await getEvents(startDate, endDate);
    
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe('event-1');
    expect(events[1].id).toBe('event-2');
  });
  
  it('fetches a single event by ID', async () => {
    const event = await getEventById('event-1');
    
    expect(event).toBeDefined();
    expect(event?.id).toBe('event-1');
    expect(event?.title).toBe('Content Planning Session');
  });
  
  it('returns null for non-existent event', async () => {
    const event = await getEventById('non-existent-id');
    
    expect(event).toBeNull();
  });
  
  it('creates a new event', async () => {
    const newEvent = {
      title: 'New Test Event',
      description: 'This is a new test event',
      startDate: new Date('2025-05-25T10:00:00.000Z').toISOString(),
      endDate: new Date('2025-05-25T11:00:00.000Z').toISOString(),
      projectId: 'project-1',
    };
    
    const createdEvent = await createEvent(newEvent);
    
    expect(createdEvent).toBeDefined();
    expect(createdEvent.id).toBe('new-event-id');
    expect(createdEvent.title).toBe('New Test Event');
    expect(createdEvent.createdAt).toBeDefined();
    expect(createdEvent.updatedAt).toBeDefined();
  });
  
  it('updates an existing event', async () => {
    const updatedData = {
      title: 'Updated Event Title',
      description: 'This is an updated event description',
      startDate: new Date('2025-05-15T11:00:00.000Z').toISOString(),
      endDate: new Date('2025-05-15T12:30:00.000Z').toISOString(),
    };
    
    const updatedEvent = await updateEvent('event-1', updatedData);
    
    expect(updatedEvent).toBeDefined();
    expect(updatedEvent?.id).toBe('event-1');
    expect(updatedEvent?.title).toBe('Updated Event Title');
    expect(updatedEvent?.description).toBe('This is an updated event description');
    expect(updatedEvent?.startDate).toBe(new Date('2025-05-15T11:00:00.000Z').toISOString());
    expect(updatedEvent?.endDate).toBe(new Date('2025-05-15T12:30:00.000Z').toISOString());
  });
  
  it('returns null when updating non-existent event', async () => {
    const updatedData = {
      title: 'Updated Event Title',
    };
    
    const updatedEvent = await updateEvent('non-existent-id', updatedData);
    
    expect(updatedEvent).toBeNull();
  });
  
  it('deletes an existing event', async () => {
    const result = await deleteEvent('event-1');
    
    expect(result).toBe(true);
  });
  
  it('returns false when deleting non-existent event', async () => {
    const result = await deleteEvent('non-existent-id');
    
    expect(result).toBe(false);
  });
  
  it('handles network errors gracefully', async () => {
    // Mock network error
    server.use(
      rest.get('/api/calendar', (req, res) => {
        return res.networkError('Failed to connect');
      })
    );
    
    await expect(getEvents()).rejects.toThrow();
  });
});
