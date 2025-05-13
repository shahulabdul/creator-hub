import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { CalendarEvent } from '@/types/calendar';

// Define the export formats
export type ExportFormat = 'pdf' | 'csv' | 'json';

// Interface for project data with related items
export interface ProjectExportData {
  project: Project;
  tasks: Task[];
  events: CalendarEvent[];
}

/**
 * Export project data to the specified format
 * @param data Project data to export
 * @param format Export format (pdf, csv, json)
 * @returns Blob of the exported data
 */
export const exportProject = (data: ProjectExportData, format: ExportFormat): Blob => {
  switch (format) {
    case 'pdf':
      return exportToPdf(data);
    case 'csv':
      return exportToCsv(data);
    case 'json':
      return exportToJson(data);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

/**
 * Export project data to PDF
 * @param data Project data to export
 * @returns Blob of the PDF file
 */
const exportToPdf = (data: ProjectExportData): Blob => {
  const { project, tasks, events } = data;
  
  // In a real implementation, we would use a library like jsPDF
  // For now, we'll create a simple HTML representation and convert it to a Blob
  
  let html = `
    <html>
      <head>
        <title>Project: ${project.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Project: ${project.title}</h1>
        <p><strong>Description:</strong> ${project.description || 'N/A'}</p>
        <p><strong>Status:</strong> ${formatStatus(project.status)}</p>
        <p><strong>Due Date:</strong> ${formatDate(project.dueDate)}</p>
        <p><strong>Created:</strong> ${formatDate(project.createdAt)}</p>
        <p><strong>Last Updated:</strong> ${formatDate(project.updatedAt)}</p>
        
        <h2>Tasks</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map(task => `
              <tr>
                <td>${task.title}</td>
                <td>${formatStatus(task.status)}</td>
                <td>${formatPriority(task.priority)}</td>
                <td>${formatDate(task.dueDate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Calendar Events</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Start Time</th>
              <th>End Time</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(event => `
              <tr>
                <td>${event.title}</td>
                <td>${event.type || 'N/A'}</td>
                <td>${formatDateTime(event.startTime)}</td>
                <td>${formatDateTime(event.endTime)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  return new Blob([html], { type: 'application/pdf' });
};

/**
 * Export project data to CSV
 * @param data Project data to export
 * @returns Blob of the CSV file
 */
const exportToCsv = (data: ProjectExportData): Blob => {
  const { project, tasks, events } = data;
  let csv = '';

  // Project details
  csv += 'Project Details\n';
  csv += `Title,${escapeCSV(project.title)}\n`;
  csv += `Description,${escapeCSV(project.description || '')}\n`;
  csv += `Status,${escapeCSV(formatStatus(project.status))}\n`;
  csv += `Due Date,${formatDate(project.dueDate)}\n`;
  csv += `Created,${formatDate(project.createdAt)}\n`;
  csv += `Last Updated,${formatDate(project.updatedAt)}\n\n`;

  // Tasks
  if (tasks.length > 0) {
    csv += 'Tasks\n';
    csv += 'Title,Description,Status,Priority,Due Date\n';
    tasks.forEach(task => {
      csv += `${escapeCSV(task.title)},${escapeCSV(task.description || '')},${formatStatus(task.status)},${formatPriority(task.priority)},${formatDate(task.dueDate)}\n`;
    });
    csv += '\n';
  }

  // Events
  if (events.length > 0) {
    csv += 'Calendar Events\n';
    csv += 'Title,Type,Start Time,End Time\n';
    events.forEach(event => {
      csv += `${escapeCSV(event.title)},${event.type || 'N/A'},${formatDateTime(event.startTime)},${formatDateTime(event.endTime)}\n`;
    });
  }

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
};

/**
 * Export project data to JSON
 * @param data Project data to export
 * @returns Blob of the JSON file
 */
const exportToJson = (data: ProjectExportData): Blob => {
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
};

// Helper functions
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'not-started': 'Not Started',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'on-hold': 'On Hold',
    'cancelled': 'Cancelled'
  };
  return statusMap[status] || status;
};

const formatPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High'
  };
  return priorityMap[priority] || priority;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const escapeCSV = (str: string): string => {
  if (!str) return '';
  // If the string contains a comma, quote, or newline, wrap it in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // Replace any quotes with double quotes
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
