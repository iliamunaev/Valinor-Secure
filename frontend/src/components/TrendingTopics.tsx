import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp } from 'lucide-react';

interface Trend {
  id: string;
  topic: string;
  category: string;
  postCount: string;
}

const MOCK_TRENDS: Trend[] = [
  {
    id: '1',
    topic: '#WebDevelopment',
    category: 'Technology',
    postCount: '12.5K',
  },
  {
    id: '2',
    topic: '#AI',
    category: 'Technology',
    postCount: '8.9K',
  },
  {
    id: '3',
    topic: '#TypeScript',
    category: 'Programming',
    postCount: '6.2K',
  },
  {
    id: '4',
    topic: '#React',
    category: 'Programming',
    postCount: '5.8K',
  },
  {
    id: '5',
    topic: '#DesignSystems',
    category: 'Design',
    postCount: '4.1K',
  },
  {
    id: '6',
    topic: '#RemoteWork',
    category: 'Career',
    postCount: '3.7K',
  },
  {
    id: '7',
    topic: '#OpenSource',
    category: 'Technology',
    postCount: '2.9K',
  },
];

export function TrendingTopics() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h2 className="text-blue-600">Trending Topics</h2>
      </div>
      
      <div className="space-y-4">
        {MOCK_TRENDS.map((trend, index) => (
          <div
            key={trend.id}
            className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">#{index + 1}</span>
                  <Badge variant="secondary" className="text-gray-600">
                    {trend.category}
                  </Badge>
                </div>
                <p className="text-blue-600 cursor-pointer hover:underline">
                  {trend.topic}
                </p>
                <p className="text-gray-500">
                  {trend.postCount} posts
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full text-blue-600 hover:bg-blue-50 p-2 rounded-lg mt-4 transition-colors">
        Show more
      </button>
    </Card>
  );
}
