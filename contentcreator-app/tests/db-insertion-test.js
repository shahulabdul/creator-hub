// Database Insertion Test Script
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

async function testDatabaseInsertion() {
  console.log('Starting database insertion test...');
  
  try {
    // Create a test project
    const testProject = await prisma.project.create({
      data: {
        title: 'Test Project ' + new Date().toISOString(),
        description: 'This is a test project to verify database insertion',
        status: 'PLANNING',
        userId: 'demo-user-1', // Using the demo user ID from the API route
      },
    });
    
    console.log('✅ Successfully created test project:');
    console.log(testProject);
    
    // Verify the project was created by retrieving it
    const retrievedProject = await prisma.project.findUnique({
      where: {
        id: testProject.id,
      },
    });
    
    if (retrievedProject) {
      console.log('✅ Successfully retrieved the created project:');
      console.log(retrievedProject);
    } else {
      console.error('❌ Failed to retrieve the created project!');
    }
    
    // Count all projects to verify overall database access
    const projectCount = await prisma.project.count();
    console.log(`Total projects in database: ${projectCount}`);
    
    return { success: true, project: testProject };
  } catch (error) {
    console.error('❌ Error during database test:', error);
    return { success: false, error };
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseInsertion()
  .then(result => {
    if (result.success) {
      console.log('✅ Database insertion test completed successfully!');
    } else {
      console.error('❌ Database insertion test failed!');
    }
  })
  .catch(error => {
    console.error('❌ Unexpected error during test execution:', error);
  });