import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'demo-user-1',
      name: 'Demo User',
      email: 'demo@example.com',
      image: 'https://via.placeholder.com/150',
    },
  });

  console.log(`Created demo user: ${demoUser.name}`);

  // Create some demo projects
  const project1 = await prisma.project.upsert({
    where: { id: 'demo-project-1' },
    update: {},
    create: {
      id: 'demo-project-1',
      title: 'YouTube Series',
      description: 'A series of educational videos about web development',
      status: 'IN_PROGRESS',
      userId: demoUser.id,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'demo-project-2' },
    update: {},
    create: {
      id: 'demo-project-2',
      title: 'Instagram Campaign',
      description: 'Product promotion campaign for Instagram',
      status: 'PLANNING',
      userId: demoUser.id,
    },
  });

  console.log(`Created demo projects: ${project1.title}, ${project2.title}`);

  // Create some demo tasks
  const task1 = await prisma.task.upsert({
    where: { id: 'demo-task-1' },
    update: {},
    create: {
      id: 'demo-task-1',
      title: 'Script Writing',
      description: 'Write script for the first video',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      userId: demoUser.id,
      projectId: project1.id,
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 'demo-task-2' },
    update: {},
    create: {
      id: 'demo-task-2',
      title: 'Storyboard Creation',
      description: 'Create storyboard for the Instagram campaign',
      status: 'TODO',
      priority: 'MEDIUM',
      userId: demoUser.id,
      projectId: project2.id,
    },
  });

  console.log(`Created demo tasks: ${task1.title}, ${task2.title}`);

  // Create some demo assets
  const asset1 = await prisma.asset.upsert({
    where: { id: 'demo-asset-1' },
    update: {},
    create: {
      id: 'demo-asset-1',
      title: 'Logo Design',
      description: 'Company logo in various formats',
      type: 'IMAGE',
      url: 'https://via.placeholder.com/150',
      key: 'demo/logo.png',
      size: 25600,
      mimeType: 'image/png',
      tags: JSON.stringify(['logo', 'branding']), // Store as JSON string since SQLite doesn't support arrays
      userId: demoUser.id,
      projectId: project1.id,
    } as any, // Use type assertion to bypass the type check for the tags field
  });

  console.log(`Created demo asset: ${asset1.title}`);

  // Create some demo calendar events
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const event1 = await prisma.calendarEvent.upsert({
    where: { id: 'demo-event-1' },
    update: {},
    create: {
      id: 'demo-event-1',
      title: 'Video Shooting',
      description: 'Shoot the first video of the YouTube series',
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
      location: 'Studio A',
      userId: demoUser.id,
      projectId: project1.id,
    },
  });

  console.log(`Created demo calendar event: ${event1.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
