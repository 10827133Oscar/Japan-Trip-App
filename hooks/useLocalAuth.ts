import { useState, useEffect } from 'react';
import { getLocalUser, updateLocalUser, clearLocalUser, LocalUser } from '../services/localUser';

export const useLocalAuth = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const localUser = await getLocalUser();
      setUser(localUser);
    } catch (error) {
      console.error('載入用戶失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (nickname: string, color: string) => {
    try {
      const updated = await updateLocalUser(nickname, color);
      setUser(updated);
      return updated;
    } catch (error) {
      console.error('更新用戶失敗:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearLocalUser();
      setUser(null);
    } catch (error) {
      console.error('登出失敗:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    updateUser,
    logout,
    isAuthenticated: !!user,
  };
};
