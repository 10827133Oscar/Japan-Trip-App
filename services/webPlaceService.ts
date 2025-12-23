/**
 * 網頁版專用的景點服務
 * 使用 REST API 替代 Firestore SDK
 */

import { getDocument, setDocument, queryDocuments, deleteDocument } from './webFirebase';
import { Place } from '../types';
import { getLocalUser } from './localUser';

/**
 * 將 REST API 返回的資料轉換為 Place 物件
 */
const convertToPlace = (data: any, docId: string): Place => {
  const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  };

  return {
    id: docId,
    tripId: data.tripId || '',
    name: data.name || '',
    address: data.address || '',
    location: data.location || { latitude: 0, longitude: 0 },
    category: data.category,
    notes: data.notes,
    photos: data.photos || [],
    visitDate: data.visitDate ? parseDate(data.visitDate) : undefined,
    dayNumber: data.dayNumber,
    order: data.order,
    addedBy: data.addedBy || '',
    createdAt: parseDate(data.createdAt),
  };
};

/**
 * 新增景點
 */
export const createPlace = async (place: Omit<Place, 'id' | 'createdAt'>): Promise<string> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  // 生成隨機 ID
  const placeId = `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const placeData = {
    ...place,
    addedBy: place.addedBy || localUser.deviceId,
    createdAt: new Date(),
  };

  await setDocument('places', placeId, placeData);
  return placeId;
};

/**
 * 更新景點
 */
export const updatePlace = async (placeId: string, data: Partial<Place>): Promise<void> => {
  // 先讀取完整資料，確保保留所有欄位
  const fullPlaceData = await getDocument('places', placeId);
  if (!fullPlaceData) {
    throw new Error('景點不存在');
  }

  // 合併更新
  await setDocument('places', placeId, {
    ...fullPlaceData,
    ...data,
  });
};

/**
 * 刪除景點
 */
export const deletePlace = async (placeId: string): Promise<void> => {
  await deleteDocument('places', placeId);
};

/**
 * 獲取旅程的所有景點
 */
export const getTripPlaces = async (tripId: string): Promise<Place[]> => {
  try {
    const results = await queryDocuments('places', 'tripId', '==', tripId);
    
    const places: Place[] = [];
    for (const result of results) {
      // result 已經包含 id 和轉換後的資料
      const place = convertToPlace(result, result.id || '');
      places.push(place);
    }

    // 按創建時間排序（降序）
    places.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return places;
  } catch (error) {
    console.error('獲取景點列表錯誤:', error);
    throw error;
  }
};

/**
 * 即時監聽景點變化（使用輪詢模擬）
 */
export const subscribeToPlaces = (
  tripId: string,
  callback: (places: Place[]) => void
): (() => void) => {
  let isActive = true;
  let lastPlaces: Place[] | null = null; // 初始為 null，確保第一次總是觸發

  const poll = async () => {
    if (!isActive) return;

    try {
      const places = await getTripPlaces(tripId);

      // 第一次執行或資料變化時調用 callback
      const placesChanged = lastPlaces === null || JSON.stringify(places) !== JSON.stringify(lastPlaces);
      if (placesChanged) {
        lastPlaces = places;
        callback(places);
      }
    } catch (error) {
      console.error('輪詢景點錯誤:', error);
      // 即使出錯也要調用 callback，避免永遠 loading
      if (lastPlaces === null) {
        callback([]);
        lastPlaces = [];
      }
    }

    // 每 2 秒輪詢一次
    if (isActive) {
      setTimeout(poll, 2000);
    }
  };

  // 立即執行一次
  poll();

  // 返回取消訂閱函數
  return () => {
    isActive = false;
  };
};

