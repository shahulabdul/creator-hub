import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Import googleapis dynamically to avoid issues
let google: any;

// YouTube API scopes needed for analytics
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
];

interface ExtendedSession extends Record<string, any> {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

/**
 * GET /api/analytics/youtube - Get YouTube analytics data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Dynamically import googleapis
    if (!google) {
      const googleapis = await import('googleapis');
      google = googleapis.google;
    }
    
    const session = await getServerSession(authOptions) as ExtendedSession;

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "7daysAgo";
    const endDate = searchParams.get("endDate") || "today";
    const metrics = searchParams.get("metrics")?.split(",") || [
      "views",
      "likes",
      "comments",
      "subscribersGained",
    ];

    // Get the user's account with the access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
    });
    
    if (!account || !account.access_token) {
      return NextResponse.json(
        { error: "No connected YouTube account found" },
        { status: 404 }
      );
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/callback/google"
    );

    // Set credentials from account
    oauth2Client.setCredentials({
      access_token: account.access_token,
      refresh_token: account.refresh_token || undefined,
    });

    // Initialize YouTube API
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Initialize YouTube Analytics API
    const youtubeAnalytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    // Get channel info
    const channelResponse = await youtube.channels.list({
      part: ["snippet", "statistics", "contentDetails"],
      mine: true,
    });

    const channelInfo = channelResponse.data.items?.[0];

    if (!channelInfo) {
      return NextResponse.json({ error: "No YouTube channel found" }, {
        status: 404,
      });
    }

    // Get analytics data
    const analyticsResponse = await youtubeAnalytics.reports.query({
      ids: "channel==" + channelInfo.id,
      startDate,
      endDate,
      metrics: metrics.join(","),
      dimensions: "day",
      sort: "day",
    });

    // Get recent videos
    const videosResponse = await youtube.search.list({
      part: ["snippet"],
      channelId: channelInfo.id,
      maxResults: 10,
      order: "date",
      type: ["video"],
    });

    // Get video details (including statistics)
    let videoDetails = [];

    if (videosResponse.data.items && videosResponse.data.items.length > 0) {
      const videoIds = videosResponse.data.items
        .map((item: any) => item.id?.videoId)
        .filter(Boolean);

      if (videoIds.length > 0) {
        const videoDetailsResponse = await youtube.videos.list({
          part: ["snippet", "statistics", "contentDetails"],
          id: videoIds,
        });

        videoDetails = videoDetailsResponse.data.items || [];
      }
    }

    // Return combined data
    return NextResponse.json({
      channelStats: channelInfo.statistics,
      channelInfo: {
        title: channelInfo.snippet?.title,
        description: channelInfo.snippet?.description,
        thumbnails: channelInfo.snippet?.thumbnails,
        publishedAt: channelInfo.snippet?.publishedAt,
      },
      analytics: analyticsResponse.data,
      recentVideos: videoDetails,
    });
  } catch (error: any) {
    console.error("YouTube API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch YouTube analytics" },
      { status: 500 }
    );
  }
}
