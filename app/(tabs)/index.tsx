import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { getLocalUser, LocalUser } from '../../services/localUser';
import { useTrip } from '../../hooks/useTrip';

export default function HomeScreen() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const { trips, currentTrip, loading, createTrip, joinTrip, selectTrip } = useTrip();

  // Modal 狀態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // 創建計畫表單
  const [newTripName, setNewTripName] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('東京');
  const [newTripPassword, setNewTripPassword] = useState('');
  const [creating, setCreating] = useState(false);

  // 加入計畫表單
  const [joinTripId, setJoinTripId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const localUser = await getLocalUser();
    setUser(localUser);
  };

  // 處理創建計畫
  const handleCreateTrip = async () => {
    if (!newTripName.trim()) {
      Alert.alert('提示', '請輸入計畫名稱');
      return;
    }

    if (!newTripPassword.trim()) {
      Alert.alert('提示', '請設定計畫密碼');
      return;
    }

    try {
      setCreating(true);
      const trip = await createTrip(
        newTripName.trim(),
        newTripDestination.trim(),
        newTripPassword.trim()
      );

      setNewTripName('');
      setNewTripDestination('東京');
      setNewTripPassword('');
      setShowCreateModal(false);

      // 顯示計畫 ID
      Alert.alert(
        '計畫已創建！',
        `計畫 ID: ${trip.id}\n\n請將此 ID 和密碼分享給家人朋友，他們就能加入計畫。`,
        [
          {
            text: '複製 ID',
            onPress: async () => {
              await Clipboard.setStringAsync(trip.id);
              Alert.alert('已複製', '計畫 ID 已複製到剪貼簿');
            },
          },
          { text: '確定' },
        ]
      );
    } catch (error: any) {
      Alert.alert('錯誤', error.message || '創建計畫失敗');
    } finally {
      setCreating(false);
    }
  };

  // 處理加入計畫
  const handleJoinTrip = async () => {
    if (!joinTripId.trim()) {
      Alert.alert('提示', '請輸入計畫 ID');
      return;
    }

    if (!joinPassword.trim()) {
      Alert.alert('提示', '請輸入計畫密碼');
      return;
    }

    try {
      setJoining(true);
      await joinTrip(joinTripId.trim(), joinPassword.trim());

      setJoinTripId('');
      setJoinPassword('');
      setShowJoinModal(false);

      Alert.alert('成功', '已加入計畫！');
    } catch (error: any) {
      Alert.alert('錯誤', error.message || '加入計畫失敗');
    } finally {
      setJoining(false);
    }
  };

  // 複製計畫 ID
  const copyTripId = async (tripId: string) => {
    await Clipboard.setStringAsync(tripId);
    Alert.alert('已複製', '計畫 ID 已複製到剪貼簿');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>日本旅遊助手</Text>
        <Text style={styles.subtitle}>
          {user ? `歡迎回來，${user.nickname}！` : '歡迎回來！'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 快速操作 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>創建計畫</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionText}>加入計畫</Text>
          </TouchableOpacity>
        </View>

        {/* 我的計畫列表 */}
        {trips.length > 0 ? (
          <View style={styles.tripsContainer}>
            <Text style={styles.sectionTitle}>我的計畫 ({trips.length})</Text>
            {trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={[
                  styles.tripCard,
                  currentTrip?.id === trip.id && styles.tripCardActive,
                ]}
                onPress={() => selectTrip(trip)}
              >
                <View style={styles.tripHeader}>
                  <Text style={styles.tripName}>{trip.name}</Text>
                  <Text style={styles.tripDestination}>📍 {trip.destination}</Text>
                </View>

                <View style={styles.tripInfo}>
                  <Text style={styles.tripInfoText}>
                    👥 {trip.participants.length} 人參與
                  </Text>
                  <TouchableOpacity onPress={() => copyTripId(trip.id)}>
                    <Text style={styles.tripId}>ID: {trip.id.slice(0, 12)}...</Text>
                  </TouchableOpacity>
                </View>

                {/* 參與者顏色指示 */}
                <View style={styles.participantsColors}>
                  {trip.participants.map((p, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.participantDot,
                        { backgroundColor: p.color },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>還沒有計畫</Text>
            <Text style={styles.emptyText}>
              點擊上方「創建計畫」開始規劃您的旅程
            </Text>
            <Text style={styles.emptyText}>
              或使用「加入計畫」加入家人朋友的計畫
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 創建計畫 Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新計畫</Text>

            <TextInput
              style={styles.input}
              placeholder="計畫名稱（例如：東京家庭旅遊）"
              placeholderTextColor="#999"
              value={newTripName}
              onChangeText={setNewTripName}
              maxLength={30}
            />

            <TextInput
              style={styles.input}
              placeholder="目的地"
              placeholderTextColor="#999"
              value={newTripDestination}
              onChangeText={setNewTripDestination}
              maxLength={20}
            />

            <TextInput
              style={styles.input}
              placeholder="設定計畫密碼（分享給家人朋友）"
              placeholderTextColor="#999"
              value={newTripPassword}
              onChangeText={setNewTripPassword}
              secureTextEntry
              maxLength={20}
            />

            <Text style={styles.hint}>
              💡 密碼建議：簡單好記，例如 japan2024
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewTripName('');
                  setNewTripPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateTrip}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>創建</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 加入計畫 Modal */}
      <Modal visible={showJoinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>加入計畫</Text>

            <TextInput
              style={styles.input}
              placeholder="輸入計畫 ID"
              placeholderTextColor="#999"
              value={joinTripId}
              onChangeText={setJoinTripId}
            />

            <TextInput
              style={styles.input}
              placeholder="輸入計畫密碼"
              placeholderTextColor="#999"
              value={joinPassword}
              onChangeText={setJoinPassword}
              secureTextEntry
            />

            <Text style={styles.hint}>
              💡 向創建者索取計畫 ID 和密碼
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowJoinModal(false);
                  setJoinTripId('');
                  setJoinPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleJoinTrip}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>加入</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButton: {
    backgroundColor: '#34C759',
  },
  joinButton: {
    backgroundColor: '#007AFF',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tripsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  tripHeader: {
    marginBottom: 8,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tripDestination: {
    fontSize: 14,
    color: '#666',
  },
  tripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripInfoText: {
    fontSize: 13,
    color: '#666',
  },
  tripId: {
    fontSize: 12,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  participantsColors: {
    flexDirection: 'row',
    marginTop: 4,
  },
  participantDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  hint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
