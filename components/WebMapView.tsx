import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface Location {
  latitude: number;
  longitude: number;
}

interface Place {
  id: string;
  name: string;
  address: string;
  location: Location;
  category?: string;
}

interface WebMapViewProps {
  places: Place[];
  selectedPlace: string | null;
  onMarkerPress: (placeId: string) => void;
  onMapPress: (coordinate: { latitude: number; longitude: number }) => void;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  getMarkerColor: (category?: string) => string;
  showUserLocation?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// 將 libraries 定義在組件外部，避免每次渲染都創建新數組
const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [];

const WebMapView = React.forwardRef<any, WebMapViewProps>(
  (
    {
      places,
      selectedPlace,
      onMarkerPress,
      onMapPress,
      initialRegion,
      getMarkerColor,
      showUserLocation,
    },
    ref
  ) => {
    const mapRef = useRef<any>(null);
    const [center, setCenter] = useState({
      lat: initialRegion.latitude,
      lng: initialRegion.longitude,
    });
    const [zoom, setZoom] = useState(13);

    // 確保 API key 存在
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { isLoaded, loadError } = useLoadScript({
      googleMapsApiKey: apiKey || '',
      libraries, // 使用外部定義的 libraries 常量
      version: 'weekly', // 使用最新版本
    });

    // 將 MapView ref 的方法暴露出去
    React.useImperativeHandle(ref, () => ({
      animateToRegion: (region: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }) => {
        if (mapRef.current && typeof window !== 'undefined' && (window as any).google) {
          mapRef.current.panTo({
            lat: region.latitude,
            lng: region.longitude,
          });
          // 根據 latitudeDelta 計算適當的縮放級別
          const newZoom = Math.round(Math.log(360 / region.latitudeDelta) / Math.LN2);
          mapRef.current.setZoom(Math.min(newZoom, 18));
        }
      },
      fitToCoordinates: (
        coordinates: Array<{ latitude: number; longitude: number }>,
        options?: { edgePadding?: { top: number; right: number; bottom: number; left: number }; animated?: boolean }
      ) => {
        if (mapRef.current && coordinates.length > 0 && typeof window !== 'undefined' && (window as any).google) {
          const google = (window as any).google;
          const bounds = new google.maps.LatLngBounds();
          coordinates.forEach((coord) => {
            bounds.extend({ lat: coord.latitude, lng: coord.longitude });
          });
          mapRef.current.fitBounds(bounds, options?.edgePadding);
        }
      },
    }));

    const onLoad = useCallback((map: any) => {
      mapRef.current = map;
    }, []);

    const handleClick = useCallback(
      (e: any) => {
        if (e.latLng) {
          onMapPress({
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
          });
        }
      },
      [onMapPress]
    );

    // 獲取標記圖標（使用彩色圓點）- 只在 Google Maps 載入後使用
    const getMarkerIcon = useCallback((category?: string) => {
      if (typeof window === 'undefined' || !(window as any).google) {
        return undefined; // 如果 Google Maps 還沒載入，返回 undefined
      }
      const google = (window as any).google;
      const color = getMarkerColor(category).replace('#', '');
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: `#${color}`,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10,
      };
    }, [getMarkerColor]);

    if (!apiKey) {
      console.error('Google Maps API key is not set');
      return null;
    }

    if (loadError) {
      console.error('Google Maps 載入錯誤:', loadError);
      let errorMessage = '地圖載入失敗';
      
      // 檢查是否是 API 未啟用的錯誤
      if (loadError.message?.includes('ApiNotActivatedMapError') || 
          loadError.message?.includes('ApiNotActivated')) {
        errorMessage = 'Google Maps JavaScript API 未啟用\n\n請在 Google Cloud Console 中：\n1. 啟用 "Maps JavaScript API"\n2. 確認 API Key 有正確的權限';
      } else if (loadError.message?.includes('RefererNotAllowedMapError')) {
        errorMessage = 'API Key 的網域限制設定錯誤\n\n請在 Google Cloud Console 中檢查 API Key 的 HTTP 引用來源設定';
      } else if (loadError.message?.includes('InvalidKeyMapError')) {
        errorMessage = 'API Key 無效\n\n請檢查 EXPO_PUBLIC_GOOGLE_MAPS_API_KEY 是否正確設定';
      }
      
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Text style={styles.errorDetails}>
              錯誤詳情：{loadError.message || '未知錯誤'}
            </Text>
          </View>
        </View>
      );
    }

    if (!isLoaded) {
      return (
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>載入地圖中...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onClick={handleClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              position={{
                lat: place.location.latitude,
                lng: place.location.longitude,
              }}
              title={place.name}
              icon={getMarkerIcon(place.category)}
              onClick={() => onMarkerPress(place.id)}
            />
          ))}
        </GoogleMap>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  errorDetails: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default WebMapView;
