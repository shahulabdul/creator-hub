'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  isAllDay: boolean;
  project: {
    id: string;
    title: string;
  } | null;
}

interface CalendarOverviewProps {
  limit?: number;
}

export default function CalendarOverview({ limit }: CalendarOverviewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isAllDay: false,
    projectId: '',
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        
        // Get today's date in ISO format (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch events for the next 30 days
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        const endDate = thirtyDaysLater.toISOString().split('T')[0];
        
        const response = await fetch(`/api/calendar?startDate=${today}&endDate=${endDate}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        
        // Sort events by start time
        const sortedEvents = data.sort((a: CalendarEvent, b: CalendarEvent) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        
        setEvents(limit ? sortedEvents.slice(0, limit) : sortedEvents);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data.map((p: any) => ({ id: p.id, title: p.title })));
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    
    fetchEvents();
    fetchProjects();
  }, [limit]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Combine date and time for start and end
      const startDateTime = newEvent.isAllDay 
        ? `${newEvent.startDate}T00:00:00.000Z`
        : `${newEvent.startDate}T${newEvent.startTime}:00.000Z`;
      
      const endDateTime = newEvent.isAllDay
        ? `${newEvent.endDate}T23:59:59.999Z`
        : `${newEvent.endDate}T${newEvent.endTime}:00.000Z`;
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEvent.title,
          description: newEvent.description || null,
          startTime: startDateTime,
          endTime: endDateTime,
          location: newEvent.location || null,
          isAllDay: newEvent.isAllDay,
          projectId: newEvent.projectId || null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      const createdEvent = await response.json();
      
      // Update the events list
      setEvents((prev) => {
        const updated = [createdEvent, ...prev];
        return updated.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      });
      
      // Reset form and close modal
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        isAllDay: false,
        projectId: '',
      });
      setShowCreateModal(false);
      
      // Show success message
      showToast('Event created successfully', 'success');
    } catch (err) {
      console.error('Error creating event:', err);
      showToast('Failed to create event', 'error');
    }
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) {
      return 'All day';
    }
    
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    
    return `${startDate.toLocaleTimeString(undefined, options)} - ${endDate.toLocaleTimeString(undefined, options)}`;
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Otherwise, return the formatted date
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    
    return date.toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Calendar</h2>
        </div>
        <div className="animate-pulse">
          {[...Array(limit || 3)].map((_, i) => (
            <div key={i} className="mb-4 p-4 border rounded-md">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Calendar</h2>
        </div>
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          <p>{error}</p>
          <button 
            className="mt-2 text-sm text-blue-600 hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Group events by date
  const groupedEvents: { [key: string]: CalendarEvent[] } = {};
  
  events.forEach((event) => {
    const dateKey = new Date(event.startTime).toDateString();
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus size={16} className="mr-1" />
          New Event
        </button>
      </div>
      
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No upcoming events</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create your first event
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedEvents).map((dateKey) => (
            <div key={dateKey}>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {formatEventDate(dateKey)}
              </h3>
              
              <div className="space-y-3">
                {groupedEvents[dateKey].map((event) => (
                  <div key={event.id} className="border rounded-md p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CalendarIcon size={16} className="text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{event.description}</p>
                        )}
                        
                        <div className="mt-2 flex flex-wrap items-center text-xs text-gray-500 gap-x-3 gap-y-1">
                          <div className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            <span>{formatEventTime(event)}</span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin size={12} className="mr-1" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.project && (
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                {event.project.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {limit && events.length >= limit && (
            <div className="text-center mt-4">
              <Link 
                href="/calendar"
                className="text-sm text-blue-600 hover:underline"
              >
                View full calendar
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    checked={newEvent.isAllDay}
                    onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isAllDay" className="text-sm font-medium text-gray-700">
                    All day event
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={newEvent.startDate}
                    onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {!newEvent.isAllDay && (
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!newEvent.isAllDay}
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={newEvent.endDate}
                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {!newEvent.isAllDay && (
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={!newEvent.isAllDay}
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  id="projectId"
                  value={newEvent.projectId}
                  onChange={(e) => setNewEvent({ ...newEvent, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
