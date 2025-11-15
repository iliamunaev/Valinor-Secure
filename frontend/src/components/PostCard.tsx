import { useState } from 'react';
import { Post } from '../App';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Heart, Repeat2, MessageCircle, Share } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [repostCount, setRepostCount] = useState(post.reposts);

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
      setLiked(false);
    } else {
      setLikeCount(likeCount + 1);
      setLiked(true);
    }
  };

  const handleRepost = () => {
    if (reposted) {
      setRepostCount(repostCount - 1);
      setReposted(false);
    } else {
      setRepostCount(repostCount + 1);
      setReposted(true);
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <Card className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span>{post.author.name}</span>
            <span className="text-gray-500">{post.author.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{getTimeAgo(post.timestamp)}</span>
          </div>
          
          <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
          
          <div className="flex items-center justify-between pt-2 max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.replies}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepost}
              className={`gap-2 ${
                reposted
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <Repeat2 className="w-4 h-4" />
              <span>{repostCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`gap-2 ${
                liked
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            >
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
