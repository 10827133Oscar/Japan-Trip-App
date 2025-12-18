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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLocalAuth } from '../../hooks/useLocalAuth';
import { useTrip } from '../../hooks/useTrip';
import { usePlaces } from '../../hooks/usePlaces';
import { geocodeAddress, reverseGeocode } from '../../services/maps';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  { label: '寺廟', icon: '🕍' },
  { label: '餐廳', icon: '🍴' },
  { label: '購物', icon: '🛍️' },
  { label: '景點', icon: '📸' },
  { label: '車站', icon: '🚉' },
  { label: '飯店', icon: '🏨' },
  { label: '其他', icon: '📍' },
];

export default function PlaceDetailScreen() {
  const { id, lat, lng } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useLocalAuth();
  const { currentTrip } = useTrip();
  const { places, createPlace, updatePlace } = usePlaces(currentTrip?.id || null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('其他');
  const [notes, setNotes] = useState('');
  const [dayNumber, setDayNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoLocationLoading, setAutoLocationLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: boolean; address?: boolean }>({});

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
    } else if (lat && lng) {
      // 如果是從地圖傳過來的座標
      handleReverseGeocode(parseFloat(lat as string), parseFloat(lng as string));
    }
  }, [id, places, lat, lng]);

  const handleReverseGeocode = async (latitude: number, longitude: number) => {
    setAutoLocationLoading(true);
    try {
      const addr = await reverseGeocode({ latitude, longitude });
      if (addr) {
        setAddress(addr);
      }
    } catch (error) {
      console.error('逆地理編碼失敗:', error);
    } finally {
      setAutoLocationLoading(false);
    }
  };

  const handleSave = async () => {
    const newErrors: { name?: boolean; address?: boolean } = {};
    if (!name.trim()) newErrors.name = true;
    if (!address.trim()) newErrors.address = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentTrip || !user) {
      Alert.alert('提示', '請先選擇或創建計畫');
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // 地理編碼：將地址轉換為經緯度
      const location = await geocodeAddress(address);

      if (!location) {
        Alert.alert('錯誤', '無法找到該地址，請檢查地址是否正確');
        setSaving(false);
        return;
      }

      const placeData: any = {
        tripId: currentTrip.id,
        name: name.trim(),
        address: address.trim(),
        location,
        category: category.trim() || '其他',
        notes: notes.trim() || '',
        dayNumber: dayNumber.trim() ? parseInt(dayNumber) : null,
        addedBy: user.deviceId,
      };

      // 移除 undefined 值（雖然這裡用了 || '' 和 null，但為了安全再次處理）
      Object.keys(placeData).forEach(key =>
        placeData[key] === undefined && delete placeData[key]
      );

      if (id === 'new') {
        await createPlace(placeData);
        Alert.alert('成功', '景點已新增');
      } else {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.label}>景點名稱 *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="例如：淺草寺"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors({ ...errors, name: false });
            }}
          />

          <View style={styles.labelContainer}>
            <Text style={styles.label}>地址 *</Text>
            {autoLocationLoading && <ActivityIndicator size="small" color="#007AFF" />}
          </View>
          <TextInput
            style={[styles.input, styles.addressInput, errors.address && styles.inputError]}
            placeholder="例如：東京都台東區淺草2-3-1"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) setErrors({ ...errors, address: false });
            }}
            multiline
          />

          <Text style={styles.label}>類型</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.categoryLabel,
                  category === item.label && styles.categoryLabelActive,
                ]}
                onPress={() => setCategory(item.label)}
              >
                <Text style={styles.categoryIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    category === item.label && styles.categoryTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
            placeholder="必看雷門，營業時間：6:00-17:00"
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  addressInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  categoryLabelActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});
