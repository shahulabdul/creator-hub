/**
 * Calendar event type definitions
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type?: 'shooting' | 'editing' | 'publishing' | 'planning' | 'meeting' | 'other';
  location?: string;
  projectId?: string;
  projectTitle?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isAllDay?: boolean;
  attendees?: string[];
  color?: string;
  recurrence?: RecurrenceRule;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  endAfter?: number;
  daysOfWeek?: number[];
}

export interface CalendarEventWithRelations extends CalendarEvent {
  project?: Project;
}

// Import these from their respective files to avoid circular dependencies
import { Project } from './project';
