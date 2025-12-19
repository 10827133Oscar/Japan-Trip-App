import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

// 預設地圖中心（東京）
const TOKYO_REGION: Region = {
  latitude: 35.6762,
  longitude: 139.6503,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

type FilterType = 'all' | number;

export default function MapScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { currentTrip } = useTrip();
  const { themeColor } = useUser();
  const { places, loading } = usePlaces(currentTrip?.id || null);
  const mapRef = useRef<MapView>(null);

  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [region, setRegion] = useState<Region>(TOKYO_REGION);

  // 獲取分類圖示
  const getCategoryIcon = (category?: string) => {
    if (!category) return '🏷️';
    const mapping: Record<string, string> = {
      '寺廟': '🕍',
      '餐廳': '🍴',
      '購物': '🛍️',
      '景點': '📸',
      '車站': '🚉',
      '飯店': '🏨',
      '其他': '📍',
    };
    return mapping[category] || '🏷️';
  };

  // 根據類型獲取標記顏色
  const getMarkerColor = (category?: string): string => {
    if (!category) return '#007AFF';
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('寺') || lowerCategory.includes('神社')) return '#9C27B0';
    if (lowerCategory.includes('餐') || lowerCategory.includes('食')) return '#FF5722';
    if (lowerCategory.includes('購') || lowerCategory.includes('店')) return '#E91E63';
    if (lowerCategory.includes('公園') || lowerCategory.includes('自然')) return '#4CAF50';
    if (lowerCategory.includes('博物') || lowerCategory.includes('美術')) return '#795548';
    if (lowerCategory.includes('塔') || lowerCategory.includes('樓')) return '#FF9800';
    return '#007AFF';
  };

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
      return places;
    }
    return places.filter(place => place.dayNumber === filter);
  }, [places, filter]);

  // 當景點載入完成後，或篩選變更時，調整地圖視野
  useEffect(() => {
    if (filteredPlaces.length > 0 && mapRef.current) {
      const coordinates = filteredPlaces.map(place => ({
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      }));

      // 如果只有一個點，使用 animateToRegion 會比 fitToCoordinates 效果更好（縮放比例更自然）
      if (coordinates.length === 1) {
        mapRef.current.animateToRegion({
          ...coordinates[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      } else {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          });
        }, 500);
      }
    }
  }, [filteredPlaces, filter]);

  // 處理來自景點頁面的 focus 請求
  useEffect(() => {
    if (searchParams.focus && places.length > 0) {
      const placeId = searchParams.focus as string;
      const place = places.find(p => p.id === placeId);

      if (place) {
        // 如果該景點不在當前篩選中，自動切換到該天或「全部」
        if (place.dayNumber && filter !== 'all' && filter !== place.dayNumber) {
          setFilter(place.dayNumber);
        }

        setTimeout(() => {
          mapRef.current?.animateToRegion({
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
          setSelectedPlace(placeId);
        }, 800);
      }
    }
  }, [searchParams.focus, places.length]);

  const [isAddingFromMap, setIsAddingFromMap] = useState(false);

  // 複製地址
  const handleCopyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    Alert.alert('已複製', '地址已複製到剪貼簿');
  };

  // 處理標記點擊
  const handleMarkerPress = (placeId: string) => {
    if (isAddingFromMap) return;
    setSelectedPlace(placeId);
  };

  // 處理地圖點擊
  const handleMapPress = (e: any) => {
    if (isAddingFromMap) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setIsAddingFromMap(false);
      router.push({
        pathname: '/place-detail/new',
        params: { lat: latitude, lng: longitude }
      });
    } else {
      setSelectedPlace(null);
    }
  };

  // 顯示所有景點
  const showAllPlaces = () => {
    if (filteredPlaces.length > 0 && mapRef.current) {
      const coordinates = filteredPlaces.map(place => ({
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
        animated: true,
      });
    }
  };

  // 無計畫狀態
  if (!currentTrip) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: themeColor }]}>
          <Text style={styles.headerSubtitle}>地圖</Text>
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

  // 載入中狀態
  if (loading && places.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: themeColor }]}>
          <Text style={styles.headerSubtitle}>地圖</Text>
          <Text style={[styles.headerSubtitle, { fontSize: 14, opacity: 0.8 }]}>{currentTrip.name}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColor} />
          <Text style={styles.loadingText}>載入地圖中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <Text style={[styles.headerSubtitle, { fontWeight: 'bold' }]}>{currentTrip.name}</Text>
      </View>

      {/* 篩選標籤 - 與景點頁面一致 */}
      {days.length > 0 && (
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && { backgroundColor: themeColor, borderColor: themeColor }]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                全部 ({places.length})
              </Text>
            </TouchableOpacity>

            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.filterChip, filter === day && { backgroundColor: themeColor, borderColor: themeColor }]}
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

      {/* 地圖 */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          showsScale
        >
          {filteredPlaces.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }}
              title={place.name}
              description={place.address}
              pinColor={getMarkerColor(place.category)}
              onPress={() => handleMarkerPress(place.id)}
            />
          ))}
        </MapView>

        {/* 新增模式提示 */}
        {/* 新增模式提示 - 移到左下角並簡化 */}
        {isAddingFromMap && (
          <View style={styles.addingHint}>
            <Text style={styles.addingHintText}>📍 請點擊地圖選擇位置</Text>
          </View>
        )}

        {/* 控制按鈕 */}
        {places.length > 1 && (
          <TouchableOpacity
            style={styles.showAllButton}
            onPress={showAllPlaces}
          >
            <Text style={styles.showAllButtonText}>📍 顯示全部</Text>
          </TouchableOpacity>
        )}

        {/* 景點數量指示器 */}
        {!isAddingFromMap && (
          <View style={styles.placeCount}>
            <Text style={styles.placeCountText}>
              📍 {places.length} 個景點
            </Text>
          </View>
        )}

        {/* 右下角新增按鈕 */}
        <TouchableOpacity
          style={[styles.mainFab, { backgroundColor: isAddingFromMap ? '#FF3B30' : themeColor }]}
          onPress={() => setIsAddingFromMap(!isAddingFromMap)}
        >
          <Ionicons name={isAddingFromMap ? "close" : "add"} size={32} color="#fff" />
        </TouchableOpacity>

        {/* 選中的景點資訊卡片 */}
        {selectedPlace && places.find(p => p.id === selectedPlace) && (
          <View style={styles.placeCard}>
            {(() => {
              const place = places.find(p => p.id === selectedPlace)!;
              return (
                <>
                  <View style={styles.placeCardHeader}>
                    <Text style={styles.placeCardName}>
                      {getCategoryIcon(place.category)} {place.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedPlace(null)}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.addressContainer}>
                    <Text style={styles.placeCardAddress} numberOfLines={2}>{place.address}</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => handleCopyAddress(place.address)}
                    >
                      <Ionicons name="copy-outline" size={20} color={themeColor} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[styles.detailButton, { backgroundColor: themeColor }]}
                    onPress={() => router.push(`/place-detail/${place.id}`)}
                  >
                    <Text style={[styles.detailButtonText, { color: '#fff' }]}>查看詳情 →</Text>
                  </TouchableOpacity>
                </>
              );
            })()}
          </View>
        )}

        {/* 無景點提示 */}
        {places.length === 0 && (
          <View style={styles.noPlacesOverlay}>
            <View style={styles.noPlacesCard}>
              <Text style={styles.noPlacesIcon}>📍</Text>
              <Text style={styles.noPlacesTitle}>還沒有景點</Text>
              <Text style={styles.noPlacesText}>
                前往「景點」頁面添加景點
              </Text>
              <TouchableOpacity
                style={styles.addPlaceButton}
                onPress={() => router.push('/place-detail/new')}
              >
                <Text style={styles.addPlaceButtonText}>+ 新增景點</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF', // Will be overridden
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filterWrapper: {
    height: 52,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
    zIndex: 10,
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
    height: 36,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  showAllButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  showAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  placeCount: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  placeCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  placeCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 20,
  },
  placeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#999',
  },
  placeCardAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  placeCardCategory: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  placeCardDay: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 12,
  },
  detailButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  noPlacesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  noPlacesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  noPlacesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPlacesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noPlacesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addingHint: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  addingHintText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainFab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 100,
  },
  addPlaceButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 10,
  },
  addPlaceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
