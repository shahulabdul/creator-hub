import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * GET /api/projects/[id] - Get a specific project by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const projectId = params.id;
    
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        tasks: true,
        assets: true,
        checklists: {
          include: {
            items: true,
          },
        },
        events: true,
      },
    });
    
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Check if the user has access to this project
    if (project.userId !== userId) {
      // TODO: Check team membership for shared projects
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id] - Update a specific project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const projectId = params.id;
    const data = await request.json();
    
    // Check if project exists and belongs to the user
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    if (existingProject.userId !== userId) {
      // TODO: Check team membership for shared projects
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Update the project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data,
    });
    
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id] - Delete a specific project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const projectId = params.id;
    
    // Check if project exists and belongs to the user
    const existingProject = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    if (existingProject.userId !== userId) {
      // TODO: Check team membership for shared projects
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Delete the project
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
