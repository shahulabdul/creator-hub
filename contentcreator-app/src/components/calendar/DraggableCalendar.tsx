import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { CalendarEvent } from '@/types/calendar';
import DraggableCalendarDay from './DraggableCalendarDay';

interface DraggableCalendarProps {
  events: CalendarEvent[];
  onEventUpdate: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  onEventClick: (eventId: string) => void;
}

const DraggableCalendar: React.FC<DraggableCalendarProps> = ({
  events,
  onEventUpdate,
  onEventClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Generate calendar days for the current month view
  useEffect(() => {
    const days: Date[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Add days from the previous month to fill the first week
    for (let i = firstDayOfWeek; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    // Add all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add days from the next month to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }
    
    setCalendarDays(days);
  }, [currentDate]);

  // Handle navigation to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Handle navigation to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Handle navigation to current month
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle drag end for calendar events
  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) {
      return;
    }

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Extract the date from the destination droppable ID
    const targetDateStr = destination.droppableId.replace('day-', '');
    const targetDate = new Date(targetDateStr);
    
    // Find the event that was dragged
    const draggedEvent = events.find(event => event.id === draggableId);
    
    if (!draggedEvent) {
      return;
    }
    
    // Calculate the time difference between the original start and end times
    const startTime = new Date(draggedEvent.startTime);
    const endTime = new Date(draggedEvent.endTime);
    const duration = endTime.getTime() - startTime.getTime();
    
    // Create new start time by preserving the original time but changing the date
    const newStartTime = new Date(targetDate);
    newStartTime.setHours(startTime.getHours(), startTime.getMinutes());
    
    // Create new end time by adding the original duration
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    // Update the event with new times
    onEventUpdate(draggableId, {
      startTime: newStartTime.toISOString(),
      endTime: newEndTime.toISOString(),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Previous month"
          >
            &lt;
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Next month"
          >
            &gt;
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center py-2 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <DraggableCalendarDay
                key={day.toISOString()}
                date={day}
                events={events}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                onEventClick={onEventClick}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default DraggableCalendar;
