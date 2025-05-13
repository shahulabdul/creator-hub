import React, { useState, useEffect } from 'react';
import { aiContentService, TrendingTopic } from '@/lib/services/aiContentService';

interface TrendingTopicsAnalysisProps {
  onTopicSelect?: (topic: TrendingTopic) => void;
}

const TrendingTopicsAnalysis: React.FC<TrendingTopicsAnalysisProps> = ({ onTopicSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['YouTube', 'Instagram']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Available platforms and categories
  const availablePlatforms = [
    { value: 'YouTube', label: 'YouTube' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'TikTok', label: 'TikTok' },
    { value: 'Twitter', label: 'Twitter' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Facebook', label: 'Facebook' }
  ];
  
  const availableCategories = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Lifestyle', label: 'Lifestyle' },
    { value: 'Food', label: 'Food' },
    { value: 'Health & Wellness', label: 'Health & Wellness' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Education', label: 'Education' },
    { value: 'Business', label: 'Business' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Fashion', label: 'Fashion' },
    { value: 'Gaming', label: 'Gaming' }
  ];
  
  // Load trending topics on mount
  useEffect(() => {
    fetchTrendingTopics();
  }, []);
  
  // Fetch trending topics based on selected platforms and categories
  const fetchTrendingTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const trendingTopics = await aiContentService.getTrendingTopics(
        selectedPlatforms,
        selectedCategories
      );
      
      setTopics(trendingTopics);
    } catch (err) {
      setError('Failed to fetch trending topics. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle platform selection
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    fetchTrendingTopics();
  };
  
  // Get growth rate color
  const getGrowthRateColor = (rate: number) => {
    if (rate >= 30) return 'text-green-600';
    if (rate >= 15) return 'text-blue-600';
    return 'text-gray-600';
  };
  
  // Get volume score color
  const getVolumeScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-gray-600';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Trending Topics Analysis</h2>
        <p className="text-gray-600 mt-1">
          Discover trending topics across platforms to inform your content strategy
        </p>
      </div>
      
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Platforms</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availablePlatforms.map(platform => (
                <label key={platform.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedPlatforms.includes(platform.value)}
                    onChange={() => handlePlatformChange(platform.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{platform.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Category filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableCategories.map(category => (
                <label key={category.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedCategories.includes(category.value)}
                    onChange={() => handleCategoryChange(category.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleApplyFilters}
          disabled={isLoading}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-6 border-b">
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        </div>
      )}
      
      {/* Trending topics */}
      <div className="p-6">
        <h3 className="text-lg font-medium mb-4">Trending Topics</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trending topics found for the selected filters.
          </div>
        ) : (
          <div className="space-y-6">
            {topics.map((topic, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onTopicSelect && onTopicSelect(topic)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-gray-900">{topic.topic}</h4>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                    {topic.category}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">Growth Rate:</span>
                      <span className={`ml-2 text-sm font-medium ${getGrowthRateColor(topic.growthRate)}`}>
                        {topic.growthRate}%
                      </span>
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-sm text-gray-500">Volume Score:</span>
                      <span className={`ml-2 text-sm font-medium ${getVolumeScoreColor(topic.volumeScore)}`}>
                        {topic.volumeScore}/100
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Popular on:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {topic.platforms.map(platform => (
                        <span key={platform} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Related Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {topic.relatedKeywords.map(keyword => (
                      <span key={keyword} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                {topic.audienceDemographics && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">Audience:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {topic.audienceDemographics.ageGroups.map(age => (
                        <span key={age} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">
                          {age}
                        </span>
                      ))}
                      {topic.audienceDemographics.interests.slice(0, 3).map(interest => (
                        <span key={interest} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendingTopicsAnalysis;
