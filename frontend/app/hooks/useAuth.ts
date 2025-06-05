'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie, removeCookie } from '../utils/cookies';

interface User {
  id: number;
  name: string;
  email: string;
  description?: string;
  profileImage?: string;
  cvUrl?: string;
  gender?: string;
  profession?: string;
  nationality?: string;
  age?: number;
  languages?: string[];
  projectsCount?: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    const userData = getCookie('user');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        removeCookie('token');
        removeCookie('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    setCookie('token', token);
    setCookie('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    removeCookie('token');
    removeCookie('user');
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    setUser,
  };
};