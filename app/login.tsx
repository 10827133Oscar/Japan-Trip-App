import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveLocalUser, AVAILABLE_COLORS } from '../services/localUser';

export default function WelcomeScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].value);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '請輸入您的暱稱');
      return;
    }

    if (nickname.trim().length > 10) {
      Alert.alert('提示', '暱稱不能超過 10 個字');
      return;
    }

    try {
      setLoading(true);
      await saveLocalUser(nickname.trim(), selectedColor);
      // 導航到計畫列表頁面
      router.replace('/(tabs)');
    } catch (error) {
      console.error('儲存用戶資料失敗:', error);
      Alert.alert('錯誤', '儲存失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>歡迎使用</Text>
        <Text style={styles.appName}>日本旅遊助手</Text>
        <Text style={styles.subtitle}>輕鬆規劃您的東京之旅</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>輸入您的暱稱</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：小明"
          placeholderTextColor="#999"
          value={nickname}
          onChangeText={setNickname}
          maxLength={10}
          autoFocus
        />

        <Text style={styles.label}>選擇您的顏色</Text>
        <Text style={styles.hint}>用於在協作中區分不同參與者</Text>

        <View style={styles.colorGrid}>
          {AVAILABLE_COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorOption,
                { backgroundColor: color.value },
                selectedColor === color.value && styles.colorSelected,
              ]}
              onPress={() => setSelectedColor(color.value)}
            >
              {selectedColor === color.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.selectedColorName}>
          已選擇：
          {AVAILABLE_COLORS.find(c => c.value === selectedColor)?.name}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.startButton, loading && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.startButtonText}>開始使用</Text>
        )}
      </TouchableOpacity>

      <View style={styles.features}>
        <FeatureItem icon="🗺️" text="地圖標記景點" />
        <FeatureItem icon="🚶" text="路線規劃" />
        <FeatureItem icon="👨‍👩‍👧‍👦" text="多人協作" />
        <FeatureItem icon="📱" text="即時同步" />
      </View>
    </ScrollView>
  );
}

const FeatureItem = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -6,
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    margin: 6,
  },
  colorSelected: {
    borderColor: '#333',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedColorName: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 32,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});
