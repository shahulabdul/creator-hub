/**
 * Utility functions for fetching and processing analytics data
 */

/**
 * Fetch YouTube analytics data
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param metrics - Array of metrics to fetch
 * @returns YouTube analytics data
 */
export async function fetchYouTubeAnalytics(
  startDate?: string,
  endDate?: string,
  metrics?: string[]
) {
  // Build query parameters
  const params = new URLSearchParams();
  
  if (startDate) {
    params.append('startDate', startDate);
  }
  
  if (endDate) {
    params.append('endDate', endDate);
  }
  
  if (metrics && metrics.length > 0) {
    params.append('metrics', metrics.join(','));
  }
  
  try {
    const response = await fetch(`/api/analytics/youtube?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch YouTube analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching YouTube analytics:', error);
    throw error;
  }
}

/**
 * Fetch Instagram analytics data
 * @param period - Time period (day, week, month)
 * @param metrics - Array of metrics to fetch
 * @returns Instagram analytics data
 */
export async function fetchInstagramAnalytics(
  period?: string,
  metrics?: string[]
) {
  // Build query parameters
  const params = new URLSearchParams();
  
  if (period) {
    params.append('period', period);
  }
  
  if (metrics && metrics.length > 0) {
    params.append('metrics', metrics.join(','));
  }
  
  try {
    const response = await fetch(`/api/analytics/instagram?${params.toString()}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch Instagram analytics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Instagram analytics:', error);
    throw error;
  }
}

/**
 * Process YouTube analytics data into chart-friendly format
 * @param data - Raw YouTube analytics data
 * @param metric - Metric to extract
 * @returns Processed data for charts
 */
export function processYouTubeAnalyticsForChart(data: any, metric: string) {
  if (!data || !data.analytics || !data.analytics.rows) {
    return [];
  }
  
  const metricIndex = data.analytics.columnHeaders.findIndex(
    (header: any) => header.name === metric
  );
  
  if (metricIndex === -1) {
    return [];
  }
  
  return data.analytics.rows.map((row: any) => ({
    date: row[0], // First column is always the date
    value: row[metricIndex],
  }));
}

/**
 * Process Instagram analytics data into chart-friendly format
 * @param data - Raw Instagram analytics data
 * @param metric - Metric to extract
 * @returns Processed data for charts
 */
export function processInstagramAnalyticsForChart(data: any, metric: string) {
  if (!data || !data.insights || !data.insights.data) {
    return [];
  }
  
  const metricData = data.insights.data.find(
    (item: any) => item.name === metric
  );
  
  if (!metricData || !metricData.values) {
    return [];
  }
  
  return metricData.values.map((item: any) => ({
    date: item.end_time,
    value: item.value,
  }));
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}
