import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('登出', '確定要登出嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '登出',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* 用戶資訊卡片 */}
      <View style={styles.profileCard}>
        {user?.photoURL && (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        )}
        <Text style={styles.name}>{user?.displayName || '用戶'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* 設定選項 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>關於App</Text>

        <MenuItem
          icon="ℹ️"
          title="版本資訊"
          subtitle="1.0.0"
          onPress={() => {}}
        />

        <MenuItem
          icon="📚"
          title="使用說明"
          subtitle="查看如何使用App"
          onPress={() => {
            Alert.alert(
              '使用說明',
              '1. 在「行程」頁面創建旅程\n2. 在「景點」頁面添加景點\n3. 在「地圖」頁面查看和規劃路線\n4. 邀請家人一起編輯（分享帳號）'
            );
          }}
        />

        <MenuItem
          icon="💡"
          title="功能特色"
          subtitle="查看App亮點"
          onPress={() => {
            Alert.alert(
              '功能特色',
              '✓ 多人即時協作\n✓ 地圖標記景點\n✓ 智能路線規劃\n✓ 行程分天管理\n✓ Google登入安全快速'
            );
          }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>數據管理</Text>

        <MenuItem
          icon="☁️"
          title="資料同步"
          subtitle="自動雲端同步"
          badge="已啟用"
          onPress={() => {}}
        />

        <MenuItem
          icon="👥"
          title="協作成員"
          subtitle="管理行程成員"
          onPress={() => {
            Alert.alert('提示', '在行程頁面可以分享給家人');
          }}
        />
      </View>

      {/* 登出按鈕 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>登出</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Made with ❤️ for family trips
      </Text>
    </ScrollView>
  );
}

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  badge,
  onPress,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {badge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 24,
  },
});
