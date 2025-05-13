import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectCard from './contentcreator-app/src/components/projects/ProjectCard';

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProjectCard Component', () => {
  const mockProject = {
    id: 'project-1',
    title: 'Test Project',
    description: 'This is a test project description',
    status: 'ACTIVE',
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
    tasks: [
      { id: 'task-1', title: 'Task 1', status: 'TODO' },
      { id: 'task-2', title: 'Task 2', status: 'IN_PROGRESS' },
      { id: 'task-3', title: 'Task 3', status: 'DONE' },
    ],
    events: [
      { 
        id: 'event-1', 
        title: 'Event 1', 
        startTime: new Date('2025-05-15T10:00:00Z'),
        endTime: new Date('2025-05-15T11:00:00Z'),
      },
    ],
  };

  const mockOnClick = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project information correctly', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if project title and description are rendered
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
    
    // Check if status is rendered
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    
    // Check if task count is rendered
    expect(screen.getByText('3 Tasks')).toBeInTheDocument();
    
    // Check if upcoming event is rendered
    expect(screen.getByText('Event 1')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the card
    fireEvent.click(screen.getByText('Test Project'));
    
    // Check if onClick was called with the project
    expect(mockOnClick).toHaveBeenCalledWith(mockProject);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the edit button
    fireEvent.click(screen.getByLabelText('Edit project'));
    
    // Check if onEdit was called with the project
    expect(mockOnEdit).toHaveBeenCalledWith(mockProject);
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the delete button
    fireEvent.click(screen.getByLabelText('Delete project'));
    
    // Check if onDelete was called with the project id
    expect(mockOnDelete).toHaveBeenCalledWith(mockProject.id);
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('displays task progress correctly', () => {
    render(
      <ProjectCard 
        project={mockProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if task progress is rendered correctly
    // 1 task in progress, 1 done out of 3 total tasks
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
  });
});
