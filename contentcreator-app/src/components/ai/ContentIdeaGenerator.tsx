import React, { useState } from 'react';
import { aiContentService, ContentIdea } from '@/lib/services/aiContentService';

interface ContentIdeaGeneratorProps {
  onIdeaSelect?: (idea: ContentIdea) => void;
}

const ContentIdeaGenerator: React.FC<ContentIdeaGeneratorProps> = ({ onIdeaSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>([]);
  const [contentStyle, setContentStyle] = useState('informative');
  const [audienceInterests, setAudienceInterests] = useState<string[]>([]);
  const [ideaCount, setIdeaCount] = useState(5);
  
  // Available options
  const availableContentTypes = [
    { value: 'video', label: 'Video' },
    { value: 'post', label: 'Social Post' },
    { value: 'story', label: 'Story' },
    { value: 'reel', label: 'Reel' },
    { value: 'short', label: 'Short' },
    { value: 'article', label: 'Article' }
  ];
  
  const availablePlatforms = [
    { value: 'YouTube', label: 'YouTube' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'TikTok', label: 'TikTok' },
    { value: 'Twitter', label: 'Twitter' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'Facebook', label: 'Facebook' }
  ];
  
  const availableStyles = [
    { value: 'informative', label: 'Informative' },
    { value: 'entertaining', label: 'Entertaining' },
    { value: 'educational', label: 'Educational' },
    { value: 'inspirational', label: 'Inspirational' },
    { value: 'conversational', label: 'Conversational' }
  ];
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (topics.length === 0) {
      setError('Please enter at least one topic');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const generatedIdeas = await aiContentService.generateContentIdeas({
        contentTypes,
        topics,
        targetPlatforms,
        contentStyle,
        audienceInterests
      }, ideaCount);
      
      setIdeas(generatedIdeas);
    } catch (err) {
      setError('Failed to generate content ideas. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle checkbox changes
  const handleContentTypeChange = (type: string) => {
    setContentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const handlePlatformChange = (platform: string) => {
    setTargetPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform) 
        : [...prev, platform]
    );
  };
  
  // Handle topic input
  const handleTopicInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTopic = e.currentTarget.value.trim();
      if (!topics.includes(newTopic)) {
        setTopics([...topics, newTopic]);
      }
      e.currentTarget.value = '';
    }
  };
  
  const handleTopicRemove = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };
  
  // Handle interest input
  const handleInterestInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newInterest = e.currentTarget.value.trim();
      if (!audienceInterests.includes(newInterest)) {
        setAudienceInterests([...audienceInterests, newInterest]);
      }
      e.currentTarget.value = '';
    }
  };
  
  const handleInterestRemove = (interest: string) => {
    setAudienceInterests(audienceInterests.filter(i => i !== interest));
  };
  
  // Get engagement color
  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">AI Content Idea Generator</h2>
        <p className="text-gray-600 mt-1">
          Generate fresh content ideas based on your preferences and trending topics
        </p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Topics */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topics <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {topics.map(topic => (
                <span 
                  key={topic} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                >
                  {topic}
                  <button
                    type="button"
                    className="ml-1.5 text-blue-600 hover:text-blue-800"
                    onClick={() => handleTopicRemove(topic)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type a topic and press Enter (e.g., 'video editing', 'social media growth')"
              onKeyDown={handleTopicInput}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter topics you want to create content about
            </p>
          </div>
          
          {/* Content Types */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Types
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableContentTypes.map(type => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={contentTypes.includes(type.value)}
                    onChange={() => handleContentTypeChange(type.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to include all content types
            </p>
          </div>
          
          {/* Target Platforms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Platforms
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availablePlatforms.map(platform => (
                <label key={platform.value} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={targetPlatforms.includes(platform.value)}
                    onChange={() => handlePlatformChange(platform.value)}
                  />
                  <span className="ml-2 text-sm text-gray-700">{platform.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to include all platforms
            </p>
          </div>
          
          {/* Content Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Style
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={contentStyle}
              onChange={(e) => setContentStyle(e.target.value)}
            >
              {availableStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Audience Interests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audience Interests
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {audienceInterests.map(interest => (
                <span 
                  key={interest} 
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center"
                >
                  {interest}
                  <button
                    type="button"
                    className="ml-1.5 text-purple-600 hover:text-purple-800"
                    onClick={() => handleInterestRemove(interest)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type an interest and press Enter (e.g., 'photography', 'cooking')"
              onKeyDown={handleInterestInput}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter interests your audience has
            </p>
          </div>
          
          {/* Number of Ideas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Ideas
            </label>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={ideaCount}
              onChange={(e) => setIdeaCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            />
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Ideas...
              </span>
            ) : (
              'Generate Content Ideas'
            )}
          </button>
        </form>
      </div>
      
      {/* Results */}
      {ideas.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-medium mb-4">Generated Content Ideas</h3>
          <div className="space-y-4">
            {ideas.map((idea, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onIdeaSelect && onIdeaSelect(idea)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-gray-900">{idea.title}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getEngagementColor(idea.estimatedEngagement)}`}>
                    {idea.estimatedEngagement.charAt(0).toUpperCase() + idea.estimatedEngagement.slice(1)} Engagement
                  </span>
                </div>
                <p className="mt-1 text-gray-600">{idea.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                    {idea.type.charAt(0).toUpperCase() + idea.type.slice(1)}
                  </span>
                  {idea.targetPlatforms.map(platform => (
                    <span key={platform} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                      {platform}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {idea.tags.slice(0, 5).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      #{tag.replace(/\s+/g, '')}
                    </span>
                  ))}
                  {idea.tags.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{idea.tags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentIdeaGenerator;
