// Mock data for projects API
export const mockProjects = [
  {
    id: 'project-1',
    title: 'YouTube Series',
    description: 'A series of educational videos about web development',
    status: 'IN_PROGRESS',
    startDate: '2025-05-01T00:00:00.000Z',
    endDate: '2025-06-30T00:00:00.000Z',
    createdAt: '2025-04-15T00:00:00.000Z',
    updatedAt: '2025-05-10T00:00:00.000Z',
    userId: 'user-1',
    tasks: [
      {
        id: 'task-1',
        title: 'Script Writing',
        status: 'IN_PROGRESS',
      },
      {
        id: 'task-2',
        title: 'Storyboard Creation',
        status: 'TODO',
      }
    ],
    events: [
      {
        id: 'event-1',
        title: 'Video Shooting',
        startTime: '2025-05-20T10:00:00.000Z',
        endTime: '2025-05-20T14:00:00.000Z',
      }
    ]
  },
  {
    id: 'project-2',
    title: 'Instagram Campaign',
    description: 'Product promotion campaign for Instagram',
    status: 'PLANNING',
    startDate: '2025-05-15T00:00:00.000Z',
    endDate: '2025-06-15T00:00:00.000Z',
    createdAt: '2025-05-01T00:00:00.000Z',
    updatedAt: '2025-05-05T00:00:00.000Z',
    userId: 'user-1',
    tasks: [
      {
        id: 'task-3',
        title: 'Content Planning',
        status: 'TODO',
      }
    ],
    events: []
  }
];
