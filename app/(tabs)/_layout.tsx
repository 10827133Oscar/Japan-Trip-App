import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '行程',
          tabBarIcon: ({ color }) => <TabIcon name="🗓️" color={color} />,
          headerTitle: '我的行程',
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: '景點',
          tabBarIcon: ({ color }) => <TabIcon name="📍" color={color} />,
          headerTitle: '景點列表',
        }}
      />
      {/* 暫時移除地圖Tab - react-native-maps在Expo Go中有問題 */}
      {/* <Tabs.Screen
        name="map"
        options={{
          title: '地圖',
          tabBarIcon: ({ color }) => <TabIcon name="🗺️" color={color} />,
          headerTitle: '地圖查看',
        }}
      /> */}
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} />,
          headerTitle: '個人設定',
        }}
      />
    </Tabs>
  );
}

const TabIcon = ({ name, color }: { name: string; color: string }) => (
  <span style={{ fontSize: 24 }}>{name}</span>
);
