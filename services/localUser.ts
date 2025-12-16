import AsyncStorage from '@react-native-async-storage/async-storage';

// 本地用戶類型
export interface LocalUser {
  deviceId: string;      // 唯一裝置 ID
  nickname: string;      // 暱稱
  color: string;         // 顏色（用於區分不同參與者）
  createdAt: Date;       // 建立時間
}

const USER_STORAGE_KEY = '@japan_trip_app:local_user';

// 生成唯一裝置 ID
const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// 儲存用戶資料到本地
export const saveLocalUser = async (nickname: string, color: string): Promise<LocalUser> => {
  try {
    const user: LocalUser = {
      deviceId: generateDeviceId(),
      nickname,
      color,
      createdAt: new Date(),
    };

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('儲存用戶資料錯誤:', error);
    throw error;
  }
};

// 獲取本地用戶資料
export const getLocalUser = async (): Promise<LocalUser | null> => {
  try {
    const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (!userJson) return null;

    const user = JSON.parse(userJson);
    // 將日期字串轉回 Date 對象
    user.createdAt = new Date(user.createdAt);
    return user;
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    return null;
  }
};

// 更新用戶資料
export const updateLocalUser = async (nickname: string, color: string): Promise<LocalUser | null> => {
  try {
    const existingUser = await getLocalUser();
    if (!existingUser) return null;

    const updatedUser: LocalUser = {
      ...existingUser,
      nickname,
      color,
    };

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('更新用戶資料錯誤:', error);
    throw error;
  }
};

// 清除用戶資料
export const clearLocalUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('清除用戶資料錯誤:', error);
    throw error;
  }
};

// 預設顏色選項
export const AVAILABLE_COLORS = [
  { name: '紅色', value: '#FF6B6B' },
  { name: '藍色', value: '#4ECDC4' },
  { name: '綠色', value: '#95E1D3' },
  { name: '黃色', value: '#FFE66D' },
  { name: '紫色', value: '#A393EB' },
  { name: '橘色', value: '#FF9F43' },
  { name: '粉色', value: '#FDA7DF' },
  { name: '青色', value: '#38D9A9' },
];
