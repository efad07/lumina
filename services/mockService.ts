
import { User, Post, Comment, Message, Conversation } from '../types';
import { auth, db, storage } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  arrayUnion, 
  arrayRemove,
  serverTimestamp,
  limit,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Helper to convert Firestore Timestamp to string
const convertDates = (data: any) => {
  if (!data) return data;
  const result = { ...data };
  if (result.createdAt && typeof result.createdAt.toDate === 'function') {
    result.createdAt = result.createdAt.toDate().toISOString();
  }
  if (result.joinedDate && typeof result.joinedDate.toDate === 'function') {
    result.joinedDate = result.joinedDate.toDate().toISOString();
  }
  return result;
};

export const MockService = {
  // Auth
  login: async (email: string, password?: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password || '');
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found.');
    }
    
    return { id: userDoc.id, ...convertDates(userDoc.data()) } as User;
  },

  register: async (userData: { fullName: string; email: string; password: string; username: string }): Promise<User> => {
    // Check if username taken
    const q = query(collection(db, 'users'), where('username', '==', userData.username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error('Username is already taken');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const uid = userCredential.user.uid;
    
    const newUser: User = {
      id: uid,
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

    // Save to Firestore
    await setDoc(doc(db, 'users', uid), {
      ...newUser,
      joinedDate: serverTimestamp()
    });

    await updateAuthProfile(userCredential.user, {
      displayName: userData.fullName,
      photoURL: newUser.avatarUrl
    });

    return newUser;
  },

  logout: async () => {
    await signOut(auth);
  },

  // Posts
  getFeed: async (): Promise<Post[]> => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as Post));
  },
  
  getTrendingPosts: async (): Promise<Post[]> => {
    const q = query(collection(db, 'posts'), orderBy('likes', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as Post));
  },

  getUserPosts: async (userId: string): Promise<Post[]> => {
    // Requires composite index if we use where + orderBy.
    // For simplicity and avoiding index errors, we'll sort client-side.
    const q = query(collection(db, 'posts'), where('authorId', '==', userId));
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as Post));
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createPost: async (postData: Partial<Post>): Promise<Post> => {
    const newPostData = {
      authorId: postData.authorId,
      authorName: postData.authorName,
      authorAvatar: postData.authorAvatar,
      caption: postData.caption,
      imageUrl: postData.imageUrl || null,
      videoUrl: postData.videoUrl || null,
      likes: 0,
      comments: 0,
      likedBy: [],
      savedBy: [],
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'posts'), newPostData);
    
    return {
      id: docRef.id,
      ...newPostData,
      createdAt: new Date().toISOString(),
      imageUrl: newPostData.imageUrl || undefined,
      videoUrl: newPostData.videoUrl || undefined,
    } as Post;
  },

  deletePost: async (postId: string): Promise<void> => {
    await deleteDoc(doc(db, 'posts', postId));
  },

  toggleLike: async (postId: string, userId: string): Promise<void> => {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

    const postData = postSnap.data();
    const likedBy = postData.likedBy || [];
    const hasLiked = likedBy.includes(userId);

    if (hasLiked) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(userId),
        likes: (postData.likes || 1) - 1
      });
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(userId),
        likes: (postData.likes || 0) + 1
      });
    }
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    // Sort client-side to avoid index requirement on (postId, createdAt)
    const q = query(collection(db, 'comments'), where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as Comment));
    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  addComment: async (postId: string, content: string, userId: string): Promise<Comment> => {
    const user = await MockService.getUserById(userId);
    if (!user) throw new Error("User not found");

    const newCommentData = {
      postId,
      authorId: user.id,
      authorName: user.fullName,
      authorAvatar: user.avatarUrl,
      content,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'comments'), newCommentData);
    
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
       await updateDoc(postRef, {
         comments: (postSnap.data().comments || 0) + 1
       });
    }

    return {
      id: docRef.id,
      ...newCommentData,
      createdAt: new Date().toISOString()
    } as Comment;
  },

  // Users
  getUserProfile: async (username: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...convertDates(userDoc.data()) } as User;
  },

  getUserById: async (id: string): Promise<User | null> => {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...convertDates(userDoc.data()) } as User;
  },
  
  getSuggestedUsers: async (currentUserId?: string): Promise<User[]> => {
    const q = query(collection(db, 'users'), limit(10));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as User));
    
    if (!currentUserId) return users.slice(0, 3);
    return users.filter(u => u.id !== currentUserId).slice(0, 5);
  },
  
  getFollowers: async (userId: string): Promise<User[]> => {
    const q = query(collection(db, 'users'), where('followingIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as User));
  },

  getFollowing: async (userId: string): Promise<User[]> => {
    const user = await MockService.getUserById(userId);
    if (!user || !user.followingIds || user.followingIds.length === 0) return [];
    
    const idsToFetch = user.followingIds.slice(0, 10);
    const q = query(collection(db, 'users'), where('__name__', 'in', idsToFetch));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as User));
  },
  
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
    return await MockService.getUserById(userId) as User;
  },

  followUser: async (followerId: string, targetId: string): Promise<void> => {
    const followerRef = doc(db, 'users', followerId);
    const targetRef = doc(db, 'users', targetId);

    const followerSnap = await getDoc(followerRef);
    const targetSnap = await getDoc(targetRef);

    if (!followerSnap.exists() || !targetSnap.exists()) return;

    await updateDoc(followerRef, {
      followingIds: arrayUnion(targetId),
      following: (followerSnap.data().following || 0) + 1
    });

    await updateDoc(targetRef, {
      followers: (targetSnap.data().followers || 0) + 1
    });
  },

  unfollowUser: async (followerId: string, targetId: string): Promise<void> => {
    const followerRef = doc(db, 'users', followerId);
    const targetRef = doc(db, 'users', targetId);

    const followerSnap = await getDoc(followerRef);
    const targetSnap = await getDoc(targetRef);

    if (!followerSnap.exists() || !targetSnap.exists()) return;

    await updateDoc(followerRef, {
      followingIds: arrayRemove(targetId),
      following: Math.max(0, (followerSnap.data().following || 1) - 1)
    });

    await updateDoc(targetRef, {
      followers: Math.max(0, (targetSnap.data().followers || 1) - 1)
    });
  },

  // Messaging
  getMessages: async (currentUserId: string, otherUserId: string): Promise<Message[]> => {
    // Removed orderBy('createdAt') to avoid index requirement with 'array-contains'
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUserId)
    );
    
    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as Message))
      .filter(m => 
        (m.senderId === currentUserId && m.receiverId === otherUserId) || 
        (m.senderId === otherUserId && m.receiverId === currentUserId)
      );
    
    // Client-side sort
    return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  
  getConversations: async (userId: string): Promise<Conversation[]> => {
    // Removed orderBy('createdAt') to avoid index requirement
    const q = query(
      collection(db, 'messages'), 
      where('participants', 'array-contains', userId)
    );
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...convertDates(doc.data()) } as Message))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort descending
    
    const distinctUserIds = new Set<string>();
    messages.forEach(m => {
      distinctUserIds.add(m.senderId === userId ? m.receiverId : m.senderId);
    });

    const conversations: Conversation[] = [];
    
    for (const otherId of distinctUserIds) {
      const otherUser = await MockService.getUserById(otherId);
      if (otherUser) {
        const userMsgs = messages.filter(m => 
          (m.senderId === userId && m.receiverId === otherId) || 
          (m.senderId === otherId && m.receiverId === userId)
        );
        
        if (userMsgs.length > 0) {
          const lastMessage = userMsgs[0]; 
          conversations.push({
             userId: otherId,
             user: otherUser,
             lastMessage,
             unreadCount: 0 
          });
        }
      }
    }
    
    return conversations;
  },

  sendMessage: async (senderId: string, receiverId: string, content: string): Promise<Message> => {
    const newMessageData = {
      senderId,
      receiverId,
      content,
      createdAt: serverTimestamp(),
      isRead: false,
      participants: [senderId, receiverId]
    };
    
    const docRef = await addDoc(collection(db, 'messages'), newMessageData);
    return { id: docRef.id, ...newMessageData, createdAt: new Date().toISOString() } as Message;
  },

  // Storage
  uploadFile: async (file: File): Promise<string> => {
    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
};
