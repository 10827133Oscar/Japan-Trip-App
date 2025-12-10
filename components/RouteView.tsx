import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Place } from '../types';

interface RouteViewProps {
  places: Place[];
  distance?: string;
  duration?: string;
  onOptimizeRoute?: () => void;
}

export const RouteView: React.FC<RouteViewProps> = ({
  places,
  distance,
  duration,
  onOptimizeRoute,
}) => {
  if (places.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>還沒有景點，請先添加景點</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 路線資訊 */}
      {(distance || duration) && (
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            {distance && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>總距離</Text>
                <Text style={styles.infoValue}>{distance}</Text>
              </View>
            )}
            {duration && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>預計時間</Text>
                <Text style={styles.infoValue}>{duration}</Text>
              </View>
            )}
          </View>

          {onOptimizeRoute && (
            <TouchableOpacity style={styles.optimizeButton} onPress={onOptimizeRoute}>
              <Text style={styles.optimizeText}>🔄 優化路線</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 景點列表 */}
      <ScrollView style={styles.placesList}>
        {places.map((place, index) => (
          <View key={place.id} style={styles.placeItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepText}>{index + 1}</Text>
            </View>

            <View style={styles.placeContent}>
              <Text style={styles.placeName}>{place.name}</Text>
              {place.address && (
                <Text style={styles.placeAddress} numberOfLines={1}>
                  {place.address}
                </Text>
              )}
              {place.notes && (
                <Text style={styles.placeNotes} numberOfLines={2}>
                  {place.notes}
                </Text>
              )}
            </View>

            {index < places.length - 1 && (
              <View style={styles.connector}>
                <Text style={styles.connectorText}>↓</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  optimizeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  optimizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  placeItem: {
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 12,
    zIndex: 1,
  },
  stepText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  placeContent: {
    backgroundColor: '#fff',
    padding: 16,
    paddingLeft: 48,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  placeNotes: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  connector: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  connectorText: {
    fontSize: 20,
    color: '#007AFF',
  },
});
