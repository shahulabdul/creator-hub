import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

interface ExtendedSession extends Record<string, any> {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

/**
 * GET /api/analytics/instagram - Get Instagram analytics data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "day";
    const metrics = searchParams.get("metrics")?.split(",") || [
      "impressions",
      "reach",
      "profile_views",
      "follower_count"
    ];
    
    // Get the user's account with the access token
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "instagram",
      },
    });
    
    if (!account || !account.access_token) {
      // Try to find a Facebook account that might have Instagram permissions
      const fbAccount = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          provider: "facebook",
        },
      });
      
      if (!fbAccount || !fbAccount.access_token) {
        return NextResponse.json(
          { error: "No connected Instagram account found" },
          { status: 404 }
        );
      }
      
      // Use Facebook access token for Instagram Graph API
      const igAccountResponse = await fetch(
        `https://graph.facebook.com/v16.0/me/accounts?fields=instagram_business_account{id,name,username,profile_picture_url,biography,follows_count,followers_count,media_count}&access_token=${fbAccount.access_token}`
      );
      
      if (!igAccountResponse.ok) {
        return NextResponse.json(
          { error: "Failed to fetch Instagram account from Facebook" },
          { status: igAccountResponse.status }
        );
      }
      
      const igAccountData = await igAccountResponse.json();
      
      if (!igAccountData.data || igAccountData.data.length === 0 || !igAccountData.data[0].instagram_business_account) {
        return NextResponse.json(
          { error: "No Instagram Business account connected to your Facebook account" },
          { status: 404 }
        );
      }
      
      const igBusinessAccount = igAccountData.data[0].instagram_business_account;
      
      // Fetch Instagram insights
      const insightsResponse = await fetch(
        `https://graph.facebook.com/v16.0/${igBusinessAccount.id}/insights?metric=${metrics.join(",")}&period=${period}&access_token=${fbAccount.access_token}`
      );
      
      let insights = null;
      
      if (insightsResponse.ok) {
        insights = await insightsResponse.json();
      } else {
        console.error("Failed to fetch Instagram insights:", await insightsResponse.text());
      }
      
      // Fetch recent media
      const mediaResponse = await fetch(
        `https://graph.facebook.com/v16.0/${igBusinessAccount.id}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&limit=10&access_token=${fbAccount.access_token}`
      );
      
      let recentMedia = [];
      
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        recentMedia = mediaData.data || [];
      } else {
        console.error("Failed to fetch Instagram media:", await mediaResponse.text());
      }
      
      // Return combined data
      return NextResponse.json({
        profileInfo: {
          ...igBusinessAccount,
          followers_count: igBusinessAccount.followers_count,
          media_count: igBusinessAccount.media_count,
          biography: igBusinessAccount.biography,
          profile_picture_url: igBusinessAccount.profile_picture_url,
          username: igBusinessAccount.username,
          name: igBusinessAccount.name
        },
        insights,
        recentMedia,
      });
    }
    
    // If we have a direct Instagram token
    // Fetch Instagram profile info
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,biography,profile_picture_url&access_token=${account.access_token}`
    );
    
    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Instagram profile data" },
        { status: profileResponse.status }
      );
    }
    
    const profileInfo = await profileResponse.json();
    
    // Fetch Instagram insights
    const insightsResponse = await fetch(
      `https://graph.instagram.com/${profileInfo.id}/insights?metric=${metrics.join(",")}&period=${period}&access_token=${account.access_token}`
    );
    
    if (!insightsResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Instagram insights data" },
        { status: insightsResponse.status }
      );
    }
    
    const insightsData = await insightsResponse.json();
    
    // Fetch recent media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&limit=10&access_token=${account.access_token}`
    );
    
    let recentMedia = [];
    
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      recentMedia = mediaData.data || [];
    }
    
    // Combine all data
    const result = {
      profileInfo,
      insights: insightsData,
      recentMedia,
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching Instagram analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram analytics" },
      { status: 500 }
    );
  }
}
