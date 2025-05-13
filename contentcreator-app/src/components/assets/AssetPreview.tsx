import React, { useState } from 'react';
import { Asset } from '@/types/asset';
import Image from 'next/image';
import { FileText, Video, Music, File, X, Download, ExternalLink } from 'lucide-react';

interface AssetPreviewProps {
  asset: Asset;
  onClose: () => void;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ asset, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the file type based on the MIME type or extension
  const getFileType = () => {
    const mimeType = asset.mimeType?.toLowerCase() || '';
    const fileExtension = asset.fileName.split('.').pop()?.toLowerCase() || '';

    if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension)) {
      return 'image';
    } else if (mimeType.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi'].includes(fileExtension)) {
      return 'video';
    } else if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(fileExtension)) {
      return 'audio';
    } else if (mimeType.includes('pdf') || fileExtension === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(fileExtension)) {
      return 'document';
    } else {
      return 'other';
    }
  };

  const fileType = getFileType();

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load the asset. The file might be corrupted or inaccessible.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-medium truncate">{asset.fileName}</h3>
          <div className="flex items-center space-x-2">
            <a
              href={asset.url}
              download={asset.fileName}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Download"
            >
              <Download size={20} />
            </a>
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          {isLoading && (
            <div className="flex items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center">
              <p>{error}</p>
            </div>
          )}

          <div className={isLoading ? 'hidden' : ''}>
            {fileType === 'image' && (
              <div className="relative max-h-[70vh] max-w-full">
                <Image
                  src={asset.url}
                  alt={asset.fileName}
                  width={800}
                  height={600}
                  className="object-contain max-h-[70vh]"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </div>
            )}

            {fileType === 'video' && (
              <video
                src={asset.url}
                controls
                className="max-h-[70vh] max-w-full"
                onLoadedData={handleLoad}
                onError={handleError}
              >
                Your browser does not support the video tag.
              </video>
            )}

            {fileType === 'audio' && (
              <div className="w-full max-w-md">
                <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center">
                  <Music size={48} className="text-blue-500 mb-4" />
                  <p className="mb-4 text-center">{asset.fileName}</p>
                  <audio
                    src={asset.url}
                    controls
                    className="w-full"
                    onLoadedData={handleLoad}
                    onError={handleError}
                  >
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              </div>
            )}

            {fileType === 'pdf' && (
              <iframe
                src={`${asset.url}#view=FitH`}
                className="w-full h-[70vh]"
                title={asset.fileName}
                onLoad={handleLoad}
                onError={handleError}
              />
            )}

            {fileType === 'document' && (
              <div className="w-full max-w-md text-center">
                <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center">
                  <FileText size={48} className="text-blue-500 mb-4" />
                  <p className="mb-2">Document Preview</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {asset.fileName}
                  </p>
                  <p className="text-sm">
                    Document preview is not available. Please download the file to view it.
                  </p>
                  <a
                    href={asset.url}
                    download={asset.fileName}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setIsLoading(false)}
                  >
                    Download Document
                  </a>
                </div>
              </div>
            )}

            {fileType === 'other' && (
              <div className="w-full max-w-md text-center">
                <div className="bg-gray-100 p-6 rounded-lg flex flex-col items-center">
                  <File size={48} className="text-blue-500 mb-4" />
                  <p className="mb-2">File Preview</p>
                  <p className="text-sm text-gray-500 mb-4">
                    {asset.fileName}
                  </p>
                  <p className="text-sm">
                    Preview is not available for this file type. Please download the file to view it.
                  </p>
                  <a
                    href={asset.url}
                    download={asset.fileName}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => setIsLoading(false)}
                  >
                    Download File
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Uploaded</p>
              <p>{new Date(asset.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Size</p>
              <p>{formatFileSize(asset.fileSize)}</p>
            </div>
            {asset.tags && asset.tags.length > 0 && (
              <div className="col-span-2">
                <p className="text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {asset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default AssetPreview;
