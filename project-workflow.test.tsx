import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ProjectsPage from './contentcreator-app/src/app/projects/page';
import ProjectDetailPage from './contentcreator-app/src/app/projects/[id]/page';
import { SessionProvider } from 'next-auth/react';

// Mock server to intercept API requests
const server = setupServer(
  // Mock GET /api/projects endpoint
  rest.get('/api/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'project-1',
          title: 'YouTube Tutorial Series',
          description: 'A series of tutorials about React development',
          status: 'ACTIVE',
          tasks: [
            { id: 'task-1', title: 'Script writing', status: 'DONE' },
            { id: 'task-2', title: 'Recording', status: 'IN_PROGRESS' },
            { id: 'task-3', title: 'Editing', status: 'TODO' },
          ],
          events: [
            { 
              id: 'event-1', 
              title: 'Recording Session', 
              startTime: new Date('2025-05-15T10:00:00Z'),
              endTime: new Date('2025-05-15T12:00:00Z'),
            },
          ],
          createdAt: new Date('2025-05-01').toISOString(),
          updatedAt: new Date('2025-05-10').toISOString(),
        },
        {
          id: 'project-2',
          title: 'Instagram Campaign',
          description: 'Product promotion campaign for Instagram',
          status: 'PLANNING',
          tasks: [
            { id: 'task-4', title: 'Content planning', status: 'IN_PROGRESS' },
            { id: 'task-5', title: 'Photo shooting', status: 'TODO' },
          ],
          events: [],
          createdAt: new Date('2025-05-05').toISOString(),
          updatedAt: new Date('2025-05-07').toISOString(),
        },
      ])
    );
  }),
  
  // Mock GET /api/projects/:id endpoint
  rest.get('/api/projects/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'project-1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 'project-1',
          title: 'YouTube Tutorial Series',
          description: 'A series of tutorials about React development',
          status: 'ACTIVE',
          tasks: [
            { id: 'task-1', title: 'Script writing', status: 'DONE' },
            { id: 'task-2', title: 'Recording', status: 'IN_PROGRESS' },
            { id: 'task-3', title: 'Editing', status: 'TODO' },
          ],
          events: [
            { 
              id: 'event-1', 
              title: 'Recording Session', 
              startTime: new Date('2025-05-15T10:00:00Z'),
              endTime: new Date('2025-05-15T12:00:00Z'),
            },
          ],
          assets: [
            {
              id: 'asset-1',
              name: 'Thumbnail',
              type: 'IMAGE',
              url: 'https://example.com/thumbnail.jpg',
            },
            {
              id: 'asset-2',
              name: 'Script document',
              type: 'DOCUMENT',
              url: 'https://example.com/script.pdf',
            },
          ],
          createdAt: new Date('2025-05-01').toISOString(),
          updatedAt: new Date('2025-05-10').toISOString(),
        })
      );
    } else {
      return res(ctx.status(404));
    }
  }),
  
  // Mock POST /api/projects endpoint
  rest.post('/api/projects', async (req, res, ctx) => {
    const data = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-project-id',
        ...data,
        tasks: [],
        events: [],
        assets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  
  // Mock POST /api/tasks endpoint
  rest.post('/api/tasks', async (req, res, ctx) => {
    const data = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-task-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  })
);

// Start the mock server before tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

// Mock session for authentication
const mockSession = {
  user: { 
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
};

describe('Project Workflow Integration', () => {
  it('displays projects list and allows navigation to project details', async () => {
    // Render the projects page with session provider
    render(
      <SessionProvider session={mockSession}>
        <ProjectsPage />
      </SessionProvider>
    );
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('YouTube Tutorial Series')).toBeInTheDocument();
      expect(screen.getByText('Instagram Campaign')).toBeInTheDocument();
    });
    
    // Check if project descriptions are displayed
    expect(screen.getByText('A series of tutorials about React development')).toBeInTheDocument();
    expect(screen.getByText('Product promotion campaign for Instagram')).toBeInTheDocument();
    
    // Check if task counts are displayed
    expect(screen.getByText('3 Tasks')).toBeInTheDocument();
    expect(screen.getByText('2 Tasks')).toBeInTheDocument();
    
    // Click on the first project to navigate to its details
    fireEvent.click(screen.getByText('YouTube Tutorial Series'));
    
    // Mock navigation by rendering the project detail page
    render(
      <SessionProvider session={mockSession}>
        <ProjectDetailPage params={{ id: 'project-1' }} />
      </SessionProvider>
    );
    
    // Wait for project details to load
    await waitFor(() => {
      expect(screen.getByText('YouTube Tutorial Series')).toBeInTheDocument();
      expect(screen.getByText('A series of tutorials about React development')).toBeInTheDocument();
    });
    
    // Check if tasks are displayed
    expect(screen.getByText('Script writing')).toBeInTheDocument();
    expect(screen.getByText('Recording')).toBeInTheDocument();
    expect(screen.getByText('Editing')).toBeInTheDocument();
    
    // Check if events are displayed
    expect(screen.getByText('Recording Session')).toBeInTheDocument();
    
    // Check if assets are displayed
    expect(screen.getByText('Thumbnail')).toBeInTheDocument();
    expect(screen.getByText('Script document')).toBeInTheDocument();
  });
  
  it('allows creating a new project', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Render the projects page with session provider
    render(
      <SessionProvider session={mockSession}>
        <ProjectsPage />
      </SessionProvider>
    );
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('YouTube Tutorial Series')).toBeInTheDocument();
    });
    
    // Click on the "Create Project" button
    await user.click(screen.getByText('Create Project'));
    
    // Fill in the project form
    await user.type(screen.getByLabelText('Title'), 'New Test Project');
    await user.type(screen.getByLabelText('Description'), 'This is a test project created during integration testing');
    await user.selectOptions(screen.getByLabelText('Status'), 'PLANNING');
    
    // Submit the form
    await user.click(screen.getByText('Save Project'));
    
    // Wait for the new project to be added to the list
    await waitFor(() => {
      expect(screen.getByText('New Test Project')).toBeInTheDocument();
      expect(screen.getByText('This is a test project created during integration testing')).toBeInTheDocument();
    });
  });
  
  it('allows adding a task to a project', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Render the project detail page with session provider
    render(
      <SessionProvider session={mockSession}>
        <ProjectDetailPage params={{ id: 'project-1' }} />
      </SessionProvider>
    );
    
    // Wait for project details to load
    await waitFor(() => {
      expect(screen.getByText('YouTube Tutorial Series')).toBeInTheDocument();
    });
    
    // Click on the "Add Task" button
    await user.click(screen.getByText('Add Task'));
    
    // Fill in the task form
    await user.type(screen.getByLabelText('Title'), 'New Test Task');
    await user.type(screen.getByLabelText('Description'), 'This is a test task created during integration testing');
    await user.selectOptions(screen.getByLabelText('Status'), 'TODO');
    await user.selectOptions(screen.getByLabelText('Priority'), 'HIGH');
    
    // Submit the form
    await user.click(screen.getByText('Save Task'));
    
    // Wait for the new task to be added to the list
    await waitFor(() => {
      expect(screen.getByText('New Test Task')).toBeInTheDocument();
      expect(screen.getByText('This is a test task created during integration testing')).toBeInTheDocument();
    });
  });
  
  it('handles API errors gracefully', async () => {
    // Override the GET /api/projects handler to return an error
    server.use(
      rest.get('/api/projects', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Internal Server Error' })
        );
      })
    );
    
    // Render the projects page with session provider
    render(
      <SessionProvider session={mockSession}>
        <ProjectsPage />
      </SessionProvider>
    );
    
    // Wait for error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    });
  });
});
