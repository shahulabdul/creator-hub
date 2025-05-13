import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from './contentcreator-app/src/components/tasks/TaskItem';

describe('TaskItem Component', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'This is a test task description',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date('2025-05-20').toISOString(),
    project: {
      id: 'project-1',
      title: 'Test Project',
    },
    assignedTo: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  const mockOnStatusChange = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if task title and description are rendered
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task description')).toBeInTheDocument();
    
    // Check if status is rendered
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    
    // Check if priority is rendered
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    
    // Check if due date is rendered
    expect(screen.getByText(/May 20, 2025/)).toBeInTheDocument();
    
    // Check if project is rendered
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    
    // Check if assigned user is rendered
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('calls onStatusChange when status is changed', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Find and click the status dropdown
    const statusSelect = screen.getByLabelText('Change status');
    fireEvent.change(statusSelect, { target: { value: 'DONE' } });
    
    // Check if onStatusChange was called with the task id and new status
    expect(mockOnStatusChange).toHaveBeenCalledWith(mockTask.id, 'DONE');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the edit button
    fireEvent.click(screen.getByLabelText('Edit task'));
    
    // Check if onEdit was called with the task
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TaskItem 
        task={mockTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the delete button
    fireEvent.click(screen.getByLabelText('Delete task'));
    
    // Check if onDelete was called with the task id
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('displays different styles based on priority', () => {
    const highPriorityTask = { ...mockTask, priority: 'HIGH' };
    const { rerender } = render(
      <TaskItem 
        task={highPriorityTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if high priority has the correct class/style
    const highPriorityElement = screen.getByText('HIGH');
    expect(highPriorityElement).toHaveClass('high-priority');

    // Rerender with medium priority
    const mediumPriorityTask = { ...mockTask, priority: 'MEDIUM' };
    rerender(
      <TaskItem 
        task={mediumPriorityTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if medium priority has the correct class/style
    const mediumPriorityElement = screen.getByText('MEDIUM');
    expect(mediumPriorityElement).toHaveClass('medium-priority');
  });

  it('displays different styles based on status', () => {
    const inProgressTask = { ...mockTask, status: 'IN_PROGRESS' };
    const { rerender } = render(
      <TaskItem 
        task={inProgressTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if in progress status has the correct class/style
    const inProgressElement = screen.getByText('IN_PROGRESS');
    expect(inProgressElement).toHaveClass('status-in-progress');

    // Rerender with done status
    const doneTask = { ...mockTask, status: 'DONE' };
    rerender(
      <TaskItem 
        task={doneTask} 
        onStatusChange={mockOnStatusChange}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if done status has the correct class/style
    const doneElement = screen.getByText('DONE');
    expect(doneElement).toHaveClass('status-done');
  });
});
