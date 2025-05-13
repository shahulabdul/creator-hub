import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Task } from '@/types/task';
import TaskItem from './TaskItem';

interface DraggableTaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
}

const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [taskList, setTaskList] = useState<Task[]>(tasks);

  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = Array.from(taskList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTaskList(items);

    // Update task order in database
    items.forEach((task, index) => {
      onTaskUpdate(task.id, { order: index });
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
            data-testid="task-list"
          >
            {taskList.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`${
                      snapshot.isDragging ? 'bg-gray-100 shadow-lg' : ''
                    }`}
                  >
                    <TaskItem
                      task={task}
                      onUpdate={(updates) => onTaskUpdate(task.id, updates)}
                      onDelete={() => onTaskDelete(task.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DraggableTaskList;
