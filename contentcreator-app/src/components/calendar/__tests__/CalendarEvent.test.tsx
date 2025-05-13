import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarEvent from '../CalendarEvent';

describe('CalendarEvent Component', () => {
  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'This is a test event description',
    startDate: new Date('2025-05-15T10:00:00').toISOString(),
    endDate: new Date('2025-05-15T11:30:00').toISOString(),
    projectId: 'project-1',
    project: {
      id: 'project-1',
      title: 'Test Project',
      color: '#FF5733',
    },
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-01').toISOString(),
  };

  const mockOnClick = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders event information correctly', () => {
    render(
      <CalendarEvent 
        event={mockEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if event title is rendered
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    
    // Check if event time is rendered (10:00 AM - 11:30 AM)
    expect(screen.getByText('10:00 AM - 11:30 AM')).toBeInTheDocument();
    
    // Check if project name is rendered
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    
    // Check if the component has the project color as background
    const eventElement = screen.getByTestId('calendar-event');
    expect(eventElement).toHaveStyle(`background-color: ${mockEvent.project.color}`);
  });

  it('calls onClick when event is clicked', () => {
    render(
      <CalendarEvent 
        event={mockEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the event
    fireEvent.click(screen.getByText('Test Event'));
    
    // Check if onClick was called with the event
    expect(mockOnClick).toHaveBeenCalledWith(mockEvent);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <CalendarEvent 
        event={mockEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the edit button
    fireEvent.click(screen.getByLabelText('Edit event'));
    
    // Check if onEdit was called with the event
    expect(mockOnEdit).toHaveBeenCalledWith(mockEvent);
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <CalendarEvent 
        event={mockEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Click on the delete button
    fireEvent.click(screen.getByLabelText('Delete event'));
    
    // Check if onDelete was called with the event id
    expect(mockOnDelete).toHaveBeenCalledWith(mockEvent.id);
    // Check that onClick was not called (event should be stopped)
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders events with different durations correctly', () => {
    // Short event (30 minutes)
    const shortEvent = {
      ...mockEvent,
      startDate: new Date('2025-05-15T10:00:00').toISOString(),
      endDate: new Date('2025-05-15T10:30:00').toISOString(),
    };
    
    const { rerender } = render(
      <CalendarEvent 
        event={shortEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Check if short event has the correct height
    const shortEventElement = screen.getByTestId('calendar-event');
    expect(shortEventElement).toHaveStyle('height: 30px'); // Assuming 1 minute = 1px
    
    // Long event (3 hours)
    const longEvent = {
      ...mockEvent,
      startDate: new Date('2025-05-15T09:00:00').toISOString(),
      endDate: new Date('2025-05-15T12:00:00').toISOString(),
    };
    
    rerender(
      <CalendarEvent 
        event={longEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Check if long event has the correct height
    const longEventElement = screen.getByTestId('calendar-event');
    expect(longEventElement).toHaveStyle('height: 180px'); // Assuming 1 minute = 1px
  });

  it('renders all-day events correctly', () => {
    const allDayEvent = {
      ...mockEvent,
      isAllDay: true,
    };
    
    render(
      <CalendarEvent 
        event={allDayEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    // Check if all-day label is rendered
    expect(screen.getByText('All day')).toBeInTheDocument();
    
    // Check if all-day event has the correct style
    const allDayEventElement = screen.getByTestId('calendar-event');
    expect(allDayEventElement).toHaveClass('all-day-event');
  });
});
