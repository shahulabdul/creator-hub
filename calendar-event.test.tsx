import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CalendarEvent from './contentcreator-app/src/components/calendar/CalendarEvent';

describe('CalendarEvent Component', () => {
  const mockEvent = {
    id: 'event-1',
    title: 'Test Event',
    description: 'This is a test event description',
    startTime: new Date('2025-05-15T10:00:00Z'),
    endTime: new Date('2025-05-15T11:00:00Z'),
    type: 'SHOOTING',
    location: 'Studio A',
    project: {
      id: 'project-1',
      title: 'Test Project',
    },
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

    // Check if event title and description are rendered
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('This is a test event description')).toBeInTheDocument();
    
    // Check if time is rendered
    expect(screen.getByText('10:00 AM - 11:00 AM')).toBeInTheDocument();
    
    // Check if type is rendered
    expect(screen.getByText('SHOOTING')).toBeInTheDocument();
    
    // Check if location is rendered
    expect(screen.getByText('Studio A')).toBeInTheDocument();
    
    // Check if project is rendered
    expect(screen.getByText('Test Project')).toBeInTheDocument();
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

  it('displays different styles based on event type', () => {
    const shootingEvent = { ...mockEvent, type: 'SHOOTING' };
    const { rerender } = render(
      <CalendarEvent 
        event={shootingEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if shooting event has the correct class/style
    const shootingElement = screen.getByText('SHOOTING');
    expect(shootingElement).toHaveClass('event-type-shooting');

    // Rerender with editing event type
    const editingEvent = { ...mockEvent, type: 'EDITING' };
    rerender(
      <CalendarEvent 
        event={editingEvent} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if editing event has the correct class/style
    const editingElement = screen.getByText('EDITING');
    expect(editingElement).toHaveClass('event-type-editing');
  });

  it('formats date and time correctly', () => {
    // Test with different date and time
    const eventWithDifferentTime = { 
      ...mockEvent, 
      startTime: new Date('2025-05-15T14:30:00Z'),
      endTime: new Date('2025-05-15T16:45:00Z'),
    };
    
    render(
      <CalendarEvent 
        event={eventWithDifferentTime} 
        onClick={mockOnClick}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if time is formatted correctly
    expect(screen.getByText('2:30 PM - 4:45 PM')).toBeInTheDocument();
  });

  it('handles all-day events correctly', () => {
    // Test with all-day event
    const allDayEvent = { 
      ...mockEvent, 
      startTime: new Date('2025-05-15T00:00:00Z'),
      endTime: new Date('2025-05-15T23:59:59Z'),
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

    // Check if all-day indicator is shown
    expect(screen.getByText('All Day')).toBeInTheDocument();
  });
});
