import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Trip, User } from '../types';
import {
  getTripMembers,
  getUserByEmail,
  addMemberToTrip,
  removeMemberFromTrip,
} from '../services/firestore';

interface TripMembersProps {
  trip: Trip;
  currentUserId: string;
  visible: boolean;
  onClose: () => void;
  onMembersUpdated?: () => void;
}

export const TripMembers: React.FC<TripMembersProps> = ({
  trip,
  currentUserId,
  visible,
  onClose,
  onMembersUpdated,
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // 載入成員列表
  useEffect(() => {
    if (visible) {
      loadMembers();
    }
  }, [visible, trip.members]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await getTripMembers(trip.members);
      setMembers(membersData);
    } catch (error) {
      console.error('載入成員失敗:', error);
      Alert.alert('錯誤', '載入成員列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 邀請新成員
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('錯誤', '請輸入email');
      return;
    }

    const email = inviteEmail.trim().toLowerCase();

    // 驗證email格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('錯誤', '請輸入有效的email地址');
      return;
    }

    setInviting(true);

    try {
      // 查找用戶
      const user = await getUserByEmail(email);

      if (!user) {
        Alert.alert(
          '用戶不存在',
          `找不到使用 ${email} 的用戶。\n\n請確認：\n1. 該用戶已經用此email登入過App\n2. Email拼寫正確`
        );
        setInviting(false);
        return;
      }

      // 檢查是否已是成員
      if (trip.members.includes(user.id)) {
        Alert.alert('提示', `${user.displayName || user.email} 已經是成員了`);
        setInviting(false);
        return;
      }

      // 添加成員
      await addMemberToTrip(trip.id, user.id);

      Alert.alert('成功', `已邀請 ${user.displayName || user.email} 加入旅程！`);
      setInviteEmail('');
      loadMembers();
      onMembersUpdated?.();
    } catch (error) {
      console.error('邀請成員失敗:', error);
      Alert.alert('錯誤', '邀請失敗，請重試');
    } finally {
      setInviting(false);
    }
  };

  // 移除成員
  const handleRemoveMember = (member: User) => {
    if (member.id === trip.createdBy) {
      Alert.alert('提示', '無法移除創建者');
      return;
    }

    if (member.id === currentUserId) {
      Alert.alert('提示', '無法移除自己，請使用「退出旅程」功能');
      return;
    }

    Alert.alert(
      '移除成員',
      `確定要將 ${member.displayName || member.email} 移出此旅程嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMemberFromTrip(trip.id, member.id);
              Alert.alert('成功', '已移除成員');
              loadMembers();
              onMembersUpdated?.();
            } catch (error) {
              console.error('移除成員失敗:', error);
              Alert.alert('錯誤', '移除失敗，請重試');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 標題 */}
          <View style={styles.header}>
            <Text style={styles.title}>旅程成員</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 邀請區域 */}
          <View style={styles.inviteSection}>
            <Text style={styles.sectionTitle}>邀請新成員</Text>
            <View style={styles.inviteInputRow}>
              <TextInput
                style={styles.emailInput}
                placeholder="輸入家人的 Gmail 地址"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!inviting}
              />
              <TouchableOpacity
                style={[styles.inviteButton, inviting && styles.inviteButtonDisabled]}
                onPress={handleInvite}
                disabled={inviting}
              >
                {inviting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.inviteButtonText}>邀請</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inviteHint}>
              💡 對方需要先用該 email 登入過 App 才能被邀請
            </Text>
          </View>

          {/* 成員列表 */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>
              成員列表 ({members.length})
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#007AFF" />
                <Text style={styles.loadingText}>載入中...</Text>
              </View>
            ) : (
              <ScrollView style={styles.membersList}>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    {member.photoURL && (
                      <Image
                        source={{ uri: member.photoURL }}
                        style={styles.memberAvatar}
                      />
                    )}
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>
                        {member.displayName || '用戶'}
                        {member.id === trip.createdBy && (
                          <Text style={styles.creatorBadge}> (創建者)</Text>
                        )}
                        {member.id === currentUserId && (
                          <Text style={styles.meBadge}> (我)</Text>
                        )}
                      </Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                    </View>

                    {member.id !== trip.createdBy &&
                      member.id !== currentUserId &&
                      currentUserId === trip.createdBy && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveMember(member)}
                        >
                          <Text style={styles.removeButtonText}>移除</Text>
                        </TouchableOpacity>
                      )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* 關閉按鈕 */}
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>完成</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  inviteSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inviteInputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  inviteButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  inviteButtonDisabled: {
    opacity: 0.6,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  inviteHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  membersSection: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  membersList: {
    maxHeight: 300,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  creatorBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  meBadge: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: 'bold',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
