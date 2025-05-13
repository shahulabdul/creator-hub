import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/calendar - Get calendar events for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const projectId = searchParams.get("projectId");
    
    // Build query filters
    const filters: any = { userId };
    
    if (startDate && endDate) {
      filters.startTime = {
        gte: new Date(startDate),
      };
      filters.endTime = {
        lte: new Date(endDate),
      };
    } else if (startDate) {
      filters.startTime = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      filters.endTime = {
        lte: new Date(endDate),
      };
    }
    
    if (projectId) {
      filters.projectId = projectId;
    }
    
    const events = await prisma.calendarEvent.findMany({
      where: filters,
      orderBy: { startTime: "asc" },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calendar - Create a new calendar event
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
    if (!data.title || !data.startTime || !data.endTime) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 }
      );
    }
    
    // Validate that end time is after start time
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (endTime < startTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }
    
    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        location: data.location,
        isAllDay: data.isAllDay || false,
        projectId: data.projectId,
        userId,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
