import { Post } from '../App';
import { PostCard } from './PostCard';

interface FeedProps {
  posts: Post[];
}

export function Feed({ posts }: FeedProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
