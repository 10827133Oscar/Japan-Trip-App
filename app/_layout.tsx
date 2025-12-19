import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { TripProvider } from '../context/TripContext';
import { UserProvider, useUser } from '../context/UserContext';

function RootLayoutNav() {
  const { user, loading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      router.replace('/login');
    } else if (user && (segments[0] === 'login' || segments.length === 0)) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) return null;

  return (
    <TripProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="place-detail/[id]" options={{ headerShown: true, title: '景點詳情' }} />
      </Stack>
    </TripProvider>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}
