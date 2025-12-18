import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { PlaceCard } from '../../components/PlaceCard';

type FilterType = 'all' | number;

export default function PlacesScreen() {
  const router = useRouter();
  const { currentTrip } = useTrip();
  const { places, sortedPlaces, loading, deletePlace } = usePlaces(currentTrip?.id || null);

  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // 獲取所有天數
  const days = useMemo(() => {
    const daySet = new Set<number>();
    places.forEach(place => {
      if (place.dayNumber) {
        daySet.add(place.dayNumber);
      }
    });
    return Array.from(daySet).sort((a, b) => a - b);
  }, [places]);

  // 篩選景點
  const filteredPlaces = useMemo(() => {
    if (filter === 'all') {
      return sortedPlaces;
    }
    return sortedPlaces.filter(place => place.dayNumber === filter);
  }, [sortedPlaces, filter]);

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    // usePlaces 會自動監聽變化，這裡只是模擬刷新
    setTimeout(() => setRefreshing(false), 1000);
  };

  // 處理「帶我去」
  const handleTakeMeThere = (placeId: string) => {
    router.push({
      pathname: '/map',
      params: { focus: placeId }
    });
  };

  // 處理編輯景點
  const handleEditPlace = (placeId: string) => {
    router.push(`/place-detail/${placeId}`);
  };

  // 處理刪除景點
  const handleDeletePlace = async (placeId: string) => {
    try {
      await deletePlace(placeId);
    } catch (error) {
      console.error('刪除景點失敗:', error);
    }
  };

  // 處理新增景點
  const handleAddPlace = () => {
    if (!currentTrip) {
      return;
    }
    router.push('/place-detail/new');
  };

  // 載入中狀態
  if (loading && places.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>景點</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      </View>
    );
  }

  // 無計畫狀態
  if (!currentTrip) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>景點</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>還沒有計畫</Text>
          <Text style={styles.emptyText}>
            請先在「行程」頁面創建或加入計畫
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>景點</Text>
        <Text style={styles.headerSubtitle}>{currentTrip.name}</Text>
      </View>

      {/* 篩選標籤 - 固定容器高度 */}
      {days.length > 0 && (
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                全部 ({places.length})
              </Text>
            </TouchableOpacity>

            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.filterChip, filter === day && styles.filterChipActive]}
                onPress={() => setFilter(day)}
              >
                <Text style={[styles.filterText, filter === day && styles.filterTextActive]}>
                  第{day}天 ({places.filter(p => p.dayNumber === day).length})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 景點列表 */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPlaces.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? '還沒有景點' : `第${filter}天還沒有景點`}
            </Text>
            <Text style={styles.emptyText}>
              點擊下方按鈕開始添加景點
            </Text>
          </View>
        ) : (
          filteredPlaces.map(place => (
            <PlaceCard
              key={place.id}
              place={place}
              onTakeMeThere={() => handleTakeMeThere(place.id)}
              onEdit={() => handleEditPlace(place.id)}
              onDelete={() => handleDeletePlace(place.id)}
            />
          ))
        )}
      </ScrollView>

      {/* 新增景點按鈕 */}
      <TouchableOpacity style={styles.fab} onPress={handleAddPlace}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  filterWrapper: {
    height: 52, // 保持固定高度防止背景拉伸
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
  },
  filterContainer: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    height: 36, // 加上固定高度確保不會被拉長
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
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
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
