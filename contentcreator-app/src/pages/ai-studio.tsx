import React, { useState } from 'react';
import Head from 'next/head';
import ContentIdeaGenerator from '@/components/ai/ContentIdeaGenerator';
import TrendingTopicsAnalysis from '@/components/ai/TrendingTopicsAnalysis';
import ContentPerformanceAnalysis from '@/components/ai/ContentPerformanceAnalysis';
import { ContentIdea, TrendingTopic, OptimizationSuggestion } from '@/lib/services/aiContentService';

// Basic Layout Component (can be expanded or moved to a shared layout)
const Layout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title} - Content Creator AI Studio</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">
            Content Creator AI Studio
          </h1>
        </header>
        <main>{children}</main>
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Studio. Powered by Next.js & AI.</p>
        </footer>
      </div>
    </>
  );
};

const AiStudioPage: React.FC = () => {
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined); // Example project ID
  const [selectedContentId, setSelectedContentId] = useState<string | undefined>(undefined); // Example content ID

  const handleIdeaSelect = (idea: ContentIdea) => {
    console.log('Selected Idea:', idea);
    setSelectedIdea(idea);
    // Potentially set this idea as input for performance analysis or other tools
  };

  const handleTopicSelect = (topic: TrendingTopic) => {
    console.log('Selected Topic:', topic);
    setSelectedTopic(topic);
    // Could pre-fill idea generator with this topic
  };

  const handleApplySuggestion = (suggestion: OptimizationSuggestion) => {
    console.log('Applying Suggestion:', suggestion);
    // Logic to apply suggestion to content or task list
  };

  // Example: Simulate selecting a project/content for performance analysis
  // In a real app, this would come from user interaction, e.g., selecting from a list
  React.useEffect(() => {
    // Simulate selecting a project after a delay for demonstration
    // setTimeout(() => setSelectedProjectId('project-alpha-123'), 2000);
    // Simulate selecting a specific content item after a delay
    // setTimeout(() => setSelectedContentId('content-xyz-789'), 3000);
  }, []);

  return (
    <Layout title="AI Studio Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:grid-cols-3">
        {/* Content Idea Generator */}
        <section className="bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl p-6 xl:col-span-1">
          <h2 className="text-2xl font-semibold mb-4 text-sky-400">Idea Spark</h2>
          <ContentIdeaGenerator onIdeaSelect={handleIdeaSelect} />
        </section>

        {/* Trending Topics Analysis */}
        <section className="bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl p-6 xl:col-span-1">
          <h2 className="text-2xl font-semibold mb-4 text-purple-400">Trend Radar</h2>
          <TrendingTopicsAnalysis onTopicSelect={handleTopicSelect} />
        </section>

        {/* Content Performance Analysis */}
        <section className="bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl p-6 xl:col-span-1">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Performance Lens</h2>
          <div className="mb-4 p-3 bg-slate-700 rounded-md text-sm">
            <p className="font-semibold">Demo Controls (for Performance Analysis):</p>
            <div className="mt-2 flex flex-wrap gap-2">
                <button 
                    onClick={() => { setSelectedProjectId('project-demo-001'); setSelectedContentId(undefined); }}
                    className={`px-3 py-1 rounded-md text-xs ${selectedProjectId === 'project-demo-001' && !selectedContentId ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}`}
                >
                    Analyze Project Demo 001
                </button>
                <button 
                    onClick={() => { setSelectedContentId('content-demo-007'); setSelectedProjectId(undefined); }}
                    className={`px-3 py-1 rounded-md text-xs ${selectedContentId === 'content-demo-007' ? 'bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}`}
                >
                    Analyze Content Demo 007
                </button>
                 <button 
                    onClick={() => { setSelectedContentId(undefined); setSelectedProjectId(undefined); }}
                    className={`px-3 py-1 rounded-md text-xs bg-slate-600 hover:bg-slate-500`}
                >
                    Clear Selection
                </button>
            </div>
          </div>
          <ContentPerformanceAnalysis 
            projectId={selectedProjectId}
            contentId={selectedContentId}
            onApplySuggestion={handleApplySuggestion} 
          />
        </section>
      </div>

      {/* Display selected items - for demonstration */}
      {(selectedIdea || selectedTopic) && (
        <div className="mt-8 p-6 bg-slate-800/50 backdrop-blur-md rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold mb-3">Currently Selected (Demo):</h3>
          {selectedIdea && (
            <div className="mb-2 p-3 bg-slate-700 rounded">
              <p className="text-sm"><span className="font-medium text-sky-300">Selected Idea:</span> {selectedIdea.title} ({selectedIdea.type})</p>
            </div>
          )}
          {selectedTopic && (
            <div className="p-3 bg-slate-700 rounded">
              <p className="text-sm"><span className="font-medium text-purple-300">Selected Topic:</span> {selectedTopic.topic} (Growth: {selectedTopic.growthRate}%)</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default AiStudioPage;
