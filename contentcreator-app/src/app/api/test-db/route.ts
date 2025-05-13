import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/test-db - Test database connection and operations
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Testing database connection and operations...");
    
    // First, check if our demo user exists
    const demoUserId = "demo-user-1";
    let demoUser = await prisma.user.findUnique({
      where: { id: demoUserId },
    });
    
    // If demo user doesn't exist, create it
    if (!demoUser) {
      console.log("Demo user not found, creating one...");
      demoUser = await prisma.user.create({
        data: {
          id: demoUserId,
          name: "Demo User",
          email: "demo@example.com",
        },
      });
      console.log("Created demo user:", demoUser);
    } else {
      console.log("Found existing demo user:", demoUser);
    }
    
    // Test database connection by counting projects
    const projectCount = await prisma.project.count();
    console.log(`Current project count: ${projectCount}`);
    
    // Create a test project
    const testProject = await prisma.project.create({
      data: {
        title: `Test Project ${new Date().toISOString()}`,
        description: "Created by test-db API endpoint",
        status: "PLANNING",
        userId: demoUser.id,
      },
    });
    
    console.log("Successfully created test project:", testProject);
    
    // Verify the project was created by retrieving it
    const retrievedProject = await prisma.project.findUnique({
      where: {
        id: testProject.id,
      },
    });
    
    // Count projects again to verify the insertion
    const newProjectCount = await prisma.project.count();
    
    return NextResponse.json({
      success: true,
      message: "Database test completed successfully",
      initialCount: projectCount,
      newCount: newProjectCount,
      demoUser: demoUser,
      createdProject: testProject,
      retrievedProject: retrievedProject,
    });
  } catch (error: any) {
    console.error("Error during database test:", error);
    
    return NextResponse.json(
      {
        success: false,
        message: "Database test failed",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}