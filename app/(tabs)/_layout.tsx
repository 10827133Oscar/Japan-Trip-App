import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';

export default function TabLayout() {
  const { themeColor } = useUser();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColor,
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: themeColor,
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
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
          headerTitle: '我的行程',
        }}
      />
      <Tabs.Screen
        name="places"
        options={{
          title: '景點',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
          headerTitle: '景點列表',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: '地圖',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
          headerTitle: '地圖查看',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerTitle: '個人設定',
        }}
      />
    </Tabs>
  );
}
