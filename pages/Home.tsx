import React, { useEffect, useState } from 'react';
import { Post } from '../types';
import { MockService } from '../services/mockService';
import { PostCard } from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const data = await MockService.getFeed();
    setPosts(data);
    setLoading(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    await MockService.toggleLike(postId, user.id);
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await MockService.deletePost(postId);
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      } catch (error) {
        console.error("Failed to delete post", error);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar (Desktop) */}
      <div className="hidden lg:block space-y-6">
        {user && (
           <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
             <div className="flex items-center gap-4 mb-4">
               <Link to={`/profile/${user.username}`}>
                 <img src={user.avatarUrl} className="w-12 h-12 rounded-full ring-2 ring-indigo-50 dark:ring-gray-700" alt={user.fullName} />
               </Link>
               <div>
                 <Link to={`/profile/${user.username}`} className="font-bold text-gray-900 dark:text-white hover:underline">{user.fullName}</Link>
                 <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
               </div>
             </div>
             <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-4">
               <div className="text-center">
                 <span className="block font-bold text-gray-900 dark:text-white">{user.followers}</span>
                 <span>Followers</span>
               </div>
               <div className="text-center">
                 <span className="block font-bold text-gray-900 dark:text-white">{user.following}</span>
                 <span>Following</span>
               </div>
             </div>
           </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {['#Photography', '#Technology', '#Travel', '#Design', '#React', '#Minimalism'].map(tag => (
              <span key={tag} className="bg-gray-100 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-2 max-w-2xl mx-auto w-full">
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 flex items-center gap-4 transition-colors">
             <img src={user.avatarUrl} className="w-10 h-10 rounded-full" alt="Me" />
             <Link to="/create" className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 rounded-full px-4 py-2.5 text-sm transition-colors text-left">
               What's on your mind, {user.fullName.split(' ')[0]}?
             </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
             {[1, 2].map(i => (
               <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-64 animate-pulse">
                 <div className="flex gap-4 mb-4">
                   <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                   <div className="flex-1 space-y-2 py-1">
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                   </div>
                 </div>
                 <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
               </div>
             ))}
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLike} 
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};