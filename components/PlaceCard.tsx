import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Place } from '../types';

// 為 Android 啟用佈局動畫
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface PlaceCardProps {
  place: Place;
  onTakeMeThere: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onTakeMeThere, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

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

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity style={styles.card} onPress={toggleExpand} activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {getCategoryIcon(place.category)} {place.name}
            </Text>
            <View style={styles.headerRight}>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#999"
              />
            </View>
          </View>

          <View style={styles.addressRow}>
            {place.address && (
              <Text style={styles.address} numberOfLines={isExpanded ? undefined : 1}>
                📍 {place.address}
              </Text>
            )}
            {place.dayNumber && (
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>第{place.dayNumber}天</Text>
              </View>
            )}
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              {place.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>📝 {place.notes}</Text>
                </View>
              )}

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.goButton]}
                  onPress={onTakeMeThere}
                >
                  <Ionicons name="map" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>帶我去</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={onEdit}
                >
                  <Ionicons name="create" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>編輯</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.actionButtonText}>刪除</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
    marginRight: 8,
  },
  dayBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
  },
  goButton: {
    backgroundColor: '#34C759',
    marginLeft: 0,
  },
  editButton: {
    backgroundColor: '#FF9500',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    marginRight: 0,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
