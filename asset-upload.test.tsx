import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SessionProvider } from 'next-auth/react';
import AssetUploadForm from './contentcreator-app/src/components/assets/AssetUploadForm';

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
        {
          id: 'project-1',
          title: 'YouTube Tutorial Series',
        },
        {
          id: 'project-2',
          title: 'Instagram Campaign',
        },
      ])
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

// Mock file upload
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('Asset Upload Integration', () => {
  it('renders the asset upload form correctly', async () => {
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} onCancel={jest.fn()} />
      </SessionProvider>
    );
    
    // Check if form elements are rendered
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Project')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    expect(screen.getByLabelText('File')).toBeInTheDocument();
    expect(screen.getByText('Upload Asset')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Check if project options are loaded
    await waitFor(() => {
      expect(screen.getByText('YouTube Tutorial Series')).toBeInTheDocument();
      expect(screen.getByText('Instagram Campaign')).toBeInTheDocument();
    });
  });
  
  it('allows uploading an image asset', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock onSuccess callback
    const mockOnSuccess = jest.fn();
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={mockOnSuccess} onCancel={jest.fn()} />
      </SessionProvider>
    );
    
    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('YouTube Tutorial Series')).toBeInTheDocument();
    });
    
    // Fill in the form
    await user.type(screen.getByLabelText('Name'), 'Test Image');
    await user.type(screen.getByLabelText('Description'), 'This is a test image upload');
    await user.selectOptions(screen.getByLabelText('Type'), 'IMAGE');
    await user.selectOptions(screen.getByLabelText('Project'), 'project-1');
    await user.type(screen.getByLabelText('Tags'), 'test,image,upload');
    
    // Upload a file
    const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('File');
    
    await user.upload(fileInput, file);
    
    // Submit the form
    await user.click(screen.getByText('Upload Asset'));
    
    // Wait for the upload to complete
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    
    // Check if onSuccess was called with the correct asset data
    expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
      id: 'new-asset-id',
      name: 'Test Image',
      description: 'This is a test image upload',
      type: 'IMAGE',
      projectId: 'project-1',
      tags: ['test', 'image', 'upload'],
      url: expect.stringContaining('test-image.jpg'),
      uploadUrl: expect.stringContaining('test-image.jpg'),
    }));
  });
  
  it('validates required fields', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} onCancel={jest.fn()} />
      </SessionProvider>
    );
    
    // Submit the form without filling any fields
    await user.click(screen.getByText('Upload Asset'));
    
    // Check if validation errors are displayed
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Type is required')).toBeInTheDocument();
      expect(screen.getByText('File is required')).toBeInTheDocument();
    });
  });
  
  it('handles file type validation', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} onCancel={jest.fn()} />
      </SessionProvider>
    );
    
    // Fill in the form
    await user.type(screen.getByLabelText('Name'), 'Test Document');
    await user.selectOptions(screen.getByLabelText('Type'), 'IMAGE');
    
    // Upload a file with incorrect type
    const file = new File(['dummy content'], 'test-document.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('File');
    
    await user.upload(fileInput, file);
    
    // Submit the form
    await user.click(screen.getByText('Upload Asset'));
    
    // Check if file type validation error is displayed
    await waitFor(() => {
      expect(screen.getByText('File type must match selected asset type')).toBeInTheDocument();
    });
  });
  
  it('handles API errors gracefully', async () => {
    // Override the POST /api/assets handler to return an error
    server.use(
      rest.post('/api/assets', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Failed to create asset' })
        );
      })
    );
    
    // Setup user event
    const user = userEvent.setup();
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} onCancel={jest.fn()} />
      </SessionProvider>
    );
    
    // Fill in the form
    await user.type(screen.getByLabelText('Name'), 'Test Image');
    await user.selectOptions(screen.getByLabelText('Type'), 'IMAGE');
    
    // Upload a file
    const file = new File(['dummy content'], 'test-image.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByLabelText('File');
    
    await user.upload(fileInput, file);
    
    // Submit the form
    await user.click(screen.getByText('Upload Asset'));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to create asset')).toBeInTheDocument();
    });
  });
  
  it('calls onCancel when cancel button is clicked', async () => {
    // Setup user event
    const user = userEvent.setup();
    
    // Mock onCancel callback
    const mockOnCancel = jest.fn();
    
    render(
      <SessionProvider session={mockSession}>
        <AssetUploadForm onSuccess={jest.fn()} onCancel={mockOnCancel} />
      </SessionProvider>
    );
    
    // Click the cancel button
    await user.click(screen.getByText('Cancel'));
    
    // Check if onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
