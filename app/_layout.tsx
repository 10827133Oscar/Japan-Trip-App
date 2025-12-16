import { Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { getLocalUser } from '../services/localUser';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const segments = useSegments();
  const hasNavigated = useRef(false);

  useEffect(() => {
    checkLocalUser();
  }, []);

  const checkLocalUser = async () => {
    try {
      const localUser = await getLocalUser();
      console.log('Local user:', localUser);
      setUser(localUser);
    } catch (error) {
      console.error('Error checking local user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || hasNavigated.current) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      // 沒有用戶但在主頁，導航到登入頁
      hasNavigated.current = true;
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      // 有用戶但在登入頁，導航到主頁
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="place-detail/[id]" options={{ headerShown: true, title: '景點詳情' }} />
    </Stack>
  );
}
