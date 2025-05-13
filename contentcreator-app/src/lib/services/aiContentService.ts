/**
 * AI Content Service
 * Provides AI-assisted content planning and idea generation
 */

import { Project } from '@/types/project';
import { Asset } from '@/types/asset';

// Types for content ideas and suggestions
export interface ContentIdea {
  title: string;
  description: string;
  type: 'video' | 'post' | 'story' | 'reel' | 'short' | 'article';
  tags: string[];
  estimatedEngagement: 'low' | 'medium' | 'high';
  targetPlatforms: string[];
  inspirationSources?: string[];
  aiGenerated: true;
}

export interface ContentSuggestion {
  title: string;
  description: string;
  keyPoints: string[];
  suggestedHashtags: string[];
  targetAudience: string[];
  estimatedPerformance: number; // 0-100 score
  trendRelevance: number; // 0-100 score
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeEstimate: string;
  resources: string[];
}

export interface TrendingTopic {
  topic: string;
  category: string;
  growthRate: number; // percentage
  volumeScore: number; // 0-100 score
  relatedKeywords: string[];
  platforms: string[];
  audienceDemographics?: {
    ageGroups: string[];
    genderDistribution?: Record<string, number>;
    interests: string[];
  };
}

// Types for Content Performance Analysis
export interface OptimizationSuggestion {
  title: string;
  description: string;
  impactLevel: 'high' | 'medium' | 'low';
  implementationSteps?: string[];
  // category?: 'SEO' | 'Engagement' | 'Presentation' | 'Audience'; // Example, can be expanded
  // estimatedEffort?: 'low' | 'medium' | 'high'; // Example
}

export interface ContentPerformanceData {
  overallScore: number; // 0-100 score representing overall performance
  metrics: {
    [key: string]: { // e.g., views, engagementRate, watchTime, clickThroughRate
      value: string | number; // Actual value of the metric
      trend: 'up' | 'down' | 'stable'; // Trend compared to previous period or benchmark
    };
  };
  audienceRetention: number; // Percentage
  audienceRetentionTrend: 'up' | 'down' | 'stable';
  benchmarkComparison: number; // Percentage difference from benchmark (e.g., +15% or -10%)
  insights: string[]; // AI-generated insights about the performance
  optimizationSuggestions: OptimizationSuggestion[]; // Actionable suggestions
}

