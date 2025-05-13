'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, UploadCloud, FileText, Film, Music, Image as ImageIcon, File } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';

interface Asset {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  mimeType: string;
  tags: string[];
  project: {
    id: string;
    title: string;
  } | null;
}

interface AssetsOverviewProps {
  limit?: number;
}

export default function AssetsOverview({ limit }: AssetsOverviewProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [uploadState, setUploadState] = useState({
    title: '',
    description: '',
    type: 'IMAGE',
    projectId: '',
    tags: '',
    file: null as File | null,
    isUploading: false,
    uploadProgress: 0,
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/assets');
        
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        
        const data = await response.json();
        setAssets(limit ? data.slice(0, limit) : data);
        setError(null);
      } catch (err) {
        console.error('Error fetching assets:', err);
        setError('Failed to load assets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.map((p: any) => ({ id: p.id, title: p.title })));
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    
    fetchAssets();
    fetchProjects();
  }, [limit]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Auto-detect asset type based on file mime type
      let type = 'OTHER';
      if (file.type.startsWith('image/')) {
        type = 'IMAGE';
      } else if (file.type.startsWith('video/')) {
        type = 'VIDEO';
      } else if (file.type.startsWith('audio/')) {
        type = 'AUDIO';
      } else if (file.type.includes('document') || file.type.includes('pdf') || file.type.includes('text/')) {
        type = 'DOCUMENT';
      }
      
      // Auto-generate title from filename if not set
      const title = uploadState.title || file.name.split('.')[0];
      
      setUploadState({
        ...uploadState,
        file,
        title,
        type,
      });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadState.file) {
      showToast('Please select a file to upload', 'error');
      return;
    }
    
    try {
      setUploadState({ ...uploadState, isUploading: true, uploadProgress: 10 });
      
      // Step 1: Get a pre-signed URL for upload
      const getUploadUrlResponse = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          getUploadUrl: true,
          fileName: uploadState.file.name,
          contentType: uploadState.file.type,
          projectId: uploadState.projectId || null,
        }),
      });
      
      if (!getUploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadUrl, publicUrl, key } = await getUploadUrlResponse.json();
      
      setUploadState({ ...uploadState, uploadProgress: 30 });
      
      // Step 2: Upload the file to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadState.file,
        headers: {
          'Content-Type': uploadState.file.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      setUploadState({ ...uploadState, uploadProgress: 70 });
      
      // Step 3: Create the asset record in the database
      const createAssetResponse = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: uploadState.title,
          description: uploadState.description || null,
          type: uploadState.type,
          url: publicUrl,
          key,
          size: uploadState.file.size,
          mimeType: uploadState.file.type,
          tags: uploadState.tags ? uploadState.tags.split(',').map(tag => tag.trim()) : [],
          projectId: uploadState.projectId || null,
        }),
      });
      
      if (!createAssetResponse.ok) {
        throw new Error('Failed to create asset record');
      }
      
      const createdAsset = await createAssetResponse.json();
      
      // Update the assets list
      setAssets((prev) => [createdAsset, ...prev]);
      
      // Reset form and close modal
      setUploadState({
        title: '',
        description: '',
        type: 'IMAGE',
        projectId: '',
        tags: '',
        file: null,
        isUploading: false,
        uploadProgress: 0,
      });
      setShowUploadModal(false);
      
      // Show success message
      showToast('Asset uploaded successfully', 'success');
    } catch (err) {
      console.error('Error uploading asset:', err);
      showToast('Failed to upload asset', 'error');
      setUploadState({ ...uploadState, isUploading: false, uploadProgress: 0 });
    }
  };

  const getAssetIcon = (type: string, mimeType: string) => {
    switch (type) {
      case 'IMAGE':
        return <ImageIcon size={20} className="text-blue-500" />;
      case 'VIDEO':
        return <Film size={20} className="text-purple-500" />;
      case 'AUDIO':
        return <Music size={20} className="text-green-500" />;
      case 'DOCUMENT':
        return <FileText size={20} className="text-orange-500" />;
      default:
        return <File size={20} className="text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Assets</h2>
        </div>
        <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(limit || 6)].map((_, i) => (
            <div key={i} className="border rounded-md p-2 aspect-square">
              <div className="h-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Assets</h2>
        </div>
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm text-blue-600 hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Assets</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus size={16} className="mr-1" />
          Upload Asset
        </button>
      </div>
      
      {assets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No assets yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Upload your first asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.id} className="border rounded-md overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square relative bg-gray-100">
                {asset.type === 'IMAGE' ? (
                  <Image
                    src={asset.url}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    {getAssetIcon(asset.type, asset.mimeType)}
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="font-medium text-sm truncate" title={asset.title}>
                  {asset.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {asset.type}
                  </span>
                  {asset.project && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      {asset.project.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {limit && assets.length >= limit && (
        <div className="text-center mt-4">
          <Link 
            href="/assets"
            className="text-sm text-blue-600 hover:underline"
          >
            View all assets
          </Link>
        </div>
      )}
      
      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Upload Asset</h2>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                  {uploadState.file ? (
                    <div>
                      <p className="text-sm text-gray-700 mb-1">{uploadState.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => setUploadState({ ...uploadState, file: null })}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Drag and drop a file, or{" "}
                        <label className="text-blue-600 hover:underline cursor-pointer">
                          browse
                          <input
                            type="file"
                            id="file"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={uploadState.title}
                  onChange={(e) => setUploadState({ ...uploadState, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={uploadState.description}
                  onChange={(e) => setUploadState({ ...uploadState, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    value={uploadState.type}
                    onChange={(e) => setUploadState({ ...uploadState, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                    <option value="AUDIO">Audio</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <select
                    id="projectId"
                    value={uploadState.projectId}
                    onChange={(e) => setUploadState({ ...uploadState, projectId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={uploadState.tags}
                  onChange={(e) => setUploadState({ ...uploadState, tags: e.target.value })}
                  placeholder="e.g. logo, branding, thumbnail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {uploadState.isUploading && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadState.uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Uploading... {uploadState.uploadProgress}%
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={uploadState.isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                  disabled={!uploadState.file || uploadState.isUploading}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
