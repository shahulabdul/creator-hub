import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { deleteFile } from "@/lib/s3";

/**
 * GET /api/assets/[id] - Get a specific asset by ID
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
    const assetId = params.id;
    
    const asset = await prisma.asset.findUnique({
      where: {
        id: assetId,
      },
      include: {
        comments: {
          include: {
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
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    // Check if the user has access to this asset
    if (asset.userId !== userId) {
      // TODO: Check team membership for shared assets
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assets/[id] - Update a specific asset
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
    const assetId = params.id;
    const data = await request.json();
    
    // Check if asset exists and belongs to the user
    const existingAsset = await prisma.asset.findUnique({
      where: {
        id: assetId,
      },
    });
    
    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    if (existingAsset.userId !== userId) {
      // TODO: Check team membership for shared assets
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Update the asset
    const updatedAsset = await prisma.asset.update({
      where: {
        id: assetId,
      },
      data,
    });
    
    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assets/[id] - Delete a specific asset
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
    const assetId = params.id;
    
    // Check if asset exists and belongs to the user
    const existingAsset = await prisma.asset.findUnique({
      where: {
        id: assetId,
      },
    });
    
    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    if (existingAsset.userId !== userId) {
      // TODO: Check team membership for shared assets
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Delete the file from S3
    try {
      await deleteFile(existingAsset.key);
    } catch (s3Error) {
      console.error("Error deleting file from S3:", s3Error);
      // Continue with deletion from database even if S3 deletion fails
    }
    
    // Delete the asset from the database
    await prisma.asset.delete({
      where: {
        id: assetId,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: 500 }
    );
  }
}
