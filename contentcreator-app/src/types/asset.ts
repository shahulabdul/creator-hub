/**
 * Asset type definitions
 */

export interface Asset {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType?: string;
  url: string;
  thumbnailUrl?: string;
  userId: string;
  projectId?: string;
  tags?: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: AssetMetadata;
}

export interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  resolution?: string;
  frameRate?: number;
  author?: string;
  creationDate?: string;
  lastModified?: string;
  [key: string]: any;
}

export interface AssetWithRelations extends Asset {
  project?: Project;
}

// Import these from their respective files to avoid circular dependencies
import { Project } from './project';
