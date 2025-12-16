import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlacesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>景點</Text>
      </View>
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonTitle}>🚧 開發中</Text>
        <Text style={styles.comingSoonText}>
          景點管理功能正在開發中...
        </Text>
        <Text style={styles.comingSoonText}>
          完成計畫管理功能後將實作景點添加和編輯。
        </Text>
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
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
});
