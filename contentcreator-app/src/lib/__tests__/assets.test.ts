import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { getAssets, getAssetById, createAsset, updateAsset, deleteAsset } from '../services/assetService';

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/assets
  rest.get('/api/assets', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: 'asset-1',
          name: 'Test Image 1',
          description: 'This is test image 1',
          type: 'IMAGE',
          url: 'https://example.com/test-image-1.jpg',
          tags: ['tag1', 'tag2'],
          projectId: 'project-1',
          createdAt: new Date('2025-05-01').toISOString(),
          updatedAt: new Date('2025-05-01').toISOString(),
        },
        {
          id: 'asset-2',
          name: 'Test Video 1',
          description: 'This is test video 1',
          type: 'VIDEO',
          url: 'https://example.com/test-video-1.mp4',
          tags: ['tag2', 'tag3'],
          projectId: 'project-2',
          createdAt: new Date('2025-05-02').toISOString(),
          updatedAt: new Date('2025-05-02').toISOString(),
        },
      ])
    );
  }),
  
  // GET /api/assets/:id
  rest.get('/api/assets/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'asset-1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 'asset-1',
          name: 'Test Image 1',
          description: 'This is test image 1',
          type: 'IMAGE',
          url: 'https://example.com/test-image-1.jpg',
          tags: ['tag1', 'tag2'],
          projectId: 'project-1',
          createdAt: new Date('2025-05-01').toISOString(),
          updatedAt: new Date('2025-05-01').toISOString(),
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Asset not found' })
    );
  }),
  
  // POST /api/assets
  rest.post('/api/assets', async (req, res, ctx) => {
    const data = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'new-asset-id',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  
  // PUT /api/assets/:id
  rest.put('/api/assets/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const data = await req.json();
    
    if (id === 'asset-1') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 'asset-1',
          ...data,
          updatedAt: new Date().toISOString(),
        })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Asset not found' })
    );
  }),
  
  // DELETE /api/assets/:id
  rest.delete('/api/assets/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'asset-1') {
      return res(
        ctx.status(200),
        ctx.json({ success: true })
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ error: 'Asset not found' })
    );
  })
);

// Start server before all tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

describe('Asset Service', () => {
  it('fetches all assets', async () => {
    const assets = await getAssets();
    
    expect(assets).toHaveLength(2);
    expect(assets[0].id).toBe('asset-1');
    expect(assets[1].id).toBe('asset-2');
  });
  
  it('fetches a single asset by ID', async () => {
    const asset = await getAssetById('asset-1');
    
    expect(asset).toBeDefined();
    expect(asset?.id).toBe('asset-1');
    expect(asset?.name).toBe('Test Image 1');
  });
  
  it('returns null for non-existent asset', async () => {
    const asset = await getAssetById('non-existent-id');
    
    expect(asset).toBeNull();
  });
  
  it('creates a new asset', async () => {
    const newAsset = {
      name: 'New Test Asset',
      description: 'This is a new test asset',
      type: 'DOCUMENT',
      url: 'https://example.com/new-test-document.pdf',
      tags: ['tag4', 'tag5'],
      projectId: 'project-3',
    };
    
    const createdAsset = await createAsset(newAsset);
    
    expect(createdAsset).toBeDefined();
    expect(createdAsset.id).toBe('new-asset-id');
    expect(createdAsset.name).toBe('New Test Asset');
    expect(createdAsset.createdAt).toBeDefined();
    expect(createdAsset.updatedAt).toBeDefined();
  });
  
  it('updates an existing asset', async () => {
    const updatedData = {
      name: 'Updated Test Image',
      description: 'This is an updated test image',
      tags: ['tag1', 'tag2', 'tag6'],
    };
    
    const updatedAsset = await updateAsset('asset-1', updatedData);
    
    expect(updatedAsset).toBeDefined();
    expect(updatedAsset?.id).toBe('asset-1');
    expect(updatedAsset?.name).toBe('Updated Test Image');
    expect(updatedAsset?.description).toBe('This is an updated test image');
    expect(updatedAsset?.tags).toContain('tag6');
  });
  
  it('returns null when updating non-existent asset', async () => {
    const updatedData = {
      name: 'Updated Test Image',
    };
    
    const updatedAsset = await updateAsset('non-existent-id', updatedData);
    
    expect(updatedAsset).toBeNull();
  });
  
  it('deletes an existing asset', async () => {
    const result = await deleteAsset('asset-1');
    
    expect(result).toBe(true);
  });
  
  it('returns false when deleting non-existent asset', async () => {
    const result = await deleteAsset('non-existent-id');
    
    expect(result).toBe(false);
  });
  
  it('handles network errors gracefully', async () => {
    // Mock network error
    server.use(
      rest.get('/api/assets', (req, res) => {
        return res.networkError('Failed to connect');
      })
    );
    
    await expect(getAssets()).rejects.toThrow();
  });
});
