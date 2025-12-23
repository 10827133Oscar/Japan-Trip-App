/**
 * 網頁版專用的 Trip 服務
 * 使用 REST API 替代 Firestore SDK
 */

import { getDocument, setDocument, queryDocuments, deleteDocument } from './webFirebase';
import { Trip, Participant } from '../types';
import { getLocalUser } from './localUser';

/**
 * 將 REST API 返回的資料轉換為 Trip 物件
 */
const convertToTrip = (data: any, docId: string): Trip => {
  const participants = data.participants || [];

  // 處理日期轉換
  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  };

  // 檢查是否缺少重要欄位
  const missingFields = [];
  if (!data.name) missingFields.push('name');
  if (!data.destination) missingFields.push('destination');
  if (!data.password) missingFields.push('password');
  if (!data.creatorDeviceId) missingFields.push('creatorDeviceId');
  
  if (missingFields.length > 0) {
    console.warn(`⚠️ 計畫 ${docId} 缺少欄位:`, missingFields);
    console.warn('⚠️ 這可能是舊版本的資料，建議重新創建計畫');
  }

  const trip: Trip = {
    id: docId,
    name: data.name || '(未命名計畫)',
    destination: data.destination || '(未設定目的地)',
    password: data.password || '',
    startDate: parseDate(data.startDate),
    endDate: parseDate(data.endDate),
    createdAt: parseDate(data.createdAt),
    creatorDeviceId: data.creatorDeviceId || '',
    participants: participants.map((p: any) => ({
      deviceId: p.deviceId || '',
      nickname: p.nickname || '',
      color: p.color || '#007AFF',
      joinedAt: parseDate(p.joinedAt),
    })),
    participantDeviceIds: data.participantDeviceIds || [],
  };

  return trip;
};

/**
 * 創建計畫（帶密碼）
 */
export const createTripWithPassword = async (
  name: string,
  destination: string,
  password: string,
  tripId: string
): Promise<Trip> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  // 檢查 ID 是否已存在
  const existingDoc = await getDocument('trips', tripId);
  if (existingDoc) {
    throw new Error('此計畫 ID 已被使用，請換一個（例如：japan2024）');
  }

  const participant: Participant = {
    deviceId: localUser.deviceId,
    nickname: localUser.nickname,
    color: localUser.color,
    joinedAt: new Date(),
  };

  const newTrip = {
    name,
    destination,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
    password: password, // 明文存儲
    creatorDeviceId: localUser.deviceId,
    participants: [participant],
    participantDeviceIds: [localUser.deviceId],
    createdAt: new Date(),
  };

  await setDocument('trips', tripId, newTrip);

  return {
    id: tripId,
    ...newTrip,
  };
};

/**
 * 加入計畫（驗證密碼）
 */
export const joinTripWithPassword = async (
  tripId: string,
  password: string
): Promise<Trip> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  // 獲取計畫
  const tripData = await getDocument('trips', tripId);
  if (!tripData) {
    throw new Error('計畫不存在');
  }

  const trip = convertToTrip(tripData, tripId);

  // 驗證密碼
  if (password !== trip.password) {
    throw new Error('密碼錯誤');
  }

  // 檢查是否已加入
  const alreadyJoined = trip.participants.some(
    (p) => p.deviceId === localUser.deviceId
  );

  if (alreadyJoined) {
    throw new Error('您已經加入此計畫');
  }

  // 添加參與者
  const newParticipant: Participant = {
    deviceId: localUser.deviceId,
    nickname: localUser.nickname,
    color: localUser.color,
    joinedAt: new Date(),
  };

  const updatedParticipants = [
    ...trip.participants,
    newParticipant,
  ];

  const updatedDeviceIds = [
    ...(trip.participantDeviceIds || []),
    localUser.deviceId,
  ];

  // 更新 Firestore - 保留所有現有欄位，只更新參與者相關欄位
  // 先讀取完整資料，確保保留所有欄位
  const fullTripData = await getDocument('trips', tripId);
  if (!fullTripData) {
    throw new Error('計畫不存在');
  }

  // 合併更新：保留所有現有欄位，只更新參與者相關欄位
  await setDocument('trips', tripId, {
    ...fullTripData, // 保留所有現有欄位
    participants: updatedParticipants,
    participantDeviceIds: updatedDeviceIds,
  });

  return {
    ...trip,
    participants: updatedParticipants,
    participantDeviceIds: updatedDeviceIds,
  };
};

/**
 * 獲取用戶的所有計畫
 * 注意：REST API 的查詢功能有限，這裡使用簡化版本
 */
export const getUserTrips = async (deviceId: string): Promise<Trip[]> => {
  try {
    // 使用 REST API 查詢包含此 deviceId 的計畫
    const results = await queryDocuments('trips', 'participantDeviceIds', 'array-contains', deviceId);
    
    return results.map((doc: any) => convertToTrip(doc, doc.id || doc.name?.split('/').pop() || ''));
  } catch (error: any) {
    console.error('獲取用戶計畫失敗:', error);
    // 如果查詢失敗，返回空陣列
    return [];
  }
};

/**
 * 獲取單個計畫
 */
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  try {
    const tripData = await getDocument('trips', tripId);
    if (!tripData) {
      return null;
    }
    return convertToTrip(tripData, tripId);
  } catch (error) {
    console.error('獲取計畫失敗:', error);
    return null;
  }
};

/**
 * 退出計畫
 */
export const leaveTrip = async (tripId: string): Promise<void> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  // 先讀取完整資料，確保保留所有欄位
  const fullTripData = await getDocument('trips', tripId);
  if (!fullTripData) {
    throw new Error('計畫不存在');
  }

  const trip = convertToTrip(fullTripData, tripId);

  // 移除參與者
  const updatedParticipants = trip.participants.filter(
    (p) => p.deviceId !== localUser.deviceId
  );

  const updatedDeviceIds = (trip.participantDeviceIds || []).filter(
    (id) => id !== localUser.deviceId
  );

  // 如果沒有參與者了，刪除計畫
  if (updatedParticipants.length === 0) {
    await deleteDocument('trips', tripId);
    return;
  }

  // 更新 Firestore - 保留所有現有欄位，只更新參與者相關欄位
  await setDocument('trips', tripId, {
    ...fullTripData, // 保留所有現有欄位
    participants: updatedParticipants,
    participantDeviceIds: updatedDeviceIds,
  });
};

/**
 * 即時監聽用戶的所有計畫
 * 注意：REST API 不支援即時監聽，這裡使用輪詢
 */
export const subscribeToUserTrips = (
  callback: (trips: Trip[]) => void
): (() => void) => {
  let isActive = true;
  let intervalId: NodeJS.Timeout | null = null;

  const fetchTrips = async () => {
    if (!isActive) return;
    
    try {
      const localUser = await getLocalUser();
      if (!localUser) {
        callback([]);
        return;
      }

      const trips = await getUserTrips(localUser.deviceId);
      if (isActive) {
        // 按創建時間排序
        const sortedTrips = trips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        callback(sortedTrips);
      }
    } catch (error) {
      console.error('獲取計畫列表失敗:', error);
      if (isActive) {
        callback([]);
      }
    }
  };

  // 立即獲取一次
  fetchTrips();

  // 每 3 秒輪詢一次
  intervalId = setInterval(fetchTrips, 3000);

  // 返回取消函數
  return () => {
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

