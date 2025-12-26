
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  followingIds: string[]; // Array of user IDs that this user follows
  joinedDate: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  caption: string; // Acts as the "blog" content or short caption
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  likedBy: string[]; // Array of user IDs
  savedBy: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  userId: string; // The other user's ID
  user: User; // The other user's details
  lastMessage: Message;
  unreadCount: number;
}

export type Theme = 'light' | 'dark';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
