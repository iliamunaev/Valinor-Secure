import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ImageIcon, Smile } from 'lucide-react';

interface CreatePostProps {
  onCreatePost: (content: string) => void;
}

const CHARACTER_LIMIT = 280;

export function CreatePost({ onCreatePost }: CreatePostProps) {
  const [content, setContent] = useState('');

  const remainingChars = CHARACTER_LIMIT - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars >= 0;

  const handleSubmit = () => {
    if (content.trim() && !isOverLimit) {
      onCreatePost(content);
      setContent('');
    }
  };

  const getCharCountColor = () => {
    if (isOverLimit) return 'text-red-600';
    if (isNearLimit) return 'text-orange-600';
    return 'text-gray-500';
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0"
          />
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`${getCharCountColor()}`}>
                {remainingChars}
              </span>
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
