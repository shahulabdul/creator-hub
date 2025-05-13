import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectCard from '../../contentcreator-app/src/components/projects/ProjectCard';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ProjectCard Component', () => {
  const mockProject = {
    id: '1',
    title: 'Test Project',
    description: 'This is a test project',
    dueDate: new Date('2025-06-01').toISOString(),
    status: 'in-progress',
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
    userId: 'user1',
  };

  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project')).toBeInTheDocument();
    expect(screen.getByText(/Jun 1, 2025/)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
  });

  it('navigates to project details when clicked', () => {
    const mockRouter = { push: jest.fn() };
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);
    
    render(<ProjectCard project={mockProject} />);
    
    fireEvent.click(screen.getByText('Test Project'));
    expect(mockRouter.push).toHaveBeenCalledWith(`/projects/${mockProject.id}`);
  });

  it('shows edit and delete buttons', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByLabelText(/edit project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/delete project/i)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEditMock = jest.fn();
    
    render(<ProjectCard project={mockProject} onEdit={onEditMock} />);
    
    fireEvent.click(screen.getByLabelText(/edit project/i));
    expect(onEditMock).toHaveBeenCalledWith(mockProject.id);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDeleteMock = jest.fn();
    
    render(<ProjectCard project={mockProject} onDelete={onDeleteMock} />);
    
    fireEvent.click(screen.getByLabelText(/delete project/i));
    expect(onDeleteMock).toHaveBeenCalledWith(mockProject.id);
  });
});
