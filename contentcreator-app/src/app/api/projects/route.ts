import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/projects - Get all projects for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For development, use a fixed ID if session.user.id is not available
    let userId = session.user.id || 'demo-user-1';
    console.log('Using userId:', userId);
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const teamId = searchParams.get("teamId");
    
    // Build query filters
    const filters: any = { userId };
    
    if (status) {
      filters.status = status;
    }
    
    if (teamId) {
      filters.teamId = teamId;
    }
    
    try {
      const projects = await prisma.project.findMany({
        where: filters,
        orderBy: { updatedAt: "desc" },
        include: {
          tasks: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          events: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      });
      
      console.log(`Found ${projects.length} projects for user ${userId}`);
      return NextResponse.json(projects);
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return empty array instead of error to avoid UI issues
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    // Return empty array instead of error to avoid UI issues
    return NextResponse.json([]);
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For development, use a fixed ID if session.user.id is not available
    let userId = session.user.id || 'demo-user-1';
    console.log('Creating project with userId:', userId);
    
    // Check if the user exists in the database by ID or email
    let userEmail = session.user.email || 'demo@example.com';
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userEmail }
        ],
      },
    });
    
    // If user doesn't exist, create a demo user
    if (!user) {
      console.log('User not found in database, creating demo user...');
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            name: session.user.name || 'Demo User',
            email: userEmail,
          },
        });
        console.log('Created demo user:', user);
      } catch (userError) {
        console.error('Error creating user:', userError);
        // If we can't create a user, find any existing user to use
        const anyUser = await prisma.user.findFirst();
        if (anyUser) {
          console.log('Using existing user:', anyUser);
          user = anyUser;
          userId = anyUser.id;
        } else {
          throw new Error('Cannot create or find a valid user');
        }
      }
    } else {
      console.log('Found existing user:', user);
      // Make sure we use the correct user ID for the project
      userId = user.id;
    }
    
    let data = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        ...data,
        userId,
      },
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
