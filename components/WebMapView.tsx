import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

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
    const mapRef = useRef<google.maps.Map | null>(null);
    const [center, setCenter] = useState({
      lat: initialRegion.latitude,
      lng: initialRegion.longitude,
    });
    const [zoom, setZoom] = useState(13);

    // 將 MapView ref 的方法暴露出去
    React.useImperativeHandle(ref, () => ({
      animateToRegion: (region: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }) => {
        if (mapRef.current) {
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
        if (mapRef.current && coordinates.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          coordinates.forEach((coord) => {
            bounds.extend({ lat: coord.latitude, lng: coord.longitude });
          });
          mapRef.current.fitBounds(bounds, options?.edgePadding);
        }
      },
    }));

    const onLoad = useCallback((map: google.maps.Map) => {
      mapRef.current = map;
    }, []);

    const handleClick = useCallback(
      (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapPress({
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng(),
          });
        }
      },
      [onMapPress]
    );

    // 獲取標記圖標（使用彩色圓點）
    const getMarkerIcon = (category?: string) => {
      const color = getMarkerColor(category).replace('#', '');
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: `#${color}`,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 10,
      };
    };

    // 確保 API key 存在
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not set');
      return null;
    }

    return (
      <View style={styles.container}>
        <LoadScript googleMapsApiKey={apiKey}>
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
        </LoadScript>
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
});

export default WebMapView;
