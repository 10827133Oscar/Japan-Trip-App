import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
  onDelete?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onPress, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      '刪除景點',
      `確定要刪除「${place.name}」嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{place.name}</Text>
          {place.dayNumber && (
            <View style={styles.dayBadge}>
              <Text style={styles.dayText}>第{place.dayNumber}天</Text>
            </View>
          )}
        </View>

        {place.address && (
          <Text style={styles.address} numberOfLines={1}>
            📍 {place.address}
          </Text>
        )}

        {place.category && (
          <Text style={styles.category}>🏷️ {place.category}</Text>
        )}

        {place.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            📝 {place.notes}
          </Text>
        )}

        {place.visitDate && (
          <Text style={styles.date}>
            🗓️ {new Date(place.visitDate).toLocaleDateString('zh-TW')}
          </Text>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteText}>刪除</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  dayBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    fontStyle: 'italic',
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
