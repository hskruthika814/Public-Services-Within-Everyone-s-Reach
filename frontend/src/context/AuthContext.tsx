import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import type { AuthUserProfile } from '../data/demoUsers';

export type User = AuthUserProfile;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('civicease_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserStr = localStorage.getItem('civicease_user');

    if (token) {
      if (savedUserStr && !user) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch (e) {
          console.error('Error parsing stored user', e);
        }
      }

      // If client-side or demo token, skip backend verification
      if (
        token.startsWith('citizen-') ||
        token.startsWith('demo-') ||
        token.startsWith('officer-')
      ) {
        setLoading(false);
        return;
      }

      // For backend JWT tokens, check /auth/me
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('civicease_user', JSON.stringify(res.data.user));
          }
        })
        .catch((err) => {
          // Only invalidate session if backend explicitly responded with 401 Unauthorized
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('civicease_user');
            setUser(null);
          }
          // On 404 or network error (e.g. GitHub Pages static deployment), preserve saved user session!
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, loggedInUser: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('civicease_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('civicease_user');
    setUser(null);

    // Keep HashRouter path intact for static hosting / GitHub Pages
    if (window.location.hash.includes('dashboard')) {
      window.location.hash = '#/dashboard';
    } else {
      window.location.hash = '#/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