// Main service functions
export const aiContentService = {
  /**
   * Generate content ideas based on user preferences and trending topics
   */
  async generateContentIdeas(
    preferences: {
      contentTypes: string[];
      topics: string[];
      targetPlatforms: string[];
      contentStyle: string;
      audienceInterests: string[];
    },
    count: number = 5
  ): Promise<ContentIdea[]> {
    try {
      // In a real implementation, this would call an AI service API
      // For now, we'll simulate the response
      
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ideas: ContentIdea[] = [];
      const types = ['video', 'post', 'story', 'reel', 'short', 'article'];
      const platforms = preferences.targetPlatforms.length > 0 
        ? preferences.targetPlatforms 
        : ['YouTube', 'Instagram', 'TikTok'];
      
      const engagementLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
      
      // Generate random ideas based on preferences
      for (let i = 0; i < count; i++) {
        const topicIndex = Math.floor(Math.random() * preferences.topics.length);
        const topic = preferences.topics[topicIndex] || 'content creation';
        
        const typeIndex = Math.floor(Math.random() * (preferences.contentTypes.length || types.length));
        const type = (preferences.contentTypes[typeIndex] || types[typeIndex % types.length]) as any;
        
        const platformsCount = 1 + Math.floor(Math.random() * 2);
        const selectedPlatforms: string[] = [];
        for (let j = 0; j < platformsCount; j++) {
          const platformIndex = Math.floor(Math.random() * platforms.length);
          if (!selectedPlatforms.includes(platforms[platformIndex])) {
            selectedPlatforms.push(platforms[platformIndex]);
          }
        }
        
        const engagementIndex = Math.floor(Math.random() * 3);
        
        const idea: ContentIdea = {
          title: generateIdeaTitle(topic, type),
          description: generateIdeaDescription(topic, type, preferences.contentStyle),
          type: type,
          tags: generateTags(topic, preferences.audienceInterests),
          estimatedEngagement: engagementLevels[engagementIndex],
          targetPlatforms: selectedPlatforms,
          aiGenerated: true
        };
        
        ideas.push(idea);
      }
      
      return ideas;
    } catch (error) {
      console.error('Error generating content ideas:', error);
      throw new Error('Failed to generate content ideas');
    }
  },
  
  /**
   * Get detailed content suggestion for a specific idea
   */
  async getContentSuggestion(idea: ContentIdea): Promise<ContentSuggestion> {
    try {
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Generate a detailed suggestion based on the idea
      const suggestion: ContentSuggestion = {
        title: idea.title,
        description: idea.description,
        keyPoints: generateKeyPoints(idea),
        suggestedHashtags: generateHashtags(idea),
        targetAudience: generateTargetAudience(idea),
        estimatedPerformance: 60 + Math.floor(Math.random() * 30),
        trendRelevance: 50 + Math.floor(Math.random() * 40),
        difficulty: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as any,
        timeEstimate: generateTimeEstimate(idea.type),
        resources: generateResources(idea)
      };
      
      return suggestion;
    } catch (error) {
      console.error('Error getting content suggestion:', error);
      throw new Error('Failed to get content suggestion');
    }
  },
  
  /**
   * Get trending topics based on platform and category
   */
  async getTrendingTopics(
    platforms: string[] = ['YouTube', 'Instagram'],
    categories: string[] = []
  ): Promise<TrendingTopic[]> {
    try {
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Sample trending topics
      const trendingTopics: TrendingTopic[] = [
        {
          topic: 'Sustainable Living Tips',
          category: 'Lifestyle',
          growthRate: 28.5,
          volumeScore: 82,
          relatedKeywords: ['zero waste', 'eco-friendly', 'sustainable products', 'climate action'],
          platforms: ['YouTube', 'Instagram', 'TikTok'],
          audienceDemographics: {
            ageGroups: ['18-24', '25-34'],
            interests: ['environment', 'minimalism', 'health and wellness']
          }
        },
        {
          topic: 'AI Tools for Creators',
          category: 'Technology',
          growthRate: 42.3,
          volumeScore: 76,
          relatedKeywords: ['AI art', 'content automation', 'productivity tools', 'future of content'],
          platforms: ['YouTube', 'Twitter', 'LinkedIn'],
          audienceDemographics: {
            ageGroups: ['25-34', '35-44'],
            interests: ['technology', 'digital marketing', 'productivity']
          }
        },
        {
          topic: 'Short-form Cooking Tutorials',
          category: 'Food',
          growthRate: 35.7,
          volumeScore: 89,
          relatedKeywords: ['quick recipes', '15-minute meals', 'cooking hacks', 'food trends'],
          platforms: ['TikTok', 'Instagram', 'YouTube'],
          audienceDemographics: {
            ageGroups: ['18-24', '25-34', '35-44'],
            interests: ['cooking', 'food', 'quick meals', 'health']
          }
        },
        {
          topic: 'Mental Health Awareness',
          category: 'Health & Wellness',
          growthRate: 31.2,
          volumeScore: 85,
          relatedKeywords: ['self-care', 'anxiety tips', 'mindfulness', 'mental wellness'],
          platforms: ['Instagram', 'TikTok', 'YouTube'],
          audienceDemographics: {
            ageGroups: ['18-24', '25-34', '35-44'],
            interests: ['health', 'wellness', 'psychology', 'self-improvement']
          }
        },
        {
          topic: 'Behind-the-Scenes Content',
          category: 'Entertainment',
          growthRate: 24.8,
          volumeScore: 72,
          relatedKeywords: ['day in the life', 'creator journey', 'content creation process', 'vlog'],
          platforms: ['YouTube', 'Instagram', 'TikTok'],
          audienceDemographics: {
            ageGroups: ['13-17', '18-24', '25-34'],
            interests: ['entertainment', 'content creation', 'influencers']
          }
        }
      ];
      
      // Filter by platforms and categories if provided
      let filteredTopics = trendingTopics;
      
      if (platforms.length > 0) {
        filteredTopics = filteredTopics.filter(topic => 
          topic.platforms.some(platform => platforms.includes(platform))
        );
      }
      
      if (categories.length > 0) {
        filteredTopics = filteredTopics.filter(topic => 
          categories.includes(topic.category)
        );
      }
      
      return filteredTopics;
    } catch (error) {
      console.error('Error getting trending topics:', error);
      throw new Error('Failed to get trending topics');
    }
  },
  
  /**
   * Get content performance data and optimization suggestions
   */
  async getContentPerformance(params: {
    projectId?: string;
    contentId?: string;
    metric: string;
    timeRange: string;
  }): Promise<ContentPerformanceData> {
    try {
      // In a real implementation, this would call an AI service API or analytics backend
      // For now, we'll simulate the response
      await new Promise(resolve => setTimeout(resolve, 1800));

      const { metric, timeRange, contentId, projectId } = params;

      // Simulate varied data based on inputs
      const baseScore = contentId ? (contentId.length % 50) + 30 : (projectId ? (projectId.length % 50) + 40 : 60);
      const metricValueBase = metric === 'views' ? 10000 : (metric === 'engagement' ? 5 : (metric === 'watchTime' ? 180 : 2));

      const performanceData: ContentPerformanceData = {
        overallScore: baseScore + (Math.random() * 20 - 10), // e.g. 75
        metrics: {
          [metric]: {
            value: metricValueBase + (Math.random() * (metricValueBase * 0.5) - (metricValueBase * 0.25)),
            trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
          },
          views: { // Always include some common metrics for context if possible
            value: 10000 + Math.floor(Math.random() * 5000),
            trend: 'up',
          },
          engagement: {
            value: (4.5 + Math.random()).toFixed(1) + '%',
            trend: 'stable',
          }
        },
        audienceRetention: 40 + Math.random() * 30, // e.g. 55%
        audienceRetentionTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        benchmarkComparison: (Math.random() * 30 - 15), // e.g. +10% or -5%
        insights: [
          `Content performance for ${metric} over ${timeRange} shows a significant trend.`,
          'Audience engagement is particularly strong in the first 24 hours.',
          'Consider optimizing thumbnails for higher click-through rates.',
        ],
        optimizationSuggestions: [
          {
            title: 'Improve Title SEO',
            description: 'Optimize your content title with relevant keywords to improve search visibility.',
            impactLevel: 'high',
            implementationSteps: [
              'Research relevant keywords for your topic.',
              'Incorporate primary keywords naturally in the title.',
              'Ensure the title is compelling and clear (under 60 characters).',
            ],
          },
          {
            title: 'Enhance Call to Action',
            description: 'Make your call to action more prominent and clear to guide user behavior.',
            impactLevel: 'medium',
            implementationSteps: [
              'Use a strong verb to start your CTA.',
              'Create a sense of urgency if appropriate.',
              'Visually distinguish your CTA button or link.',
            ],
          },
          {
            title: 'Add Timestamps for Long Videos',
            description: 'For videos longer than 10 minutes, add timestamps to help viewers navigate to key sections.',
            impactLevel: 'low',
            implementationSteps: [
              'Identify key sections in your video.',
              'List timestamps in the video description (e.g., 00:00 Intro, 02:30 Topic 1).',
            ],
          },
        ],
      };

      // Ensure the primary metric is in the metrics object
      if (!performanceData.metrics[metric]) {
        performanceData.metrics[metric] = {
            value: metricValueBase + (Math.random() * (metricValueBase * 0.5) - (metricValueBase * 0.25)),
            trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
        };
      }
      if (typeof performanceData.metrics[metric].value === 'number') {
        performanceData.metrics[metric].value = parseFloat((performanceData.metrics[metric].value as number).toFixed(metric === 'engagement' || metric === 'clickThrough' ? 1 : 0));
      }
      performanceData.overallScore = parseFloat(performanceData.overallScore.toFixed(0));
      performanceData.audienceRetention = parseFloat(performanceData.audienceRetention.toFixed(1));
      performanceData.benchmarkComparison = parseFloat(performanceData.benchmarkComparison.toFixed(1));

      return performanceData;
    } catch (error) {
      console.error('Error getting content performance:', error);
      throw new Error('Failed to get content performance data');
    }
  },

  /**
   * Analyze existing content and provide insights
   */
  async analyzeContent(
    projects: Project[],
    assets: Asset[]
  ): Promise<{
    contentGaps: string[];
    performanceInsights: string[];
    improvementSuggestions: string[];
    contentCalendarSuggestions: { title: string; type: string; scheduleSuggestion: string }[];
  }> {
    try {
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would analyze the actual content
      // For now, we'll return sample insights
      
      return {
        contentGaps: [
          'No recent content about industry news and updates',
          'Limited tutorial content for beginners',
          'Few collaborative videos with other creators',
          'No content addressing common audience questions',
          'Limited behind-the-scenes content'
        ],
        performanceInsights: [
          'Tutorial content receives 35% more engagement than other content types',
          'Videos longer than 15 minutes have 20% lower completion rates',
          'Content published on Tuesdays and Thursdays gets 28% more initial views',
          'Content with custom thumbnails receives 45% more clicks',
          'Videos with questions in the title get 32% more comments'
        ],
        improvementSuggestions: [
          'Add timestamps to longer videos to improve viewer retention',
          'Include calls-to-action within the first 30 seconds of videos',
          'Create more content based on trending topics in your niche',
          'Develop a consistent posting schedule to build audience habits',
          'Repurpose existing content into different formats for cross-platform sharing'
        ],
        contentCalendarSuggestions: [
          {
            title: 'Industry News Roundup',
            type: 'video',
            scheduleSuggestion: 'Monday mornings, bi-weekly'
          },
          {
            title: 'Beginner Tutorial Series',
            type: 'video',
            scheduleSuggestion: 'Wednesdays, weekly'
          },
          {
            title: 'Q&A Sessions',
            type: 'live stream',
            scheduleSuggestion: 'Friday evenings, monthly'
          },
          {
            title: 'Behind-the-Scenes',
            type: 'story/reel',
            scheduleSuggestion: 'Weekends, ad-hoc'
          },
          {
            title: 'Collaboration with Industry Experts',
            type: 'interview',
            scheduleSuggestion: 'Last Thursday of each month'
          }
        ]
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw new Error('Failed to analyze content');
    }
  },
  
  /**
   * Generate content brief for a specific idea
   */
  async generateContentBrief(
    idea: ContentIdea,
    additionalInfo: {
      targetAudience: string;
      contentGoals: string[];
      keyMessages: string[];
      tone: string;
      length: string;
    }
  ): Promise<{
    title: string;
    hook: string;
    outline: string[];
    keypoints: string[];
    callToAction: string;
    resources: string[];
    technicalRequirements: string[];
    estimatedProductionTime: string;
    promotionStrategy: string[];
  }> {
    try {
      // Simulated API call delay
      await new Promise(resolve => setTimeout(resolve, 1700));
      
      // Generate a content brief based on the idea and additional info
      return {
        title: idea.title,
        hook: generateHook(idea, additionalInfo),
        outline: generateOutline(idea, additionalInfo),
        keypoints: additionalInfo.keyMessages.concat(generateExtraKeypoints(idea, additionalInfo)),
        callToAction: generateCallToAction(idea, additionalInfo),
        resources: generateDetailedResources(idea, additionalInfo),
        technicalRequirements: generateTechnicalRequirements(idea),
        estimatedProductionTime: generateDetailedTimeEstimate(idea, additionalInfo),
        promotionStrategy: generatePromotionStrategy(idea, additionalInfo)
      };
    } catch (error) {
      console.error('Error generating content brief:', error);
      throw new Error('Failed to generate content brief');
    }
  }
};

// Helper functions for generating content
function generateIdeaTitle(topic: string, type: string): string {
  const titleTemplates = [
    `How to Master ${topic} in 2025`,
    `${topic} Made Simple: A Beginner's Guide`,
    `10 ${topic} Tips You Need to Know`,
    `The Ultimate Guide to ${topic}`,
    `Why ${topic} Is Changing Everything`,
    `${topic} Secrets Revealed`,
    `${topic}: Before and After`,
    `The Truth About ${topic} Nobody Tells You`,
    `${topic} Challenge: 30 Days to Success`,
    `Behind the Scenes of ${topic}`
  ];
  
  const index = Math.floor(Math.random() * titleTemplates.length);
  return titleTemplates[index];
}

function generateIdeaDescription(topic: string, type: string, style: string): string {
  const descriptionTemplates = [
    `A comprehensive look at ${topic} with actionable tips and insights.`,
    `Explore the world of ${topic} and discover how it can transform your content.`,
    `Learn the fundamentals of ${topic} and how to apply them to your creative process.`,
    `An in-depth analysis of ${topic} trends and how to leverage them for your audience.`,
    `Share your journey with ${topic} and connect with your audience on a deeper level.`
  ];
  
  const index = Math.floor(Math.random() * descriptionTemplates.length);
  return descriptionTemplates[index];
}

function generateTags(topic: string, interests: string[]): string[] {
  const baseTags = [topic.toLowerCase(), 'content', 'creator', 'tips', 'tutorial'];
  
  // Add some tags from interests if available
  const additionalTags = interests && interests.length > 0
    ? interests.slice(0, 3).map(interest => interest.toLowerCase())
    : ['social media', 'digital content', 'influencer'];
  
  return [...baseTags, ...additionalTags];
}

function generateKeyPoints(idea: ContentIdea): string[] {
  // Generate 3-5 key points based on the idea
  const count = 3 + Math.floor(Math.random() * 3);
  const keyPoints = [];
  
  const keyPointTemplates = [
    `Understanding the basics of ${idea.title.split(':')[0]}`,
    `How to implement ${idea.tags[0]} in your content strategy`,
    `Tools and resources for ${idea.tags[1] || 'content creation'}`,
    `Common mistakes to avoid with ${idea.tags[0]}`,
    `Measuring success in your ${idea.tags[0]} strategy`,
    `Future trends in ${idea.tags[0]}`,
    `Case studies of successful ${idea.tags[0]} implementation`,
    `Step-by-step guide to ${idea.title.split(':')[0]}`,
    `Budget-friendly approaches to ${idea.tags[0]}`,
    `Scaling your ${idea.tags[0]} strategy`
  ];
  
  // Select random key points
  const availableIndices = [...Array(keyPointTemplates.length).keys()];
  for (let i = 0; i < count; i++) {
    if (availableIndices.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const templateIndex = availableIndices[randomIndex];
    
    keyPoints.push(keyPointTemplates[templateIndex]);
    availableIndices.splice(randomIndex, 1);
  }
  
  return keyPoints;
}

function generateHashtags(idea: ContentIdea): string[] {
  const baseHashtags = idea.tags.map(tag => `#${tag.replace(/\s+/g, '')}`);
  
  // Add platform-specific hashtags
  const platformHashtags: string[] = [];
  if (idea.targetPlatforms.includes('Instagram')) {
    platformHashtags.push('#instacreator', '#instacontent');
  }
  if (idea.targetPlatforms.includes('YouTube')) {
    platformHashtags.push('#youtuber', '#youtubecontent');
  }
  if (idea.targetPlatforms.includes('TikTok')) {
    platformHashtags.push('#tiktokcreativity', '#tiktoktips');
  }
  
  // Add content type hashtags
  const typeHashtags = [`#${idea.type}content`, `#${idea.type}creator`];
  
  // Add trending hashtags
  const trendingHashtags = ['#contentcreator', '#digitalcontent', '#creatortips'];
  
  return [...baseHashtags, ...platformHashtags, ...typeHashtags, ...trendingHashtags.slice(0, 2)];
}

function generateTargetAudience(idea: ContentIdea): string[] {
  const audienceTemplates = [
    'Beginner content creators',
    'Experienced content creators',
    'Social media managers',
    'Digital marketers',
    'Small business owners',
    'Influencers',
    'Creative professionals',
    'Entrepreneurs',
    'Students',
    'Hobbyists'
  ];
  
  // Select 2-3 audience segments
  const count = 2 + Math.floor(Math.random() * 2);
  const audience = [];
  
  const availableIndices = [...Array(audienceTemplates.length).keys()];
  for (let i = 0; i < count; i++) {
    if (availableIndices.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const templateIndex = availableIndices[randomIndex];
    
    audience.push(audienceTemplates[templateIndex]);
    availableIndices.splice(randomIndex, 1);
  }
  
  return audience;
}

function generateTimeEstimate(type: string): string {
  const timeEstimates: Record<string, string> = {
    'video': '3-5 hours',
    'post': '1-2 hours',
    'story': '30 minutes',
    'reel': '1-3 hours',
    'short': '1-2 hours',
    'article': '2-4 hours'
  };
  
  return timeEstimates[type] || '2-3 hours';
}

function generateResources(idea: ContentIdea): string[] {
  const resourceTemplates = [
    'Camera or smartphone for recording',
    'Microphone for clear audio',
    'Lighting equipment',
    'Video editing software',
    'Photo editing software',
    'Graphic design tools',
    'Stock photos or videos',
    'Script or content outline',
    'Reference materials on the topic',
    'Props or visual aids'
  ];
  
  // Select 3-5 resources based on content type
  const count = 3 + Math.floor(Math.random() * 3);
  const resources = [];
  
  const availableIndices = [...Array(resourceTemplates.length).keys()];
  for (let i = 0; i < count; i++) {
    if (availableIndices.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const templateIndex = availableIndices[randomIndex];
    
    resources.push(resourceTemplates[templateIndex]);
    availableIndices.splice(randomIndex, 1);
  }
  
  return resources;
}

function generateHook(idea: ContentIdea, additionalInfo: any): string {
  const hookTemplates = [
    `Did you know that most people struggle with ${idea.tags[0]}? In this ${idea.type}, I'll show you how to overcome these challenges.`,
    `Want to master ${idea.title.split(':')[0]} in just a few simple steps? Let's dive in!`,
    `I spent years learning about ${idea.tags[0]} so you don't have to. Here's what you need to know.`,
    `${idea.tags[0]} changed my content strategy completely. Here's how it can transform yours too.`,
    `The secret to successful ${idea.tags[0]} isn't what you think. Let me show you what really works.`
  ];
  
  const index = Math.floor(Math.random() * hookTemplates.length);
  return hookTemplates[index];
}

function generateOutline(idea: ContentIdea, additionalInfo: any): string[] {
  // Generate a content outline with 5-8 sections
  const count = 5 + Math.floor(Math.random() * 4);
  const outline = [];
  
  // Always start with an introduction
  outline.push('Introduction and overview');
  
  // Add key sections based on the idea and key messages
  const keyMessages = additionalInfo.keyMessages || [];
  for (let i = 0; i < Math.min(keyMessages.length, 3); i++) {
    outline.push(keyMessages[i]);
  }
  
  // Add additional sections if needed
  const sectionTemplates = [
    `Understanding ${idea.tags[0]}: The Basics`,
    `Common Challenges with ${idea.tags[0]}`,
    `Step-by-Step Guide to ${idea.title.split(':')[0]}`,
    `Tools and Resources for ${idea.tags[0]}`,
    `Case Study: Successful ${idea.tags[0]} Implementation`,
    `Tips and Tricks for Better ${idea.tags[0]}`,
    `Measuring Success in Your ${idea.tags[0]} Strategy`,
    `Future Trends in ${idea.tags[0]}`,
    `Q&A: Answering Common Questions About ${idea.tags[0]}`,
    `Action Plan: Implementing ${idea.tags[0]} in Your Content`
  ];
  
  // Add sections until we reach the desired count
  while (outline.length < count) {
    const randomIndex = Math.floor(Math.random() * sectionTemplates.length);
    const section = sectionTemplates[randomIndex];
    
    if (!outline.includes(section)) {
      outline.push(section);
    }
  }
  
  // Always end with a conclusion
  outline.push('Conclusion and next steps');
  
  return outline;
}

function generateExtraKeypoints(idea: ContentIdea, additionalInfo: any): string[] {
  const keypointTemplates = [
    `${idea.tags[0]} can increase engagement by up to 30%`,
    `Most creators overlook the importance of ${idea.tags[1] || 'consistency'} in their strategy`,
    `The right approach to ${idea.tags[0]} can save you hours of work each week`,
    `Understanding your audience is crucial for successful ${idea.tags[0]}`,
    `Tools like [Tool Name] can streamline your ${idea.tags[0]} process`
  ];
  
  // Select 2-3 extra key points
  const count = 2 + Math.floor(Math.random() * 2);
  const keypoints = [];
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * keypointTemplates.length);
    keypoints.push(keypointTemplates[randomIndex]);
  }
  
  return keypoints;
}

function generateCallToAction(idea: ContentIdea, additionalInfo: any): string {
  const ctaTemplates = [
    `Try these ${idea.tags[0]} techniques and share your results in the comments!`,
    `Ready to transform your content with ${idea.tags[0]}? Start with step one today!`,
    `Want more tips on ${idea.tags[0]}? Subscribe for weekly content strategy insights!`,
    `Share this guide with a fellow creator who's struggling with ${idea.tags[0]}!`,
    `What's your biggest challenge with ${idea.tags[0]}? Let me know in the comments!`
  ];
  
  const index = Math.floor(Math.random() * ctaTemplates.length);
  return ctaTemplates[index];
}

function generateDetailedResources(idea: ContentIdea, additionalInfo: any): string[] {
  const baseResources = generateResources(idea);
  
  // Add more specific resources based on the content type and goals
  const specificResources = [];
  
  if (idea.type === 'video') {
    specificResources.push('Video script template');
    specificResources.push('B-roll footage for visual interest');
  } else if (idea.type === 'post' || idea.type === 'article') {
    specificResources.push('Content research materials');
    specificResources.push('SEO keyword list');
  }
  
  // Add resources based on content goals
  if (additionalInfo.contentGoals.includes('education')) {
    specificResources.push('Educational reference materials');
    specificResources.push('Visual aids for complex concepts');
  } else if (additionalInfo.contentGoals.includes('entertainment')) {
    specificResources.push('Engaging visual elements');
    specificResources.push('Music or sound effects');
  }
  
  return [...baseResources, ...specificResources];
}

function generateTechnicalRequirements(idea: ContentIdea): string[] {
  const baseRequirements = [];
  
  // Add requirements based on content type
  if (idea.type === 'video') {
    baseRequirements.push('Camera (DSLR or smartphone with good camera)');
    baseRequirements.push('External microphone for clear audio');
    baseRequirements.push('Video editing software (e.g., Adobe Premiere Pro, Final Cut Pro, or DaVinci Resolve)');
    baseRequirements.push('Lighting setup (natural light or ring light)');
  } else if (idea.type === 'post' || idea.type === 'article') {
    baseRequirements.push('Writing software or platform');
    baseRequirements.push('Image editing software for graphics');
    baseRequirements.push('SEO tools for optimization');
  } else if (idea.type === 'reel' || idea.type === 'short') {
    baseRequirements.push('Smartphone with good camera');
    baseRequirements.push('Mobile editing app (e.g., CapCut, InShot)');
    baseRequirements.push('Tripod or stabilizer');
  }
  
  // Add platform-specific requirements
  if (idea.targetPlatforms.includes('YouTube')) {
    baseRequirements.push('YouTube account with verified channel');
    baseRequirements.push('Custom thumbnail creation tools');
  } else if (idea.targetPlatforms.includes('Instagram')) {
    baseRequirements.push('Instagram account with business or creator profile');
    baseRequirements.push('Mobile photo editing apps');
  }
  
  return baseRequirements;
}

function generateDetailedTimeEstimate(idea: ContentIdea, additionalInfo: any): string {
  const baseEstimate = generateTimeEstimate(idea.type);
  
  // Adjust based on content complexity
  let adjustedEstimate = baseEstimate;
  
  if (additionalInfo.length === 'long') {
    // Increase the time estimate for longer content
    const [minTime, maxTime] = baseEstimate.split('-').map(t => parseInt(t));
    adjustedEstimate = `${minTime + 2}-${maxTime + 3} hours`;
  } else if (additionalInfo.length === 'short') {
    // Decrease the time estimate for shorter content
    const [minTime, maxTime] = baseEstimate.split('-').map(t => parseInt(t));
    adjustedEstimate = `${Math.max(1, minTime - 1)}-${Math.max(2, maxTime - 1)} hours`;
  }
  
  return adjustedEstimate;
}

function generatePromotionStrategy(idea: ContentIdea, additionalInfo: any): string[] {
  const baseStrategy = [
    `Share on all ${idea.targetPlatforms.join(', ')} accounts with relevant hashtags`,
    'Send to email subscribers if applicable',
    'Engage with comments and questions promptly after publishing'
  ];
  
  // Add platform-specific promotion strategies
  const platformStrategies = [];
  
  if (idea.targetPlatforms.includes('YouTube')) {
    platformStrategies.push('Create a custom thumbnail with clear text and engaging imagery');
    platformStrategies.push('Add timestamps in the description for longer videos');
    platformStrategies.push('Include cards and end screens to promote related content');
  }
  
  if (idea.targetPlatforms.includes('Instagram')) {
    platformStrategies.push('Share teasers in Instagram Stories with a "Swipe Up" or link sticker');
    platformStrategies.push('Use a mix of niche and broad hashtags (20-30 total)');
    platformStrategies.push('Create a carousel post with key highlights from the main content');
  }
  
  if (idea.targetPlatforms.includes('TikTok')) {
    platformStrategies.push('Participate in relevant trends and challenges');
    platformStrategies.push('Create a hook in the first 3 seconds to capture attention');
    platformStrategies.push('Use trending sounds to increase discoverability');
  }
  
  // Add cross-promotion strategies
  const crossPromotionStrategies = [
    'Create platform-specific versions of the content for cross-posting',
    'Share behind-the-scenes content on secondary platforms',
    'Collaborate with other creators for wider reach'
  ];
  
  return [...baseStrategy, ...platformStrategies.slice(0, 2), ...crossPromotionStrategies.slice(0, 1)];
}
