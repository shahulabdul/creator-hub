/**
 * Project type definitions
 */

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  dueDate: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  thumbnail?: string;
  collaborators?: string[];
}

export interface ProjectWithRelations extends Project {
  tasks?: Task[];
  events?: CalendarEvent[];
  assets?: Asset[];
}

// Import these from their respective files to avoid circular dependencies
import { Task } from './task';
import { CalendarEvent } from './calendar';
import { Asset } from './asset';
