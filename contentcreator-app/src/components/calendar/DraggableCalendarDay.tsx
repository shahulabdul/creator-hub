import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { CalendarEvent } from '@/types/calendar';
import DraggableCalendarEvent from './DraggableCalendarEvent';

interface DraggableCalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  isToday?: boolean;
  isCurrentMonth?: boolean;
  onEventClick: (eventId: string) => void;
}

const DraggableCalendarDay: React.FC<DraggableCalendarDayProps> = ({
  date,
  events,
  isToday = false,
  isCurrentMonth = true,
  onEventClick,
}) => {
  // Format the day number
  const dayNumber = date.getDate();
  
  // Create a droppable ID that includes the date for uniqueness
  const droppableId = `day-${date.toISOString().split('T')[0]}`;

  return (
    <div
      className={`h-full min-h-[120px] border border-gray-200 p-1 ${
        !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
      }`}
    >
      <div
        className={`text-right mb-1 ${
          isToday
            ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto'
            : !isCurrentMonth
            ? 'text-gray-400'
            : ''
        }`}
      >
        {dayNumber}
      </div>
      
      <Droppable droppableId={droppableId} type="calendar-event">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`h-full overflow-y-auto ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {events
              .filter(
                (event) =>
                  new Date(event.startTime).toDateString() === date.toDateString()
              )
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((event, index) => (
                <DraggableCalendarEvent
                  key={event.id}
                  event={event}
                  index={index}
                  onClick={() => onEventClick(event.id)}
                />
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default DraggableCalendarDay;
