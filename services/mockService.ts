
import { User, Post, Comment, Message, Conversation } from '../types';

// Seed Data
const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'alex_creator',
    email: 'alex@spectra.io',
    fullName: 'Alex Rivera',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80',
    bio: 'Digital nomad & visual storyteller. Capturing moments across the globe.',
    location: 'Kyoto, Japan',
    website: 'alexrivera.com',
    followers: 1240,
    following: 350,
    followingIds: ['u2', 'u3'],
    joinedDate: '2023-01-15',
  },
  {
    id: 'u2',
    username: 'sarah_writes',
    email: 'sarah@spectra.io',
    fullName: 'Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    bio: 'Tech enthusiast and coffee addict. Writing about the future of AI.',
    location: 'San Francisco, CA',
    website: 'sarahwrites.tech',
    followers: 890,
    following: 120,
    followingIds: ['u1', 'u4'],
    joinedDate: '2023-03-22',
  },
  {
    id: 'u3',
    username: 'marcus_design',
    email: 'marcus@spectra.io',
    fullName: 'Marcus Johnson',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80',
    bio: 'Minimalist designer. Less is more.',
    location: 'Stockholm, Sweden',
    website: 'marcus.design',
    followers: 2100,
    following: 45,
    followingIds: ['u1'],
    joinedDate: '2022-11-10',
  },
  {
    id: 'u4',
    username: 'elena_eats',
    email: 'elena@spectra.io',
    fullName: 'Elena Rodriguez',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=1200&q=80',
    bio: 'Food critic & home cook. Exploring flavors.',
    location: 'Madrid, Spain',
    website: 'elenascookbook.com',
    followers: 5400,
    following: 300,
    followingIds: ['u2', 'u3'],
    joinedDate: '2023-05-01',
  },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    caption: 'The sunrise in Kyoto was absolutely breathtaking today. There is something magical about the silence of the morning before the city wakes up. 🌅 #Travel #Japan',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    likes: 45,
    comments: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    likedBy: ['u2', 'u3'],
    savedBy: [],
  },
  {
    id: 'p2',
    authorId: 'u2',
    authorName: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    caption: 'Just published my latest article on Neural Networks. It’s fascinating how rapidly this field is evolving. Here is a quick snippet of my workspace setup for deep work sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=800&q=80',
    likes: 120,
    comments: 15,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likedBy: ['u1', 'u3', 'u4'],
    savedBy: [],
  },
  {
    id: 'p3',
    authorId: 'u3',
    authorName: 'Marcus Johnson',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    caption: 'Architecture is frozen music. 🏛️ Exploring the lines and curves of modern cityscapes.',
    imageUrl: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80',
    likes: 340,
    comments: 45,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    likedBy: ['u1', 'u2', 'u4'],
    savedBy: [],
  },
  {
    id: 'p4',
    authorId: 'u4',
    authorName: 'Elena Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    caption: 'Homemade pasta day! 🍝 Nothing beats fresh basil and tomatoes from the garden. #Foodie #Cooking',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    likes: 89,
    comments: 12,
    createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    likedBy: ['u2'],
    savedBy: [],
  },
  {
    id: 'p5',
    authorId: 'u1',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    caption: 'Street food adventures in Osaka. 🍜',
    imageUrl: 'https://images.unsplash.com/photo-1534081333815-ae5019106622?auto=format&fit=crop&w=800&q=80',
    likes: 210,
    comments: 20,
    createdAt: new Date(Date.now() - 500000000).toISOString(),
    likedBy: ['u3', 'u4'],
    savedBy: [],
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    senderId: 'u1',
    receiverId: 'u2',
    content: 'Hey Sarah! Loved your article on Neural Networks.',
    createdAt: new Date(Date.now() - 10000000).toISOString(),
    isRead: true,
  },
  {
    id: 'm2',
    senderId: 'u2',
    receiverId: 'u1',
    content: 'Thanks Alex! Means a lot coming from you.',
    createdAt: new Date(Date.now() - 9000000).toISOString(),
    isRead: true,
  },
  {
    id: 'm3',
    senderId: 'u3',
    receiverId: 'u1',
    content: 'Are you still in Kyoto?',
    createdAt: new Date(Date.now() - 5000000).toISOString(),
    isRead: false,
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AUTO_REPLIES = [
  "That's really interesting! Tell me more.",
  "I was thinking the same thing recently.",
  "Thanks for sharing!",
  "Busy right now, but I'll get back to you soon!",
  "Haha, totally!",
  "Can we discuss this later?",
  "Awesome work on your latest post.",
  "Hello! How are you doing today?"
];

export const MockService = {
  // Auth
  login: async (email: string, password?: string): Promise<User> => {
    await delay(800);
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found. Please check your email or sign up.');
    }
    
    return user;
  },

  register: async (userData: { fullName: string; email: string; password: string; username: string }): Promise<User> => {
    await delay(1000);
    
    if (MOCK_USERS.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email is already registered');
    }

    if (MOCK_USERS.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error('Username is already taken');
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName)}&background=random&color=fff`,
      coverUrl: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80`,
      bio: 'Just joined Spectra! Writing my story...',
      followers: 0,
      following: 0,
      followingIds: [],
      joinedDate: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);
    return newUser;
  },

  // Posts
  getFeed: async (): Promise<Post[]> => {
    await delay(600);
    return [...MOCK_POSTS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getTrendingPosts: async (): Promise<Post[]> => {
    await delay(600);
    // Return posts sorted by likes
    return [...MOCK_POSTS].sort((a, b) => b.likes - a.likes);
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    await delay(500);
    return MOCK_POSTS.filter((p) => p.authorId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createPost: async (postData: Partial<Post>): Promise<Post> => {
    await delay(1000);
    const newPost: Post = {
      id: `p${Date.now()}`,
      authorId: postData.authorId!,
      authorName: postData.authorName!,
      authorAvatar: postData.authorAvatar!,
      caption: postData.caption!,
      imageUrl: postData.imageUrl,
      videoUrl: postData.videoUrl,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      likedBy: [],
      savedBy: [],
    };
    MOCK_POSTS.unshift(newPost);
    return newPost;
  },

  deletePost: async (postId: string): Promise<void> => {
    await delay(500);
    const index = MOCK_POSTS.findIndex(p => p.id === postId);
    if (index > -1) {
       MOCK_POSTS.splice(index, 1);
    }
  },

  toggleLike: async (postId: string, userId: string): Promise<Post> => {
    await delay(300);
    const post = MOCK_POSTS.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    const hasLiked = post.likedBy.includes(userId);
    if (hasLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likes--;
    } else {
      post.likedBy.push(userId);
      post.likes++;
    }
    return { ...post };
  },

  // Users
  getUserProfile: async (username: string): Promise<User | null> => {
    await delay(500);
    return MOCK_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  getUserById: async (id: string): Promise<User | null> => {
    await delay(200);
    return MOCK_USERS.find(u => u.id === id) || null;
  },
  
  getSuggestedUsers: async (currentUserId?: string): Promise<User[]> => {
    await delay(400);
    if (!currentUserId) return MOCK_USERS.slice(0, 3);
    
    // Return users the current user is NOT following, excluding themselves
    const currentUser = MOCK_USERS.find(u => u.id === currentUserId);
    if (!currentUser) return MOCK_USERS.slice(0, 3);
    
    return MOCK_USERS.filter(u => 
      u.id !== currentUserId && !currentUser.followingIds.includes(u.id)
    ).slice(0, 5);
  },
  
  getFollowers: async (userId: string): Promise<User[]> => {
    await delay(500);
    // Find users who have this userId in their followingIds
    return MOCK_USERS.filter(u => u.followingIds.includes(userId));
  },

  getFollowing: async (userId: string): Promise<User[]> => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) return [];
    // Find users whose IDs are in the user's followingIds
    return MOCK_USERS.filter(u => user.followingIds.includes(u.id));
  },
  
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay(800);
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    
    // In a real app, image uploads would happen separately and return URLs
    MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updates };
    
    // Also update author info in posts if name/avatar changed
    if (updates.fullName || updates.avatarUrl) {
      MOCK_POSTS.forEach(post => {
        if (post.authorId === userId) {
          if (updates.fullName) post.authorName = updates.fullName;
          if (updates.avatarUrl) post.authorAvatar = updates.avatarUrl;
        }
      });
    }

    return MOCK_USERS[userIndex];
  },

  followUser: async (followerId: string, targetId: string): Promise<void> => {
    await delay(400);
    const follower = MOCK_USERS.find(u => u.id === followerId);
    const target = MOCK_USERS.find(u => u.id === targetId);

    if (!follower || !target) throw new Error('User not found');
    if (follower.followingIds.includes(targetId)) return; // Already following

    follower.followingIds.push(targetId);
    follower.following++;
    target.followers++;
  },

  unfollowUser: async (followerId: string, targetId: string): Promise<void> => {
    await delay(400);
    const follower = MOCK_USERS.find(u => u.id === followerId);
    const target = MOCK_USERS.find(u => u.id === targetId);

    if (!follower || !target) throw new Error('User not found');
    if (!follower.followingIds.includes(targetId)) return; // Not following

    follower.followingIds = follower.followingIds.filter(id => id !== targetId);
    follower.following--;
    target.followers--;
  },

  // Messaging
  getConversations: async (userId: string): Promise<Conversation[]> => {
    await delay(400);
    
    // 1. Get all messages involving this user
    const userMessages = MOCK_MESSAGES.filter(m => m.senderId === userId || m.receiverId === userId);
    
    // 2. Group by the OTHER user
    const distinctUserIds = new Set<string>();
    userMessages.forEach(m => {
      distinctUserIds.add(m.senderId === userId ? m.receiverId : m.senderId);
    });

    const conversations: Conversation[] = [];
    
    // 3. Build Conversation objects
    for (const otherId of distinctUserIds) {
      const otherUser = MOCK_USERS.find(u => u.id === otherId);
      if (otherUser) {
        const msgs = userMessages.filter(m => m.senderId === otherId || m.receiverId === otherId);
        const lastMessage = msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const unreadCount = msgs.filter(m => m.receiverId === userId && !m.isRead).length;
        
        conversations.push({
          userId: otherId,
          user: otherUser,
          lastMessage,
          unreadCount
        });
      }
    }

    return conversations.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
  },

  getMessages: async (currentUserId: string, otherUserId: string): Promise<Message[]> => {
    // Note: No delay here for polling smoothness, or very small
    // Mark messages as read
    MOCK_MESSAGES.forEach(m => {
      if (m.receiverId === currentUserId && m.senderId === otherUserId && !m.isRead) {
        m.isRead = true;
      }
    });

    return MOCK_MESSAGES.filter(m => 
      (m.senderId === currentUserId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUserId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  sendMessage: async (senderId: string, receiverId: string, content: string): Promise<Message> => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    MOCK_MESSAGES.push(newMessage);

    // Simulate "Real-time" auto reply from the other user
    // We only reply if the receiver is not the current user (mock check)
    // Random delay between 2-5 seconds
    const replyDelay = Math.random() * 3000 + 2000;
    setTimeout(() => {
      const randomReply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyMessage: Message = {
        id: `m${Date.now() + 1}`,
        senderId: receiverId,
        receiverId: senderId,
        content: randomReply,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      MOCK_MESSAGES.push(replyMessage);
    }, replyDelay);

    return newMessage;
  }
};
