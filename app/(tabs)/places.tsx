import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { PlaceCard } from '../../components/PlaceCard';

export default function PlacesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTrip } = useTrip(user?.id || null);
  const { sortedPlaces, loading, deletePlace } = usePlaces(currentTrip?.id || null);

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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {sortedPlaces.length > 0 ? (
          sortedPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onPress={() => router.push(`/place-detail/${place.id}`)}
              onDelete={() => deletePlace(place.id)}
            />
          ))
        ) : (
          <View style={styles.emptyPlaces}>
            <Text style={styles.emptyPlacesText}>還沒有景點</Text>
            <Text style={styles.emptyPlacesSubtext}>點擊下方按鈕添加第一個景點</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/place-detail/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyPlaces: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyPlacesText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptyPlacesSubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
