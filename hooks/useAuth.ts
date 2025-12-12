import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../types';
import { signInWithGoogle, signOut, getCurrentUser, onAuthChange } from '../services/auth';

// 完成web browser session
WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth請求
  // 暫時使用Web Client ID for所有平台（Expo Go測試）
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  // 強制使用代理以生成 HTTPS 網址
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true,
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: webClientId,
      iosClientId: webClientId,
      androidClientId: webClientId,
      redirectUri,
    },
    // Discovery endpoints
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }
  );

  useEffect(() => {
    if (request) {
      console.log('🔗 Redirect URI (Please add this to Google Console):', request.redirectUri);
      console.log('🔑 Client ID loaded:', !!webClientId);
    }
  }, [request]);

  // 調試輸出
  useEffect(() => {
    if (request) {
      console.log('Redirect URI:', request.redirectUri);
    }
  }, [request]);

  // 監聽Google OAuth響應
  useEffect(() => {
    if (response?.type === 'success') {
      console.log('OAuth response:', response);
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleSignIn(id_token);
      } else {
        console.error('No id_token in response params:', response.params);
        setError('登入失敗：未收到驗證令牌');
      }
    } else if (response?.type === 'error') {
      console.error('OAuth error:', response.error);
      setError('登入失敗：' + (response.error?.message || '未知錯誤'));
    }
  }, [response]);

  // 監聽認證狀態變化
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getCurrentUser(firebaseUser.uid);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 處理Google登入
  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting Firebase sign in...');
      const userData = await signInWithGoogle(idToken);
      console.log('Sign in successful:', userData);
      setUser(userData);
    } catch (err: any) {
      const errorMsg = err?.message || '登入失敗，請重試';
      setError(errorMsg);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 登入函數
  const login = async () => {
    try {
      setError(null);
      await promptAsync();
    } catch (err) {
      setError('登入失敗，請重試');
      console.error(err);
    }
  };

  // 登出函數
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut();
      setUser(null);
    } catch (err) {
      setError('登出失敗，請重試');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
};
