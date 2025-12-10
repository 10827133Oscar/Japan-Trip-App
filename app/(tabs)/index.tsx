import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { TripMembers } from '../../components/TripMembers';

export default function HomeScreen() {
  const { user } = useAuth();
  const { trips, currentTrip, createTrip, selectTrip, refreshTrips } = useTrip(user?.id || null);
  const { sortedPlaces, getPlacesByDay } = usePlaces(currentTrip?.id || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('東京');

  const handleCreateTrip = async () => {
    if (!newTripName.trim() || !user) {
      Alert.alert('錯誤', '請輸入行程名稱');
      return;
    }

    try {
      await createTrip({
        name: newTripName,
        destination: newTripDestination,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
        members: [user.id],
        createdBy: user.id,
      });

      setNewTripName('');
      setNewTripDestination('東京');
      setShowCreateModal(false);
      Alert.alert('成功', '行程創建成功！');
    } catch (error) {
      Alert.alert('錯誤', '創建行程失敗');
    }
  };

  // 計算行程天數
  const getTripDays = () => {
    if (!currentTrip) return 0;
    const days = Math.ceil(
      (currentTrip.endDate.getTime() - currentTrip.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  return (
    <View style={styles.container}>
      {/* 行程選擇器 */}
      <View style={styles.tripSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={[
                styles.tripCard,
                currentTrip?.id === trip.id && styles.tripCardActive,
              ]}
              onPress={() => selectTrip(trip)}
            >
              <Text
                style={[
                  styles.tripName,
                  currentTrip?.id === trip.id && styles.tripNameActive,
                ]}
              >
                {trip.name}
              </Text>
              <Text
                style={[
                  styles.tripDestination,
                  currentTrip?.id === trip.id && styles.tripDestinationActive,
                ]}
              >
                {trip.destination}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addTripCard}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.addTripText}>+ 新增行程</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 行程概覽 */}
      {currentTrip ? (
        <ScrollView style={styles.content}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>行程概覽</Text>
            <View style={styles.summaryRow}>
              <SummaryItem label="總景點" value={sortedPlaces.length} />
              <SummaryItem label="天數" value={getTripDays()} />
              <SummaryItem label="成員" value={currentTrip.members.length} />
            </View>
            <Text style={styles.dateRange}>
              {currentTrip.startDate.toLocaleDateString('zh-TW')} -{' '}
              {currentTrip.endDate.toLocaleDateString('zh-TW')}
            </Text>

            {/* 管理成員按鈕 */}
            <TouchableOpacity
              style={styles.manageMembersButton}
              onPress={() => setShowMembersModal(true)}
            >
              <Text style={styles.manageMembersButtonText}>👥 管理成員</Text>
            </TouchableOpacity>
          </View>

          {/* 每日行程 */}
          {Array.from({ length: getTripDays() }, (_, i) => i + 1).map((day) => {
            const dayPlaces = getPlacesByDay(day);
            return (
              <View key={day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>第 {day} 天</Text>
                {dayPlaces.length > 0 ? (
                  dayPlaces.map((place) => (
                    <View key={place.id} style={styles.placeItem}>
                      <Text style={styles.placeName}>{place.name}</Text>
                      {place.address && (
                        <Text style={styles.placeAddress} numberOfLines={1}>
                          {place.address}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyDay}>還沒有景點</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>還沒有行程</Text>
          <Text style={styles.emptySubtext}>點擊上方「新增行程」開始規劃</Text>
        </View>
      )}

      {/* 創建行程Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新行程</Text>

            <TextInput
              style={styles.input}
              placeholder="行程名稱（例如：東京家庭旅遊）"
              value={newTripName}
              onChangeText={setNewTripName}
            />

            <TextInput
              style={styles.input}
              placeholder="目的地"
              value={newTripDestination}
              onChangeText={setNewTripDestination}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateTrip}
              >
                <Text style={styles.confirmButtonText}>創建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 成員管理Modal */}
      {currentTrip && user && (
        <TripMembers
          trip={currentTrip}
          currentUserId={user.id}
          visible={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          onMembersUpdated={refreshTrips}
        />
      )}
    </View>
  );
}

const SummaryItem = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.summaryItem}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tripSelector: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tripCard: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120,
  },
  tripCardActive: {
    backgroundColor: '#007AFF',
  },
  tripName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tripNameActive: {
    color: '#fff',
  },
  tripDestination: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tripDestinationActive: {
    color: '#fff',
  },
  addTripCard: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  addTripText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dateRange: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  manageMembersButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  manageMembersButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  dayCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  placeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  placeAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  emptyDay: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
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
    borderRadius: 12,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
