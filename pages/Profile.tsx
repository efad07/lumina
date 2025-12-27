
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Post } from '../types';
import { MockService } from '../services/mockService';
import { PostCard } from '../components/PostCard';
import { Button } from '../components/Button';
import { EditProfileModal } from '../components/EditProfileModal';
import { UserListModal } from '../components/UserListModal';
import { MapPin, Calendar, Link as LinkIcon, Edit, Mail, Grid, Image as ImageIcon, Info, Trash2, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Tab = 'posts' | 'media' | 'about';

export const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [userListModal, setUserListModal] = useState<{
    isOpen: boolean;
    type: 'followers' | 'following';
    users: User[];
    loading: boolean;
  }>({
    isOpen: false,
    type: 'followers',
    users: [],
    loading: false
  });

  useEffect(() => {
    if (username) {
      loadProfile(username);
      setActiveTab('posts');
    }
  }, [username]);

  // Update isFollowing state whenever profileUser or currentUser changes
  useEffect(() => {
    if (currentUser && profileUser) {
      setIsFollowing(currentUser.followingIds.includes(profileUser.id));
    }
  }, [currentUser, profileUser]);

  const loadProfile = async (uName: string) => {
    setLoading(true);
    const user = await MockService.getUserProfile(uName);
    setProfileUser(user);
    
    if (user) {
      const userPosts = await MockService.getUserPosts(user.id);
      setPosts(userPosts);
    }
    setLoading(false);
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await MockService.unfollowUser(currentUser.id, profileUser.id);
        setIsFollowing(false);
        setProfileUser(prev => prev ? {...prev, followers: prev.followers - 1} : null);
      } else {
        await MockService.followUser(currentUser.id, profileUser.id);
        setIsFollowing(true);
        setProfileUser(prev => prev ? {...prev, followers: prev.followers + 1} : null);
      }
      
      currentUser.followingIds = isFollowing 
        ? currentUser.followingIds.filter(id => id !== profileUser.id)
        : [...currentUser.followingIds, profileUser.id];
        
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdate = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = await MockService.updateProfile(currentUser.id, updates);
    setProfileUser(updatedUser);
    Object.assign(currentUser, updatedUser); 
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    await MockService.toggleLike(postId, currentUser.id);
  };

  const handleDelete = async (postId: string) => {
    // Removed confirmation dialog to support immediate deletion request
    
    // Optimistic update: Remove immediately from UI
    const previousPosts = [...posts];
    setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));

    try {
      await MockService.deletePost(postId);
    } catch (error) {
      console.error("Failed to delete post", error);
      // Revert if failed
      setPosts(previousPosts);
      alert("Failed to delete post. Please try again.");
    }
  };

  const openFollowers = async () => {
    if (!profileUser) return;
    setUserListModal({ isOpen: true, type: 'followers', users: [], loading: true });
    try {
      const users = await MockService.getFollowers(profileUser.id);
      setUserListModal(prev => ({ ...prev, users, loading: false }));
    } catch (e) {
      setUserListModal(prev => ({ ...prev, loading: false }));
    }
  };

  const openFollowing = async () => {
    if (!profileUser) return;
    setUserListModal({ isOpen: true, type: 'following', users: [], loading: true });
    try {
      const users = await MockService.getFollowing(profileUser.id);
      setUserListModal(prev => ({ ...prev, users, loading: false }));
    } catch (e) {
      setUserListModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleMessageClick = () => {
    if (profileUser) {
      navigate(`/messages/${profileUser.id}`);
    }
  };

  const isOwner = currentUser?.id === profileUser?.id;

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  
  if (!profileUser) return <div className="text-center p-12 text-gray-500">User not found</div>;

  const mediaPosts = posts.filter(p => p.imageUrl || p.videoUrl);

  return (
    <div>
      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal 
          user={profileUser} 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          onSave={handleProfileUpdate}
        />
      )}

      {/* User List Modal */}
      <UserListModal 
        isOpen={userListModal.isOpen}
        onClose={() => setUserListModal(prev => ({ ...prev, isOpen: false }))}
        title={userListModal.type === 'followers' ? 'Followers' : 'Following'}
        users={userListModal.users}
        loading={userListModal.loading}
      />

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 transition-colors">
        <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-700 relative group">
          <img src={profileUser.coverUrl} className="w-full h-full object-cover" alt="Cover" />
          {isOwner && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row items-end -mt-12 md:-mt-16 mb-6 gap-6 relative">
             <div className="relative group">
               <img 
                src={profileUser.avatarUrl} 
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-md object-cover bg-white dark:bg-gray-800" 
                alt={profileUser.fullName} 
               />
               {isOwner && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-1.5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-3 w-3" />
                </button>
               )}
             </div>
             
             <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profileUser.fullName}</h1>
               <p className="text-gray-500 dark:text-gray-400 font-medium">@{profileUser.username}</p>
             </div>

             <div className="flex gap-3 mb-4 md:mb-0">
               {isOwner ? (
                 <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                   Edit Profile
                 </Button>
               ) : (
                 <>
                   <Button 
                     variant="secondary" 
                     size="sm" 
                     className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                     onClick={handleMessageClick}
                   >
                     Message
                   </Button>
                   {currentUser && (
                     <Button 
                      variant={isFollowing ? "secondary" : "primary"} 
                      size="sm"
                      onClick={handleFollowToggle}
                      isLoading={followLoading}
                      className={isFollowing ? "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200" : ""}
                     >
                       {isFollowing ? 'Unfollow' : 'Follow'}
                     </Button>
                   )}
                 </>
               )}
             </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{profileUser.bio}</p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
               {profileUser.location && (
                 <div className="flex items-center gap-1.5">
                   <MapPin className="h-4 w-4" /> {profileUser.location}
                 </div>
               )}
               <div className="flex items-center gap-1.5">
                 <Calendar className="h-4 w-4" /> Joined {new Date(profileUser.joinedDate).toLocaleDateString(undefined, {month:'long', year:'numeric'})}
               </div>
               {profileUser.website && (
                 <a href={`https://${profileUser.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                   <LinkIcon className="h-4 w-4" /> {profileUser.website}
                 </a>
               )}
            </div>

            <div className="flex gap-8 border-t border-gray-100 dark:border-gray-700 pt-4">
              <button 
                onClick={openFollowers}
                className="flex items-center gap-1.5 group focus:outline-none"
              >
                <span className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{profileUser.followers}</span>
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Followers</span>
              </button>
              
              <button 
                onClick={openFollowing}
                className="flex items-center gap-1.5 group focus:outline-none"
              >
                <span className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{profileUser.following}</span>
                <span className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Following</span>
              </button>
              
               <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-900 dark:text-white text-lg">{posts.length}</span>
                <span className="text-gray-500 dark:text-gray-400">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'posts' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Grid className="h-4 w-4" /> Posts
        </button>
        <button 
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'media' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <ImageIcon className="h-4 w-4" /> Media <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">{mediaPosts.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'about' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <Info className="h-4 w-4" /> About
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl mx-auto min-h-[300px]">
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <EmptyState title="No posts yet" description="This user hasn't shared any updates." />
            ) : (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLike={handleLike} 
                  onDelete={isOwner ? handleDelete : undefined}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
             {mediaPosts.length === 0 ? (
               <EmptyState title="No media" description="Photos and videos will appear here." />
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {mediaPosts.map(post => (
                   <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative group border border-gray-200 dark:border-gray-700 bg-black">
                      {post.videoUrl ? (
                         <div className="w-full h-full relative flex items-center justify-center">
                            <video src={post.videoUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
                              <PlayCircle className="w-12 h-12 text-white opacity-80" />
                            </div>
                         </div>
                      ) : (
                        <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-4 z-10">
                        <span className="flex items-center gap-1 pointer-events-none">❤️ {post.likes}</span>
                        
                        {isOwner && (
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDelete(post.id);
                            }}
                            className="p-2 bg-red-600/90 hover:bg-red-600 rounded-full text-white transition-all shadow-lg hover:scale-110 active:scale-95 z-50 cursor-pointer"
                            title="Delete media"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">About {profileUser.fullName}</h3>
            
            <div className="space-y-6">
               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <UserIcon className="h-5 w-5" />
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-900 dark:text-white">Bio</h4>
                   <p className="text-gray-600 dark:text-gray-300 mt-1">{profileUser.bio || "No bio available."}</p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <Mail className="h-5 w-5" />
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-900 dark:text-white">Contact</h4>
                   <p className="text-gray-600 dark:text-gray-300 mt-1">{profileUser.email}</p>
                 </div>
               </div>

               <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                   <Calendar className="h-5 w-5" />
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-900 dark:text-white">Joined</h4>
                   <p className="text-gray-600 dark:text-gray-300 mt-1">{new Date(profileUser.joinedDate).toLocaleDateString(undefined, {dateStyle: 'full'})}</p>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component
const EmptyState = ({ title, description }: { title: string, description: string }) => (
  <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
    <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
      <Grid className="h-6 w-6" />
    </div>
    <h3 className="text-gray-900 dark:text-white font-medium text-lg">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>
  </div>
);

// Small icon helper
const UserIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
