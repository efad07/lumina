
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(user ? post.likedBy.includes(user.id) : false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLike = () => {
    if (!user) return alert('Please log in to like posts.');
    
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDelete) {
      onDelete(post.id);
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleShare = () => {
    const text = `Check out this post by ${post.authorName} on Spectra!`;
    if (navigator.share) {
      navigator.share({
        title: 'Spectra Post',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const isAuthor = user && user.id === post.authorId;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm mb-6 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${post.authorName.toLowerCase().replace(' ', '_')}`}>
            <img 
              src={post.authorAvatar} 
              alt={post.authorName} 
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-50 dark:ring-gray-700" 
            />
          </Link>
          <div>
            <Link to={`/profile/${post.authorName.toLowerCase().replace(' ', '_')}`} className="font-semibold text-gray-900 dark:text-white hover:underline decoration-indigo-500">
              {post.authorName}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • Public
            </p>
          </div>
        </div>
        
        {isAuthor && onDelete && (
          <div className="relative" ref={menuRef}>
             <button 
               type="button"
               onClick={toggleMenu}
               className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
             >
               <MoreHorizontal className="h-5 w-5" />
             </button>
             
             {isMenuOpen && (
               <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 animation-fade-in">
                 <button 
                   type="button"
                   onClick={handleDeleteClick}
                   className="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
                 >
                   <Trash2 className="h-4 w-4 mr-2" />
                   Delete
                 </button>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
         <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed whitespace-pre-wrap mb-3">{post.caption}</p>
      </div>

      {post.imageUrl && (
        <div className="w-full bg-gray-100 dark:bg-gray-900 aspect-video flex items-center justify-center overflow-hidden">
          <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
        </div>
      )}

      {post.videoUrl && (
        <div className="w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          <video controls src={post.videoUrl} className="w-full h-full max-h-[500px]" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-pink-600' : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500'}`}
            >
              <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium text-sm">{likeCount}</span>
            </button>
            <button className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <MessageCircle className="h-6 w-6" />
              <span className="font-medium text-sm">{post.comments}</span>
            </button>
            <button onClick={handleShare} className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
              <Share2 className="h-6 w-6" />
            </button>
          </div>
          <button className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            <Bookmark className="h-6 w-6" />
          </button>
        </div>
        
        {/* Simple Comment Input (Mock) */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          {user ? (
            <>
              <img src={user.avatarUrl} alt="Me" className="h-8 w-8 rounded-full" />
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400 text-gray-900 dark:text-gray-100"
              />
              <button className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:text-indigo-700 dark:hover:text-indigo-300">Post</button>
            </>
          ) : (
             <p className="text-sm text-gray-400 w-full text-center">Log in to comment</p>
          )}
        </div>
      </div>
    </div>
  );
};
