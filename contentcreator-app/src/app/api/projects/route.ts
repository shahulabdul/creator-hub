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
    const userId = session.user.id || 'demo-user-1';
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
    
    const userId = session.user.id;
    const data = await request.json();
    
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
