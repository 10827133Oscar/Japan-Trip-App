import { Stack } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  console.log('📱 RootLayout mounting...');
  try {

    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.replace('/login');
        } else {
          router.replace('/(tabs)');
        }
      }
    }, [isAuthenticated, loading]);

    if (loading) {
      return null; // 或者顯示載入畫面
    }

    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="place-detail/[id]" options={{ headerShown: true, title: '景點詳情' }} />
      </Stack>
    );
  } catch (e) {
    console.error('🔥 CRITICAL ERROR IN ROOT LAYOUT:', e);
    return null;
  }
}
