import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { CalendarEvent } from '@/types/calendar';

interface DraggableCalendarEventProps {
  event: CalendarEvent;
  index: number;
  onClick?: () => void;
}

const DraggableCalendarEvent: React.FC<DraggableCalendarEventProps> = ({
  event,
  index,
  onClick,
}) => {
  // Determine color based on event type or project
  const getEventColor = () => {
    switch (event.type) {
      case 'shooting':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'editing':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'publishing':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'planning':
        return 'bg-purple-100 border-purple-400 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <Draggable draggableId={event.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-2 mb-1 rounded border-l-4 cursor-pointer transition-all ${getEventColor()} ${
            snapshot.isDragging ? 'shadow-lg scale-105' : ''
          }`}
          onClick={onClick}
          data-testid="calendar-event"
        >
          <div className="text-sm font-medium">{event.title}</div>
          <div className="text-xs flex justify-between">
            <span>
              {new Date(event.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' - '}
              {new Date(event.endTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {event.projectId && (
              <span className="italic opacity-75">
                {event.projectTitle || 'Project'}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableCalendarEvent;
