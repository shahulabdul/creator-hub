/**
 * Comment type definitions
 */

export interface Comment {
  id: string;
  content: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  taskId?: string;
  projectId?: string;
  assetId?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  mentions?: string[];
}

export interface CommentWithRelations extends Comment {
  task?: Task;
  project?: Project;
  asset?: Asset;
  replies?: Comment[];
}

// Import these from their respective files to avoid circular dependencies
import { Task } from './task';
import { Project } from './project';
import { Asset } from './asset';
