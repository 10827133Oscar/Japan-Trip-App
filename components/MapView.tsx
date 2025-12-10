import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Place, Location } from '../types';

interface MapViewComponentProps {
  places: Place[];
  onMarkerPress?: (place: Place) => void;
  routeCoordinates?: Location[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  places,
  onMarkerPress,
  routeCoordinates,
  initialRegion,
}) => {
  const mapRef = useRef<MapView>(null);

  // 當景點改變時，自動調整地圖範圍
  useEffect(() => {
    if (places.length > 0 && mapRef.current) {
      const coordinates = places.map(place => ({
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [places]);

  // 默認區域（東京）
  const defaultRegion = {
    latitude: 35.6762,
    longitude: 139.6503,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion || defaultRegion}
      showsUserLocation
      showsMyLocationButton
    >
      {/* 景點標記 */}
      {places.map((place, index) => (
        <Marker
          key={place.id}
          coordinate={place.location}
          title={place.name}
          description={place.address}
          onPress={() => onMarkerPress?.(place)}
        >
          <MapMarkerIcon number={place.order || index + 1} />
        </Marker>
      ))}

      {/* 路線 */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#007AFF"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};

// 自定義標記圖示
const MapMarkerIcon: React.FC<{ number: number }> = ({ number }) => {
  return (
    <div
      style={{
        backgroundColor: '#FF3B30',
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
      }}
    >
      <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
        {number}
      </span>
    </div>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
