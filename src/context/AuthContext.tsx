import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { toAppUser } from '../services/authService';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ? toAppUser(session.user) : null);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('No se pudo recuperar la sesión de Supabase:', error.message);
      }
      if (mounted) {
        setUser(data.session?.user ? toAppUser(data.session.user) : null);
        setIsLoading(false);
      }
    }).catch((error: unknown) => {
      console.error('No se pudo recuperar la sesión de Supabase:', error);
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => setUser(userData);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};