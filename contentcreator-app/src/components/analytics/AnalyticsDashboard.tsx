'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import YouTubeAnalytics from './YouTubeAnalytics';
import InstagramAnalytics from './InstagramAnalytics';
import CombinedAnalytics from './CombinedAnalytics';
import { Calendar, Filter } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';

// Date range options
const DATE_RANGES = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 28 days', value: '28d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 12 months', value: '12m' },
  { label: 'Custom', value: 'custom' },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [dateRange, setDateRange] = useState('28d');
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Calculate actual date range based on selection
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '28d':
        startDate.setDate(endDate.getDate() - 28);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '12m':
        startDate.setMonth(endDate.getMonth() - 12);
        break;
      case 'custom':
        return {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate,
        };
      default:
        startDate.setDate(endDate.getDate() - 28);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handleApplyCustomDateRange = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    const start = new Date(customDateRange.startDate);
    const end = new Date(customDateRange.endDate);

    if (start > end) {
      showToast('Start date cannot be after end date', 'error');
      return;
    }

    setDateRange('custom');
    setShowDatePicker(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Analytics Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              <Calendar size={16} />
              <span>
                {dateRange === 'custom'
                  ? `${customDateRange.startDate} - ${customDateRange.endDate}`
                  : DATE_RANGES.find(range => range.value === dateRange)?.label || 'Last 28 days'}
              </span>
            </button>
            
            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 p-4 border">
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {DATE_RANGES.map(range => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setDateRange(range.value);
                          if (range.value !== 'custom') {
                            setShowDatePicker(false);
                          }
                        }}
                        className={`px-3 py-2 text-sm rounded-md ${
                          dateRange === range.value
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {dateRange === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customDateRange.startDate}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customDateRange.endDate}
                        onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleApplyCustomDateRange}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="youtube" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="combined">Combined Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="youtube">
          <YouTubeAnalytics dateRange={getDateRange()} />
        </TabsContent>
        
        <TabsContent value="instagram">
          <InstagramAnalytics dateRange={getDateRange()} />
        </TabsContent>
        
        <TabsContent value="combined">
          <CombinedAnalytics dateRange={getDateRange()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
