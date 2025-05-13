import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SessionProvider } from 'next-auth/react';
import AssetUploadForm from '../AssetUploadForm';

// Mock server to intercept API requests
const server = setupServer(
  // Mock POST /api/assets endpoint
  rest.post('/api/assets', async (req, res, ctx) => {
    const data = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-asset-id',
        ...data,
        key: `uploads/user-123/${data.name.replace(/\s+/g, '-').toLowerCase()}.${data.contentType.split('/')[1]}`,
        url: `https://example-bucket.s3.amazonaws.com/uploads/user-123/${data.name.replace(/\s+/g, '-').toLowerCase()}.${data.contentType.split('/')[1]}`,
        uploadUrl: 'https://example-bucket.s3.amazonaws.com/uploads/user-123/test-image.jpg?signature=xyz',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  
  // Mock GET /api/projects endpoint for project selection
  rest.get('/api/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 'project-1', title: 'Project 1' },
        { id: 'project-2', title: 'Project 2' },
        { id: 'project-3', title: 'Project 3' },
      ])
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

// Mock session for authenticated user
const mockSession = {
  user: { 
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg'
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock fetch for S3 upload
global.fetch = jest.fn();

describe('AssetUploadForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch for S3 upload
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  it('renders the form with all required fields', async () => {
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} />
      </SessionProvider>
    );
    
    // Check form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/file/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
    
    // Check if project options are loaded
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
      expect(screen.getByText('Project 3')).toBeInTheDocument();
    });
  });

  it('validates required fields on submission', async () => {
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} />
      </SessionProvider>
    );
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    
    // Check validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/file is required/i)).toBeInTheDocument();
    });
  });

  it('successfully uploads an asset', async () => {
    const mockOnSuccess = jest.fn();
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={mockOnSuccess} />
      </SessionProvider>
    );
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Image' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'This is a test image' } });
    
    // Mock file upload
    const file = new File(['test image content'], 'test-image.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/file/i);
    userEvent.upload(fileInput, file);
    
    // Select project
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText(/project/i), { target: { value: 'project-1' } });
    
    // Add tags
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'tag1, tag2, tag3' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    
    // Check if API was called and onSuccess callback was triggered
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example-bucket.s3.amazonaws.com/uploads/user-123/test-image.jpg?signature=xyz',
        expect.objectContaining({
          method: 'PUT',
          body: file,
        })
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
        id: 'new-asset-id',
        name: 'Test Image',
        description: 'This is a test image',
      }));
    });
  });

  it('handles upload errors gracefully', async () => {
    // Mock API error
    server.use(
      rest.post('/api/assets', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} />
      </SessionProvider>
    );
    
    // Fill form fields
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test Image' } });
    
    // Mock file upload
    const file = new File(['test image content'], 'test-image.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText(/file/i);
    userEvent.upload(fileInput, file);
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to upload asset/i)).toBeInTheDocument();
    });
  });
});
