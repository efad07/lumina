import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MockService } from '../services/mockService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: { fullName: string; email: string; password: string; username: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (firebaseUser) => {
        if (!isMounted) return;
        
        // Reset error on state change
        setError(null);

        if (firebaseUser) {
          try {
            // Fetch user details from Firestore
            const appUser = await MockService.getUserById(firebaseUser.uid);
            if (isMounted) setUser(appUser);
          } catch (e) {
            console.error("Error fetching user profile", e);
            // Even if profile fetch fails, we stop loading. 
          }
        } else {
          if (isMounted) setUser(null);
        }
        
        if (isMounted) setIsLoading(false);
      },
      (err) => {
        console.error("Auth subscription error", err);
        if (isMounted) {
          setError("Authentication service unavailable");
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await MockService.login(email, password);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: { fullName: string; email: string; password: string; username: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await MockService.register(userData);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await MockService.logout();
      setUser(null);
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};