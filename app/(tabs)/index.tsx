import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Alert } from '../../utils/alert';
import { Trip } from '../../types';
import { useTrip } from '../../hooks/useTrip';
import { useUser } from '../../context/UserContext';
import { WeatherWidget } from '../../components/WeatherWidget';
import { CreateTripModal } from '../../components/modals/CreateTripModal';
import { JoinTripModal } from '../../components/modals/JoinTripModal';
import { TripDetailsModal } from '../../components/modals/TripDetailsModal';

export default function HomeScreen() {
  const { user, themeColor } = useUser();
  const { trips, currentTrip, loading, createTrip, joinTrip, selectTrip, leaveTrip } = useTrip();

  // Modal 狀態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // 計畫管理狀態
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailsTrip, setSelectedDetailsTrip] = useState<Trip | null>(null);

  // 處理退出計畫
  const handleLeaveTrip = (trip: Trip) => {
    Alert.alert(
      '退出計畫',
      `確定要退出「${trip.name}」嗎？退出後您將無法查看此計畫的景點。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定退出',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveTrip(trip.id);
              Alert.alert('已退出', '您已成功退出該計畫');
            } catch (error: any) {
              Alert.alert('錯誤', error.message || '退出計畫失敗');
            }
          }
        },
      ]
    );
  };

  // 查看詳情
  const handleViewDetails = (trip: Trip) => {
    setSelectedDetailsTrip(trip);
    setShowDetailsModal(true);
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
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <View style={styles.headerInfo}>
          <Text style={styles.subtitle}>
            {user ? `Hello, ${user.nickname}！` : 'Hello！'}
          </Text>
          {currentTrip && <Text style={styles.headerTripName}>{currentTrip.name}</Text>}
        </View>
        <View style={{ marginTop: 10 }}>
          {currentTrip && <WeatherWidget destination={currentTrip.destination} />}
        </View>
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
            style={[styles.actionButton, { backgroundColor: themeColor }]}
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
                  currentTrip?.id === trip.id && { borderColor: themeColor },
                ]}
                onPress={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
              >
                <View style={styles.tripHeader}>
                  <View style={styles.tripTitleWrapper}>
                    <Text style={styles.tripName}>{trip.name}</Text>
                    {currentTrip?.id === trip.id && (
                      <View style={[styles.activeBadge, { backgroundColor: themeColor }]}>
                        <Text style={styles.activeBadgeText}>使用中</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tripDestination}>📍 {trip.destination}</Text>
                </View>

                <View style={styles.tripInfo}>
                  <Text style={styles.tripInfoText}>
                    👥 {trip.participants.length} 人參與
                  </Text>
                  <Text style={styles.tripIdText}>ID: {trip.id}</Text>
                </View>

                {/* 展開後的按鈕 */}
                {expandedTripId === trip.id && (
                  <View style={styles.tripCardActions}>
                    <TouchableOpacity
                      style={[styles.tripActionBtn, styles.switchBtn]}
                      onPress={() => {
                        selectTrip(trip);
                        Alert.alert('已切換', `現在切換至：${trip.name}`);
                      }}
                    >
                      <Text style={styles.tripActionText}>切換計畫</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tripActionBtn, styles.detailsBtn]}
                      onPress={() => handleViewDetails(trip)}
                    >
                      <Text style={styles.tripActionText}>查看詳情</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tripActionBtn, styles.leaveBtn]}
                      onPress={() => handleLeaveTrip(trip)}
                    >
                      <Text style={styles.tripActionText}>退出計畫</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 參與者顏色指示 */}
                <View style={styles.participantsColors}>
                  {trip.participants.map((p, idx) => {
                    // 如果是當前用戶，使用 UserContext 中的顏色（最新）
                    const displayColor = (p.deviceId === user?.deviceId && user?.color) 
                      ? user.color 
                      : p.color;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.participantDot,
                          { backgroundColor: displayColor },
                        ]}
                      />
                    );
                  })}
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

      <CreateTripModal
        visible={showCreateModal}
        themeColor={themeColor}
        onClose={() => setShowCreateModal(false)}
        onCreateTrip={createTrip}
      />

      <JoinTripModal
        visible={showJoinModal}
        themeColor={themeColor}
        onClose={() => setShowJoinModal(false)}
        onJoinTrip={joinTrip}
      />

      <TripDetailsModal
        visible={showDetailsModal}
        trip={selectedDetailsTrip}
        currentDeviceId={user?.deviceId}
        themeColor={themeColor}
        onClose={() => setShowDetailsModal(false)}
      />
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    marginRight: 10,
  },
  headerTripName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
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
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  tripTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: '#007AFF', // 這裡稍後會由 inline style 覆蓋，但為了結構保留
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tripIdText: {
    fontSize: 12,
    color: '#999',
  },
  tripCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 12,
  },
  tripActionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  switchBtn: {
    backgroundColor: '#E3F2FD',
  },
  detailsBtn: {
    backgroundColor: '#F5F5F5',
  },
  leaveBtn: {
    backgroundColor: '#FFEBEE',
  },
  tripActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  // 詳情 Modal 樣式
  detailsModalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  detailsScroll: {
    marginTop: 10,
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  idCopyWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  memberColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  memberName: {
    fontSize: 14,
    color: '#555',
  },
  detailsCloseBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
});
