import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { AVAILABLE_COLORS } from '../../services/localUser';
import { Alert } from '../../utils/alert';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useUser();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    if (user) {
      setEditNickname(user.nickname);
      setEditColor(user.color);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      Alert.alert('提示', '請輸入暱稱');
      return;
    }

    try {
      await updateUser(editNickname, editColor);
      setIsEditing(false);
      Alert.alert('成功', '資料已更新');
    } catch (error) {
      Alert.alert('錯誤', '更新失敗');
    }
  };

  const handleLogout = () => {
    Alert.alert('清除資料', '確定要清除本地資料嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
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
        {user && (
          <View
            style={[
              styles.avatar,
              { backgroundColor: user.color }
            ]}
          >
            <Text style={styles.avatarText}>
              {user.nickname.charAt(0)}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user?.nickname || '用戶'}</Text>
        <Text style={styles.email}>裝置 ID: {user?.deviceId.slice(0, 12)}...</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>編輯個人資料</Text>
        </TouchableOpacity>
      </View>

      {/* 設定選項 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>關於App</Text>

        <MenuItem
          icon="ℹ️"
          title="版本資訊"
          subtitle="1.0.0"
          onPress={() => { }}
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
              '✓ 多人即時協作\n✓ 地圖標記景點\n✓ 智能路線規劃\n✓ 行程分天管理'
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
          onPress={() => { }}
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

      {/* 編輯資料 Modal */}
      <Modal visible={isEditing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>編輯個人資料</Text>

            <Text style={styles.label}>暱稱</Text>
            <TextInput
              style={styles.input}
              value={editNickname}
              onChangeText={setEditNickname}
              maxLength={10}
            />

            <Text style={styles.label}>代表色</Text>
            <View style={styles.colorsGrid}>
              {AVAILABLE_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c.value },
                    editColor === c.value && styles.colorSelected
                  ]}
                  onPress={() => setEditColor(c.value)}
                />
              ))}
            </View>
            <Text style={styles.colorHint}>
              💡 主題顏色會在儲存後立即更新
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.confirmButtonText}>儲存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
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
  editButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#333',
    transform: [{ scale: 1.1 }],
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  colorHint: {
    fontSize: 12,
    color: '#999',
    marginTop: -12,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
