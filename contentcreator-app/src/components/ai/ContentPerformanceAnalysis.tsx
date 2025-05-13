import React, { useState, useEffect } from 'react';
import { aiContentService, ContentPerformanceData, OptimizationSuggestion } from '@/lib/services/aiContentService';

interface ContentPerformanceAnalysisProps {
  projectId?: string;
  contentId?: string;
  onApplySuggestion?: (suggestion: OptimizationSuggestion) => void;
}

const ContentPerformanceAnalysis: React.FC<ContentPerformanceAnalysisProps> = ({ 
  projectId, 
  contentId,
  onApplySuggestion 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<ContentPerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('views');
  const [timeRange, setTimeRange] = useState<string>('30days');
  
  // Available metrics and time ranges
  const availableMetrics = [
    { value: 'views', label: 'Views' },
    { value: 'engagement', label: 'Engagement Rate' },
    { value: 'watchTime', label: 'Watch Time' },
    { value: 'clickThrough', label: 'Click-Through Rate' },
    { value: 'shares', label: 'Shares' },
    { value: 'comments', label: 'Comments' }
  ];
  
  const availableTimeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'allTime', label: 'All Time' }
  ];
  
  // Load performance data on mount or when parameters change
  useEffect(() => {
    if (projectId || contentId) {
      fetchPerformanceData();
    }
  }, [projectId, contentId, selectedMetric, timeRange]);
  
  // Fetch performance data
  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await aiContentService.getContentPerformance({
        projectId,
        contentId,
        metric: selectedMetric,
        timeRange
      });
      
      setPerformanceData(data);
    } catch (err) {
      setError('Failed to fetch performance data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get performance score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  // Get trend indicator
  const getTrendIndicator = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return (
          <span className="text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Increasing
          </span>
        );
      case 'down':
        return (
          <span className="text-red-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Decreasing
          </span>
        );
      default:
        return (
          <span className="text-gray-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
            Stable
          </span>
        );
    }
  };
  
  // Get impact level color
  const getImpactLevelColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Content Performance Analysis</h2>
        <p className="text-gray-600 mt-1">
          Analyze your content performance and get AI-powered optimization suggestions
        </p>
      </div>
      
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Metric selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metric
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {availableMetrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Time range selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              {availableTimeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {!projectId && !contentId && (
          <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
            Please select a project or content item to analyze
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-6 border-b">
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        </div>
      )}
      
      {/* Performance data */}
      {isLoading ? (
        <div className="p-6 flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : performanceData ? (
        <>
          {/* Performance metrics */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall score */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Overall Score</h4>
                <div className="mt-2 flex items-baseline">
                  <p className={`text-3xl font-semibold ${getScoreColor(performanceData.overallScore)}`}>
                    {performanceData.overallScore}/100
                  </p>
                </div>
              </div>
              
              {/* Primary metric */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">
                  {availableMetrics.find(m => m.value === selectedMetric)?.label || selectedMetric}
                </h4>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">
                    {performanceData.metrics[selectedMetric].value}
                    {selectedMetric === 'engagement' || selectedMetric === 'clickThrough' ? '%' : ''}
                  </p>
                </div>
                <div className="mt-1">
                  {getTrendIndicator(performanceData.metrics[selectedMetric].trend)}
                </div>
              </div>
              
              {/* Audience retention */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">Audience Retention</h4>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900">
                    {performanceData.audienceRetention}%
                  </p>
                </div>
                <div className="mt-1">
                  {getTrendIndicator(performanceData.audienceRetentionTrend)}
                </div>
              </div>
              
              {/* Benchmark comparison */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-500">vs. Benchmark</h4>
                <div className="mt-2 flex items-baseline">
                  <p className={`text-3xl font-semibold ${performanceData.benchmarkComparison > 0 ? 'text-green-600' : performanceData.benchmarkComparison < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {performanceData.benchmarkComparison > 0 ? '+' : ''}
                    {performanceData.benchmarkComparison}%
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500">Compared to similar content</p>
              </div>
            </div>
            
            {/* Performance insights */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h4>
              <ul className="space-y-2">
                {performanceData.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Optimization suggestions */}
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Optimization Suggestions</h3>
            
            <div className="space-y-4">
              {performanceData.optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-medium text-gray-900">{suggestion.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactLevelColor(suggestion.impactLevel)}`}>
                      {suggestion.impactLevel.charAt(0).toUpperCase() + suggestion.impactLevel.slice(1)} Impact
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">{suggestion.description}</p>
                  
                  {suggestion.implementationSteps && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700">Implementation Steps:</h5>
                      <ol className="mt-1 list-decimal list-inside space-y-1">
                        {suggestion.implementationSteps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-gray-600">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {onApplySuggestion && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => onApplySuggestion(suggestion)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Apply Suggestion
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 text-center py-12 text-gray-500">
          Select a project or content item and metrics to analyze performance
        </div>
      )}
    </div>
  );
};

export default ContentPerformanceAnalysis;
