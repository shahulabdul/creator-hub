import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";
import { generateUploadUrl, getPublicUrl } from "@/lib/s3";
import crypto from "crypto";

/**
 * GET /api/assets - Get all assets for the authenticated user
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
    const type = searchParams.get("type");
    const projectId = searchParams.get("projectId");
    const tags = searchParams.get("tags")?.split(",");
    
    // Build query filters
    const filters: any = { userId };
    
    if (type) {
      filters.type = type;
    }
    
    if (projectId) {
      filters.projectId = projectId;
    }
    
    if (tags && tags.length > 0) {
      filters.tags = {
        hasSome: tags,
      };
    }
    
    const assets = await prisma.asset.findMany({
      where: filters,
      orderBy: { updatedAt: "desc" },
      include: {
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
          take: 3, // Only include the 3 most recent comments
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets - Create a new asset or get a pre-signed URL for upload
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // Check if this is a request for a pre-signed URL
    if (data.getUploadUrl) {
      const { fileName, contentType, projectId } = data;
      
      if (!fileName || !contentType) {
        return NextResponse.json(
          { error: "fileName and contentType are required" },
          { status: 400 }
        );
      }
      
      // Generate a unique key for the file
      const fileExtension = fileName.split('.').pop();
      const randomId = crypto.randomBytes(16).toString('hex');
      const key = `assets/${userId}/${randomId}-${fileName}`;
      
      // Generate a pre-signed URL for uploading
      const uploadUrl = await generateUploadUrl(key, contentType);
      const publicUrl = getPublicUrl(key);
      
      return NextResponse.json({
        uploadUrl,
        publicUrl,
        key,
        projectId,
      });
    }
    
    // Otherwise, create a new asset record
    const { title, description, type, url, key, size, mimeType, tags, projectId } = data;
    
    // Validate required fields
    if (!title || !type || !url || !key || !size || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const asset = await prisma.asset.create({
      data: {
        title,
        description,
        type,
        url,
        key,
        size,
        mimeType,
        tags: tags || [],
        projectId,
        userId,
      },
    });
    
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
