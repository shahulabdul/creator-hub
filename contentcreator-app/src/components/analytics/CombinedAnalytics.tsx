'use client';

import { useState, useEffect } from 'react';
import { fetchYouTubeAnalytics, fetchInstagramAnalytics } from '@/lib/analytics';
import { showToast } from '@/components/ui/toaster';
import { Loader2, Youtube, Instagram } from 'lucide-react';

// Chart library
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface CombinedAnalyticsProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function CombinedAnalytics({ dateRange }: CombinedAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [youtubeData, setYoutubeData] = useState<any>(null);
  const [instagramData, setInstagramData] = useState<any>(null);
  const [combinedMetrics, setCombinedMetrics] = useState<any[]>([]);
  const [audienceData, setAudienceData] = useState<any[]>([]);

  // Colors for charts
  const COLORS = ['#FF0000', '#E1306C', '#4267B2', '#1DA1F2'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch YouTube data
        let ytData = null;
        try {
          ytData = await fetchYouTubeAnalytics(
            dateRange.startDate,
            dateRange.endDate,
            ['views', 'likes', 'comments', 'subscribersGained']
          );
          setYoutubeData(ytData);
        } catch (ytError) {
          console.error('Error fetching YouTube data:', ytError);
          // Continue with Instagram data even if YouTube fails
        }

        // Fetch Instagram data
        let igData = null;
        try {
          igData = await fetchInstagramAnalytics(
            'day',
            ['impressions', 'reach', 'profile_views', 'follower_count']
          );
          setInstagramData(igData);
        } catch (igError) {
          console.error('Error fetching Instagram data:', igError);
          // Continue even if Instagram fails
        }

        // Process combined metrics
        processCombinedData(ytData, igData);
      } catch (err) {
        console.error('Error fetching combined analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
        showToast('Failed to fetch analytics data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Process and combine data from both platforms
  const processCombinedData = (ytData: any, igData: any) => {
    // Prepare engagement metrics comparison
    const engagementMetrics = [
      {
        name: 'Audience',
        YouTube: ytData?.channelStats?.subscriberCount || 0,
        Instagram: igData?.profileInfo?.followers_count || 0,
      },
      {
        name: 'Engagement',
        YouTube: calculateYouTubeEngagement(ytData),
        Instagram: calculateInstagramEngagement(igData),
      },
      {
        name: 'Content',
        YouTube: ytData?.channelStats?.videoCount || 0,
        Instagram: igData?.profileInfo?.media_count || 0,
      },
    ];

    setCombinedMetrics(engagementMetrics);

    // Prepare audience distribution data for pie chart
    const audience = [
      {
        name: 'YouTube',
        value: ytData?.channelStats?.subscriberCount || 0,
      },
      {
        name: 'Instagram',
        value: igData?.profileInfo?.followers_count || 0,
      },
    ];

    setAudienceData(audience);
  };

  // Calculate YouTube engagement (simplified)
  const calculateYouTubeEngagement = (data: any) => {
    if (!data || !data.analytics || !data.analytics.rows) {
      return 0;
    }

    // Sum of likes and comments
    let likes = 0;
    let comments = 0;

    const likesIndex = data.analytics.columnHeaders.findIndex(
      (header: any) => header.name === 'likes'
    );

    const commentsIndex = data.analytics.columnHeaders.findIndex(
      (header: any) => header.name === 'comments'
    );

    if (likesIndex !== -1) {
      likes = data.analytics.rows.reduce(
        (sum: number, row: any) => sum + (row[likesIndex] || 0),
        0
      );
    }

    if (commentsIndex !== -1) {
      comments = data.analytics.rows.reduce(
        (sum: number, row: any) => sum + (row[commentsIndex] || 0),
        0
      );
    }

    return likes + comments;
  };

  // Calculate Instagram engagement (simplified)
  const calculateInstagramEngagement = (data: any) => {
    if (!data || !data.recentMedia || data.recentMedia.length === 0) {
      return 0;
    }

    // Sum of likes and comments across recent posts
    return data.recentMedia.reduce(
      (sum: number, post: any) => sum + (post.like_count || 0) + (post.comments_count || 0),
      0
    );
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading combined analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!youtubeData && !instagramData) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center">
        <p className="text-yellow-700 mb-4">No social media accounts connected</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {/* Implement YouTube connection flow */}}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <Youtube className="mr-2" size={16} />
            Connect YouTube
          </button>
          <button
            onClick={() => {/* Implement Instagram connection flow */}}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
          >
            <Instagram className="mr-2" size={16} />
            Connect Instagram
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Comparison */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Platform Comparison</h3>
          
          <div className="h-80">
            {combinedMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={combinedMetrics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                  <Bar dataKey="YouTube" fill="#FF0000" />
                  <Bar dataKey="Instagram" fill="#E1306C" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No comparison data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Audience Distribution */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Audience Distribution</h3>
          
          <div className="h-80">
            {audienceData.length > 0 && audienceData.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={audienceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {audienceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No audience data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Platform Stats Summary */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Platform Stats Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* YouTube Stats */}
          {youtubeData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Youtube className="text-red-600 mr-2" size={24} />
                <h4 className="text-lg font-medium">YouTube</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Subscribers</p>
                  <p className="text-xl font-bold">{formatNumber(youtubeData.channelStats?.subscriberCount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-xl font-bold">{formatNumber(youtubeData.channelStats?.viewCount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Videos</p>
                  <p className="text-xl font-bold">{formatNumber(youtubeData.channelStats?.videoCount || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Period Views</p>
                  <p className="text-xl font-bold">
                    {formatNumber(
                      calculateTotalMetric(youtubeData, 'views')
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Instagram Stats */}
          {instagramData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Instagram className="text-purple-600 mr-2" size={24} />
                <h4 className="text-lg font-medium">Instagram</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Followers</p>
                  <p className="text-xl font-bold">{formatNumber(instagramData.profileInfo?.followers_count || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posts</p>
                  <p className="text-xl font-bold">{formatNumber(instagramData.profileInfo?.media_count || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Impressions</p>
                  <p className="text-xl font-bold">
                    {formatNumber(
                      getInstagramMetricValue(instagramData, 'impressions')
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reach</p>
                  <p className="text-xl font-bold">
                    {formatNumber(
                      getInstagramMetricValue(instagramData, 'reach')
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Growth Opportunities */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Growth Insights</h3>
        
        <div className="space-y-4">
          {youtubeData && instagramData ? (
            <>
              <div className="p-3 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-700 mb-1">Cross-Platform Promotion</h4>
                <p className="text-sm text-gray-700">
                  {youtubeData.channelStats?.subscriberCount > instagramData.profileInfo?.followers_count
                    ? 'Your YouTube audience is larger than your Instagram following. Consider promoting your Instagram content on your YouTube channel to grow your Instagram audience.'
                    : 'Your Instagram following is larger than your YouTube subscriber base. Consider promoting your YouTube videos to your Instagram audience to grow your channel.'}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-700 mb-1">Content Strategy</h4>
                <p className="text-sm text-gray-700">
                  Based on your analytics, focus on creating more {getRecommendedContentType(youtubeData, instagramData)} content to maximize engagement across platforms.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Connect both platforms to see personalized growth insights</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate total metric from YouTube data
function calculateTotalMetric(data: any, metricName: string) {
  if (!data || !data.analytics || !data.analytics.rows) {
    return 0;
  }
  
  const metricIndex = data.analytics.columnHeaders.findIndex(
    (header: any) => header.name === metricName
  );
  
  if (metricIndex === -1) {
    return 0;
  }
  
  return data.analytics.rows.reduce(
    (sum: number, row: any) => sum + (row[metricIndex] || 0),
    0
  );
}

// Helper function to get Instagram metric value
function getInstagramMetricValue(data: any, metricName: string) {
  if (!data || !data.insights || !data.insights.data) {
    return 0;
  }
  
  const metricData = data.insights.data.find(
    (item: any) => item.name === metricName
  );
  
  if (!metricData || !metricData.values || metricData.values.length === 0) {
    return 0;
  }
  
  return metricData.values[0].value;
}

// Helper function to recommend content type based on analytics
function getRecommendedContentType(ytData: any, igData: any) {
  // This is a simplified recommendation logic
  // In a real app, this would be more sophisticated
  
  const ytEngagement = calculateTotalMetric(ytData, 'likes') + calculateTotalMetric(ytData, 'comments');
  const ytViews = calculateTotalMetric(ytData, 'views');
  
  const igImpressions = getInstagramMetricValue(igData, 'impressions');
  const igReach = getInstagramMetricValue(igData, 'reach');
  
  if (ytEngagement / ytViews > 0.1) {
    return 'interactive YouTube';
  } else if (igImpressions / igReach > 1.5) {
    return 'visually appealing Instagram';
  } else {
    return 'consistent cross-platform';
  }
}
