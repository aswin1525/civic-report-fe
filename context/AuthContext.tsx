import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserType } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userType: UserType | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void; } | null = null;

    async function initializeSession() {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        
        // This subscription is now created inside the try/catch block
        authSubscription = api.onAuthStateChange(setUser);
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initializeSession();

    // Cleanup function will be called on component unmount
    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await api.login(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      userType: user?.type || null,
      login,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};