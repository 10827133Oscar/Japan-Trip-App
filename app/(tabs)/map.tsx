import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { getDirections, decodePolyline } from '../../services/maps';
import { Location } from '../../types';

// 動態導入地圖組件，避免在 web 或初始化時崩潰
let MapViewComponent: any = null;
if (Platform.OS !== 'web') {
  try {
    MapViewComponent = require('../../components/MapView').MapViewComponent;
  } catch (e) {
    console.error('Failed to load MapView:', e);
  }
}

export default function MapScreen() {
  const { user } = useAuth();
  const { currentTrip } = useTrip(user?.id || null);
  const { sortedPlaces, loading } = usePlaces(currentTrip?.id || null);
  const [routeCoordinates, setRouteCoordinates] = useState<Location[]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);

  // 規劃路線
  const handlePlanRoute = async () => {
    if (sortedPlaces.length < 2) {
      alert('至少需要2個景點才能規劃路線');
      return;
    }

    setLoadingRoute(true);
    try {
      const origin = sortedPlaces[0].location;
      const destination = sortedPlaces[sortedPlaces.length - 1].location;
      const waypoints = sortedPlaces.slice(1, -1).map(p => p.location);

      const result = await getDirections(origin, destination, waypoints);

      if (result) {
        const coordinates = decodePolyline(result.polyline);
        setRouteCoordinates(coordinates);
        setShowRoute(true);
      } else {
        alert('無法規劃路線，請稍後再試');
      }
    } catch (error) {
      console.error('規劃路線錯誤:', error);
      alert('規劃路線失敗');
    } finally {
      setLoadingRoute(false);
    }
  };

  if (!currentTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>請先創建行程</Text>
        <Text style={styles.emptySubtext}>在「行程」頁面創建您的旅程</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  // 如果地圖組件無法載入，顯示錯誤訊息
  if (!MapViewComponent) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>地圖功能暫時無法使用</Text>
        <Text style={styles.emptySubtext}>
          {Platform.OS === 'web'
            ? '地圖功能僅在移動設備上可用'
            : '請確保使用 Expo Go 或開發構建'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapViewComponent
        places={sortedPlaces}
        routeCoordinates={showRoute ? routeCoordinates : undefined}
      />

      {/* 路線規劃按鈕 */}
      {sortedPlaces.length >= 2 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, loadingRoute && styles.buttonDisabled]}
            onPress={handlePlanRoute}
            disabled={loadingRoute}
          >
            {loadingRoute ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {showRoute ? '🔄 重新規劃' : '🗺️ 規劃路線'}
              </Text>
            )}
          </TouchableOpacity>

          {showRoute && (
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={() => {
                setShowRoute(false);
                setRouteCoordinates([]);
              }}
            >
              <Text style={styles.buttonText}>✕ 清除路線</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 景點數量提示 */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          📍 {sortedPlaces.length} 個景點
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
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
  controls: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});
