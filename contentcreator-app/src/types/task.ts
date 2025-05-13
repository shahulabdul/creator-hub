/**
 * Task type definitions
 */

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  projectId?: string;
  userId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  order?: number;
  tags?: string[];
  checklist?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskWithRelations extends Task {
  project?: Project;
  comments?: Comment[];
}

// Import these from their respective files to avoid circular dependencies
import { Project } from './project';
import { Comment } from './comment';
