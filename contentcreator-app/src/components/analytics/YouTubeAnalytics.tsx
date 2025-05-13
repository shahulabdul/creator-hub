'use client';

import { useState, useEffect } from 'react';
import { fetchYouTubeAnalytics, processYouTubeAnalyticsForChart, calculatePercentageChange } from '@/lib/analytics';
import { showToast } from '@/components/ui/toaster';
import { ArrowUp, ArrowDown, Loader2, ExternalLink, Play, ThumbsUp, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Chart library (we'll use a simple implementation here)
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface YouTubeAnalyticsProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function YouTubeAnalytics({ dateRange }: YouTubeAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [comparisonData, setComparisonData] = useState<any>(null);

  // Metrics to display
  const metrics = [
    { id: 'views', label: 'Views', icon: Play },
    { id: 'likes', label: 'Likes', icon: ThumbsUp },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
    { id: 'subscribersGained', label: 'New Subscribers', icon: Users },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch analytics data for the selected date range
        const data = await fetchYouTubeAnalytics(
          dateRange.startDate,
          dateRange.endDate,
          metrics.map(m => m.id)
        );
        setAnalyticsData(data);

        // Calculate previous period for comparison
        const daysDiff = Math.floor(
          (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const prevEndDate = new Date(dateRange.startDate);
        prevEndDate.setDate(prevEndDate.getDate() - 1);
        
        const prevStartDate = new Date(prevEndDate);
        prevStartDate.setDate(prevStartDate.getDate() - daysDiff);
        
        // Fetch comparison data
        const comparisonData = await fetchYouTubeAnalytics(
          prevStartDate.toISOString().split('T')[0],
          prevEndDate.toISOString().split('T')[0],
          metrics.map(m => m.id)
        );
        
        setComparisonData(comparisonData);
      } catch (err) {
        console.error('Error fetching YouTube analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch YouTube analytics');
        showToast('Failed to fetch YouTube analytics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Calculate totals for each metric
  const calculateMetricTotals = (data: any) => {
    if (!data || !data.analytics || !data.analytics.rows) {
      return {};
    }

    const totals: Record<string, number> = {};
    
    metrics.forEach(metric => {
      const metricIndex = data.analytics.columnHeaders.findIndex(
        (header: any) => header.name === metric.id
      );
      
      if (metricIndex !== -1) {
        totals[metric.id] = data.analytics.rows.reduce(
          (sum: number, row: any) => sum + (row[metricIndex] || 0),
          0
        );
      } else {
        totals[metric.id] = 0;
      }
    });
    
    return totals;
  };

  // Get percentage changes
  const getPercentageChanges = () => {
    if (!analyticsData || !comparisonData) {
      return {};
    }
    
    const currentTotals = calculateMetricTotals(analyticsData);
    const previousTotals = calculateMetricTotals(comparisonData);
    
    const changes: Record<string, number> = {};
    
    metrics.forEach(metric => {
      changes[metric.id] = calculatePercentageChange(
        currentTotals[metric.id] || 0,
        previousTotals[metric.id] || 0
      );
    });
    
    return changes;
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
        <p className="text-gray-500">Loading YouTube analytics...</p>
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

  if (!analyticsData || !analyticsData.channelId) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center">
        <p className="text-yellow-700 mb-4">No YouTube channel connected</p>
        <button
          onClick={() => {/* Implement YouTube connection flow */}}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Connect YouTube Account
        </button>
      </div>
    );
  }

  const metricTotals = calculateMetricTotals(analyticsData);
  const percentageChanges = getPercentageChanges();
  const chartData = processYouTubeAnalyticsForChart(analyticsData, selectedMetric);

  return (
    <div className="space-y-6">
      {/* Channel Overview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          {analyticsData.channelThumbnail && (
            <Image
              src={analyticsData.channelThumbnail}
              alt="Channel thumbnail"
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          
          <div>
            <h2 className="text-xl font-semibold">{analyticsData.channelTitle || 'Your YouTube Channel'}</h2>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>{formatNumber(analyticsData.channelStats?.subscriberCount || 0)} subscribers</span>
              <span>{formatNumber(analyticsData.channelStats?.videoCount || 0)} videos</span>
              <span>{formatNumber(analyticsData.channelStats?.viewCount || 0)} total views</span>
            </div>
          </div>
          
          <div className="ml-auto">
            <Link
              href={`https://youtube.com/channel/${analyticsData.channelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <span className="mr-1">View Channel</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => {
          const value = metricTotals[metric.id] || 0;
          const change = percentageChanges[metric.id] || 0;
          const Icon = metric.icon;
          
          return (
            <div
              key={metric.id}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                selectedMetric === metric.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <h3 className="font-medium">{metric.label}</h3>
                </div>
                
                {change !== 0 && (
                  <div className={`flex items-center text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {change > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span>{Math.abs(change).toFixed(1)}%</span>
                  </div>
                )}
              </div>
              
              <div className="text-2xl font-bold">{formatNumber(value)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {dateRange.startDate} - {dateRange.endDate}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Chart */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">{metrics.find(m => m.id === selectedMetric)?.label} Over Time</h3>
        
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No data available for this metric</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Videos */}
      {analyticsData.recentVideos && analyticsData.recentVideos.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Recent Videos</h3>
          
          <div className="space-y-4">
            {analyticsData.recentVideos.slice(0, 5).map((video: any) => (
              <div key={video.id.videoId} className="flex space-x-4">
                {video.snippet.thumbnails?.default?.url && (
                  <Image
                    src={video.snippet.thumbnails.default.url}
                    alt={video.snippet.title}
                    width={120}
                    height={90}
                    className="rounded-md"
                  />
                )}
                
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-2">{video.snippet.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{video.snippet.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(video.snippet.publishedAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`https://youtube.com/watch?v=${video.id.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Watch on YouTube
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
