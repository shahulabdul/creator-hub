'use client';

import { useState, useEffect } from 'react';
import { fetchInstagramAnalytics, processInstagramAnalyticsForChart, calculatePercentageChange } from '@/lib/analytics';
import { showToast } from '@/components/ui/toaster';
import { ArrowUp, ArrowDown, Loader2, ExternalLink, Eye, Users, TrendingUp, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Chart library
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InstagramAnalyticsProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function InstagramAnalytics({ dateRange }: InstagramAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [period, setPeriod] = useState('day');

  // Metrics to display
  const metrics = [
    { id: 'impressions', label: 'Impressions', icon: Eye },
    { id: 'reach', label: 'Reach', icon: TrendingUp },
    { id: 'profile_views', label: 'Profile Views', icon: Users },
    { id: 'follower_count', label: 'Followers', icon: Users },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch analytics data
        const data = await fetchInstagramAnalytics(
          period,
          metrics.map(m => m.id)
        );
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching Instagram analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Instagram analytics');
        showToast('Failed to fetch Instagram analytics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, period]);

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
        <p className="text-gray-500">Loading Instagram analytics...</p>
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

  if (!analyticsData || !analyticsData.profileInfo) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center">
        <p className="text-yellow-700 mb-4">No Instagram account connected</p>
        <button
          onClick={() => {/* Implement Instagram connection flow */}}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Connect Instagram Account
        </button>
      </div>
    );
  }

  const profileInfo = analyticsData.profileInfo;
  const chartData = processInstagramAnalyticsForChart(analyticsData, selectedMetric);

  // Get current values for each metric
  const getMetricValue = (metricId: string) => {
    if (!analyticsData.insights || !analyticsData.insights.data) {
      return 0;
    }
    
    const metricData = analyticsData.insights.data.find(
      (item: any) => item.name === metricId
    );
    
    if (!metricData || !metricData.values || metricData.values.length === 0) {
      return 0;
    }
    
    return metricData.values[0].value;
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          {profileInfo.profile_picture_url && (
            <Image
              src={profileInfo.profile_picture_url}
              alt="Profile picture"
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          
          <div>
            <h2 className="text-xl font-semibold">{profileInfo.name || `@${profileInfo.username}`}</h2>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <span>{formatNumber(profileInfo.followers_count || 0)} followers</span>
              <span>{formatNumber(profileInfo.media_count || 0)} posts</span>
            </div>
            {profileInfo.biography && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{profileInfo.biography}</p>
            )}
          </div>
          
          <div className="ml-auto">
            <Link
              href={`https://instagram.com/${profileInfo.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <span className="mr-1">View Profile</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Period Selector */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${
                p === 'day'
                  ? 'rounded-l-lg'
                  : p === 'month'
                  ? 'rounded-r-lg'
                  : ''
              } border border-gray-200`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => {
          const value = getMetricValue(metric.id);
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
              </div>
              
              <div className="text-2xl font-bold">{formatNumber(value)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {period === 'day' ? 'Last 24 hours' : period === 'week' ? 'Last 7 days' : 'Last 30 days'}
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
                  stroke="#e1306c" 
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
      
      {/* Recent Media */}
      {analyticsData.recentMedia && analyticsData.recentMedia.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Recent Posts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.recentMedia.slice(0, 6).map((post: any) => (
              <div key={post.id} className="border rounded-md overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={post.media_url || post.thumbnail_url}
                    alt={post.caption || 'Instagram post'}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-3">
                  <p className="text-sm line-clamp-2">{post.caption || 'No caption'}</p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <div className="flex space-x-3">
                      <div className="flex items-center">
                        <Heart size={14} className="mr-1" />
                        <span>{formatNumber(post.like_count || 0)}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        <span>{formatNumber(post.comments_count || 0)}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
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
