import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MockService } from '../services/mockService';
import { Post, User } from '../types';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { Search, TrendingUp, Users, Hash } from 'lucide-react';

export const Explore: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [posts, users] = await Promise.all([
        MockService.getTrendingPosts(),
        MockService.getSuggestedUsers(currentUser?.id)
      ]);
      setTrendingPosts(posts);
      setSuggestedUsers(users);
      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    await MockService.toggleLike(postId, currentUser.id);
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;
    try {
      await MockService.followUser(currentUser.id, userId);
      // Remove followed user from suggestions locally
      setSuggestedUsers(prev => prev.filter(u => u.id !== userId));
      // Optionally update current user state via context reload or local mutation if needed
    } catch (error) {
      console.error(error);
    }
  };

  const categories = ['Trending', 'Tech', 'Design', 'Travel', 'Food', 'Art'];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Explore</h1>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
            placeholder="Search for people, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Suggested Users */}
      {suggestedUsers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">People to follow</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedUsers.map(user => (
              <div key={user.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <Link to={`/profile/${user.username}`} className="flex-shrink-0">
                  <img src={user.avatarUrl} alt={user.fullName} className="w-12 h-12 rounded-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${user.username}`} className="block font-semibold text-gray-900 dark:text-white truncate hover:underline">
                    {user.fullName}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleFollow(user.id)}>
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {cat === 'Trending' && <TrendingUp className="h-4 w-4 inline mr-2" />}
              {cat !== 'Trending' && <Hash className="h-3 w-3 inline mr-1" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {activeCategory} Posts
        </h2>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {trendingPosts.map(post => (
              <div key={post.id} className="break-inside-avoid">
                <PostCard post={post} onLike={handleLike} />
              </div>
            ))}
            {trendingPosts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No posts found for this category.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};