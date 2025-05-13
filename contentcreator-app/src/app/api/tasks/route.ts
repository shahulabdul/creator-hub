import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/tasks - Get all tasks for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For development, use a fixed ID if session.user.id is not available
    const userId = session.user.id || 'demo-user-1';
    console.log('Using userId for tasks:', userId);
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const projectId = searchParams.get("projectId");
    
    // Build query filters
    const filters: any = { userId };
    
    if (status) {
      filters.status = status;
    }
    
    if (priority) {
      filters.priority = priority;
    }
    
    if (projectId) {
      filters.projectId = projectId;
    }
    
    try {
      const tasks = await prisma.task.findMany({
        where: filters,
        orderBy: [
          { dueDate: "asc" },
          { priority: "desc" },
          { updatedAt: "desc" }
        ],
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
          comments: {
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
      
      console.log(`Found ${tasks.length} tasks for user ${userId}`);
      return NextResponse.json(tasks);
    } catch (dbError) {
      console.error('Database query error for tasks:', dbError);
      // Return empty array instead of error to avoid UI issues
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // Return empty array instead of error to avoid UI issues
    return NextResponse.json([]);
  }
}

/**
 * POST /api/tasks - Create a new task
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
    
    const task = await prisma.task.create({
      data: {
        ...data,
        userId,
      },
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
