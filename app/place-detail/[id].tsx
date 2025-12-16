import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocalAuth } from '../../hooks/useLocalAuth';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { geocodeAddress } from '../../services/maps';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useLocalAuth();
  const { currentTrip } = useTrip();
  const { places, createPlace, updatePlace } = usePlaces(currentTrip?.id || null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [dayNumber, setDayNumber] = useState('');
  const [saving, setSaving] = useState(false);

  // 如果是編輯模式，載入現有資料
  useEffect(() => {
    if (id !== 'new') {
      const place = places.find((p) => p.id === id);
      if (place) {
        setName(place.name);
        setAddress(place.address);
        setCategory(place.category || '');
        setNotes(place.notes || '');
        setDayNumber(place.dayNumber?.toString() || '');
      }
    }
  }, [id, places]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('錯誤', '請輸入景點名稱');
      return;
    }

    if (!address.trim()) {
      Alert.alert('錯誤', '請輸入地址');
      return;
    }

    if (!currentTrip || !user) {
      Alert.alert('錯誤', '請先創建行程');
      return;
    }

    setSaving(true);

    try {
      // 地理編碼：將地址轉換為經緯度
      const location = await geocodeAddress(address);

      if (!location) {
        Alert.alert('錯誤', '無法找到該地址，請檢查地址是否正確');
        setSaving(false);
        return;
      }

      const placeData = {
        tripId: currentTrip.id,
        name: name.trim(),
        address: address.trim(),
        location,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        addedBy: user.deviceId,
      };

      if (id === 'new') {
        // 新增景點
        await createPlace(placeData);
        Alert.alert('成功', '景點已新增');
      } else {
        // 更新景點
        await updatePlace(id as string, placeData);
        Alert.alert('成功', '景點已更新');
      }

      router.back();
    } catch (error) {
      console.error('保存景點錯誤:', error);
      Alert.alert('錯誤', '保存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>景點名稱 *</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：淺草寺"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>地址 *</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：東京都台東區淺草2-3-1"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={styles.label}>類型</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：寺廟、餐廳、購物"
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>第幾天</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：1（表示第一天）"
          value={dayNumber}
          onChangeText={setDayNumber}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>備註</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="例如：必看雷門，營業時間：6:00-17:00"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {id === 'new' ? '新增景點' : '更新景點'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
