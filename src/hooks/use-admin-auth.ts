'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isSeller: boolean;
  isVerified: boolean;
  accessToken: string;
  bitcoinAddress?: string;
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) {
        setAdmin(null);
        setLoading(false);
        return false;
      }

      const response = await fetch('/api/auth/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.user);
        setLoading(false);
        return true;
      } else {
        localStorage.removeItem('adminAccessToken');
        setAdmin(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('adminAccessToken');
      setAdmin(null);
      setLoading(false);
      return false;
    }
  };

  const login = async (
    email: string, 
    password: string, 
    twoFactorToken?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, twoFactorToken }),
        cache: 'no-store',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminAccessToken', data.accessToken);
        setAdmin(data.user);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAccessToken');
    setAdmin(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    admin,
    loading,
    login,
    logout,
    checkAuth,
  };
}