import React, { useState } from 'react';
import { Project } from '@/types/project';
import { Task } from '@/types/task';
import { CalendarEvent } from '@/types/calendar';
import { exportProject, ExportFormat, ProjectExportData } from '@/lib/exporters/projectExporter';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';

interface ProjectExportProps {
  project: Project;
  tasks: Task[];
  events: CalendarEvent[];
}

const ProjectExport: React.FC<ProjectExportProps> = ({ project, tasks, events }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const exportData: ProjectExportData = {
        project,
        tasks,
        events
      };
      
      const blob = exportProject(exportData, exportFormat);
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export project. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-4">Export Project</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Export Format
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setExportFormat('pdf')}
            className={`flex items-center justify-center p-3 rounded-lg border ${
              exportFormat === 'pdf'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileText className="mr-2" size={18} />
            <span>PDF</span>
          </button>
          
          <button
            type="button"
            onClick={() => setExportFormat('csv')}
            className={`flex items-center justify-center p-3 rounded-lg border ${
              exportFormat === 'csv'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="mr-2" size={18} />
            <span>CSV</span>
          </button>
          
          <button
            type="button"
            onClick={() => setExportFormat('json')}
            className={`flex items-center justify-center p-3 rounded-lg border ${
              exportFormat === 'json'
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FileJson className="mr-2" size={18} />
            <span>JSON</span>
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="mr-2" size={18} />
              <span>Export as {exportFormat.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>This will export the project details, tasks, and calendar events.</p>
        {exportFormat === 'pdf' && (
          <p className="mt-1">PDF format is best for printing and sharing with non-technical users.</p>
        )}
        {exportFormat === 'csv' && (
          <p className="mt-1">CSV format is best for importing into spreadsheet applications.</p>
        )}
        {exportFormat === 'json' && (
          <p className="mt-1">JSON format is best for data backup and programmatic access.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectExport;
