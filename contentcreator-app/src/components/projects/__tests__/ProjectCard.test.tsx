import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectCard from '../ProjectCard';

describe('ProjectCard Component', () => {
  const mockProject = {
    id: 'project-1',
    title: 'Summer Campaign',
    description: 'Content series for summer products',
    status: 'IN_PROGRESS',
    dueDate: new Date('2025-06-30').toISOString(),
    color: '#FF5733',
    tasks: [
      { id: 'task-1', title: 'Task 1', completed: true },
      { id: 'task-2', title: 'Task 2', completed: false },
      { id: 'task-3', title: 'Task 3', completed: false },
    ],
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
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
    expect(screen.getByText('Summer Campaign')).toBeInTheDocument();
    expect(screen.getByText('Content series for summer products')).toBeInTheDocument();
    
    // Check if status is rendered
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    
    // Check if due date is rendered (Jun 30, 2025)
    expect(screen.getByText('Due: Jun 30, 2025')).toBeInTheDocument();
    
    // Check if task progress is rendered (1/3 completed)
    expect(screen.getByText('1/3 tasks completed')).toBeInTheDocument();
    
    // Check if progress bar is rendered with correct percentage (33%)
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '33');
    
    // Check if the card has the project color as accent
    const cardElement = screen.getByTestId('project-card');
    expect(cardElement).toHaveStyle(`border-left-color: ${mockProject.color}`);
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
    fireEvent.click(screen.getByText('Summer Campaign'));
    
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

  it('renders different project statuses correctly', () => {
    // Test with 'NOT_STARTED' status
    const notStartedProject = { 
      ...mockProject, 
      status: 'NOT_STARTED',
    };
    
    const { rerender } = render(
      <ProjectCard 
        project={notStartedProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Check if 'NOT STARTED' status is rendered with correct style
    const notStartedStatus = screen.getByText('NOT STARTED');
    expect(notStartedStatus).toHaveClass('status-not-started');
    
    // Test with 'COMPLETED' status
    const completedProject = { 
      ...mockProject, 
      status: 'COMPLETED',
      tasks: [
        { id: 'task-1', title: 'Task 1', completed: true },
        { id: 'task-2', title: 'Task 2', completed: true },
        { id: 'task-3', title: 'Task 3', completed: true },
      ],
    };
    
    rerender(
      <ProjectCard 
        project={completedProject} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Check if 'COMPLETED' status is rendered with correct style
    const completedStatus = screen.getByText('COMPLETED');
    expect(completedStatus).toHaveClass('status-completed');
    
    // Check if progress shows 100% (3/3 tasks completed)
    expect(screen.getByText('3/3 tasks completed')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });
});
