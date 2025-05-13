'use client';

import { useState, useEffect } from 'react';

export default function TestDatabasePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Function to test project creation
  const testCreateProject = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Test Project ${new Date().toISOString()}`,
          description: 'Testing database insertion',
          status: 'PLANNING',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setResult(data);
      // Refresh projects list after successful creation
      fetchProjects();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all projects
  const fetchProjects = async () => {
    setFetchLoading(true);
    
    try {
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      // Don't set error state here to avoid overriding creation errors
    } finally {
      setFetchLoading(false);
    }
  };

  // Fetch projects on initial load
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Insertion Test</h1>
      
      <div className="mb-6">
        <button
          onClick={testCreateProject}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Test Project'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h2 className="font-bold">Successfully Created Project:</h2>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Existing Projects</h2>
        
        <button
          onClick={fetchProjects}
          disabled={fetchLoading}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
        >
          {fetchLoading ? 'Refreshing...' : 'Refresh Projects'}
        </button>
        
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div key={project.id} className="p-4 border rounded">
                <h3 className="font-bold">{project.title}</h3>
                <p className="text-gray-600">{project.description}</p>
                <div className="mt-2 text-sm">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {project.status}
                  </span>
                  <span className="ml-2 text-gray-500">
                    Created: {new Date(project.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}