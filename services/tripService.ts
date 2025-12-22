/**
 * Trip Service - 根據平台自動選擇實作
 * - 網頁版：使用 REST API (webTripService.ts)
 * - 原生版：使用 Firestore SDK (原生實作)
 */

import { Platform } from 'react-native';
import type { Trip, Participant } from '../types';

// 根據平台動態導入
if (Platform.OS === 'web') {
  // 網頁版：使用 REST API
  const webTripService = require('./webTripService');
  module.exports = webTripService;
} else {
  // 原生版：使用 Firestore SDK（原有實作）
  const {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocFromCache,
    getDocs,
    deleteDoc,
    query,
    where,
    onSnapshot,
    Timestamp,
  } = require('firebase/firestore');
  const { db } = require('./firebase');
  const { getLocalUser } = require('./localUser');
  const { hashPassword, verifyPassword, generateTripId } = require('./password');

  // 工具函式：將 Firestore 文件轉換為 Trip 物件
  const convertFirestoreDocToTrip = (docId: string, data: any): Trip => {
    const participants = data.participants || [];

    return {
      id: docId,
      ...data,
      startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(),
      endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      participants: participants.map((p: any) => ({
        ...p,
        joinedAt: p.joinedAt?.toDate ? p.joinedAt.toDate() : new Date(),
      })),
      participantDeviceIds: data.participantDeviceIds || [],
    } as Trip;
  };

  // 創建計畫（帶密碼）
  const createTripWithPassword = async (
    name: string,
    destination: string,
    password: string,
    tripId: string
  ): Promise<Trip> => {
    const localUser = await getLocalUser();
    if (!localUser) {
      throw new Error('請先設定暱稱');
    }

    // 檢查 ID 是否已存在（允許從快取讀取）
    let tripDoc;
    try {
      tripDoc = await getDoc(doc(db, 'trips', tripId));
    } catch (error: any) {
      // 如果離線，嘗試從快取讀取
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        try {
          tripDoc = await getDocFromCache(doc(db, 'trips', tripId));
        } catch (cacheError) {
          // 快取也沒有，假設不存在，繼續創建
          console.warn('⚠️ 無法檢查計畫 ID，假設不存在:', cacheError);
          tripDoc = { exists: () => false } as any;
        }
      } else {
        throw error;
      }
    }
    if (tripDoc.exists()) {
      throw new Error('此計畫 ID 已被使用，請換一個（例如：japan2024）');
    }

    // 直接存儲密碼（應使用者要求，方便查看）
    const storedPassword = password;

    const participant: Participant = {
      deviceId: localUser.deviceId,
      nickname: localUser.nickname,
      color: localUser.color,
      joinedAt: new Date(),
    };

    const newTrip: Omit<Trip, 'id'> = {
      name,
      destination,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
      password: storedPassword,
      creatorDeviceId: localUser.deviceId,
      participants: [participant],
      participantDeviceIds: [localUser.deviceId],
      createdAt: new Date(),
    };

    // 使用自定義 ID
    await setDoc(doc(db, 'trips', tripId), {
      ...newTrip,
      startDate: Timestamp.fromDate(newTrip.startDate),
      endDate: Timestamp.fromDate(newTrip.endDate),
      createdAt: Timestamp.fromDate(newTrip.createdAt),
      participants: newTrip.participants.map(p => ({
        ...p,
        joinedAt: Timestamp.fromDate(p.joinedAt),
      })),
    });

    return {
      id: tripId,
      ...newTrip,
    };
  };

  // 加入計畫（驗證密碼）
  const joinTripWithPassword = async (
    tripId: string,
    password: string
  ): Promise<Trip> => {
    const localUser = await getLocalUser();
    if (!localUser) {
      throw new Error('請先設定暱稱');
    }

    // 獲取計畫（允許從快取讀取）
    let tripDoc;
    try {
      tripDoc = await getDoc(doc(db, 'trips', tripId));
    } catch (error: any) {
      // 如果離線，嘗試從快取讀取
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        try {
          tripDoc = await getDocFromCache(doc(db, 'trips', tripId));
        } catch (cacheError) {
          throw new Error('無法連接到網路，且快取中沒有此計畫資料。請檢查網路連接後重試。');
        }
      } else {
        throw error;
      }
    }
    if (!tripDoc.exists()) {
      throw new Error('計畫不存在');
    }

    const tripData = tripDoc.data();

    // 使用工具函式轉換資料
    const trip = convertFirestoreDocToTrip(tripDoc.id, tripData);

    // 驗證密碼（改為直接比對，配合明文存儲）
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

    // 更新 Firestore
    await setDoc(
      doc(db, 'trips', tripId),
      {
        participants: updatedParticipants.map(p => ({
          ...p,
          joinedAt: Timestamp.fromDate(p.joinedAt),
        })),
        participantDeviceIds: updatedDeviceIds,
      },
      { merge: true }
    );

    return {
      ...trip,
      participants: updatedParticipants,
      participantDeviceIds: updatedDeviceIds,
    };
  };

  // 即時監聽用戶的所有計畫
  const subscribeToUserTrips = (
    callback: (trips: Trip[]) => void
  ): (() => void) => {
    let unsubscribe: (() => void) | null = null;

    // 需要非同步獲取用戶 ID
    const setup = async () => {
      const localUser = await getLocalUser();
      if (!localUser) {
        callback([]);
        return;
      }

      const tripsRef = collection(db, 'trips');
      const q = query(
        tripsRef,
        where('participantDeviceIds', 'array-contains', localUser.deviceId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const userTrips: Trip[] = snapshot.docs.map(doc =>
            convertFirestoreDocToTrip(doc.id, doc.data())
          );

          // 按創建時間排序
          callback(userTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        },
        (error) => {
          // 處理離線錯誤
          if (error.code === 'unavailable' || error.message?.includes('offline')) {
            console.warn('⚠️ 離線狀態，使用快取資料');
            // onSnapshot 會自動使用快取，所以這裡只是記錄警告
          } else {
            console.error('監聽計畫列表失敗:', error);
          }
        }
      );
    };

    setup();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  };

  // 獲取單個計畫
  const getTripById = async (tripId: string): Promise<Trip | null> => {
    try {
      let tripDoc;
      try {
        tripDoc = await getDoc(doc(db, 'trips', tripId));
      } catch (error: any) {
        // 如果離線，嘗試從快取讀取
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          try {
            tripDoc = await getDocFromCache(doc(db, 'trips', tripId));
          } catch (cacheError) {
            console.warn('⚠️ 無法從快取讀取計畫:', cacheError);
            return null;
          }
        } else {
          throw error;
        }
      }
      
      if (!tripDoc.exists()) {
        return null;
      }

      return convertFirestoreDocToTrip(tripDoc.id, tripDoc.data());
    } catch (error) {
      console.error('獲取計畫錯誤:', error);
      throw error;
    }
  };

  // 退出計畫
  const leaveTrip = async (tripId: string): Promise<void> => {
    const localUser = await getLocalUser();
    if (!localUser) {
      throw new Error('用戶未登錄');
    }

    const tripDocRef = doc(db, 'trips', tripId);
    // 獲取計畫（允許從快取讀取）
    let tripDoc;
    try {
      tripDoc = await getDoc(tripDocRef);
    } catch (error: any) {
      // 如果離線，嘗試從快取讀取
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        try {
          tripDoc = await getDocFromCache(tripDocRef);
        } catch (cacheError) {
          throw new Error('無法連接到網路，且快取中沒有此計畫資料。請檢查網路連接後重試。');
        }
      } else {
        throw error;
      }
    }

    if (!tripDoc.exists()) {
      throw new Error('計畫不存在');
    }

    const tripData = tripDoc.data();
    const participants = tripData.participants || [];
    const participantDeviceIds = tripData.participantDeviceIds || [];

    // 過濾掉當前用戶
    const updatedParticipants = participants.filter(
      (p: any) => p.deviceId !== localUser.deviceId
    );
    const updatedDeviceIds = participantDeviceIds.filter(
      (id: string) => id !== localUser.deviceId
    );

    // 如果沒有參與者了，刪除計畫
    if (updatedParticipants.length === 0) {
      await deleteDoc(tripDocRef);
    } else {
      await setDoc(
        tripDocRef,
        {
          participants: updatedParticipants,
          participantDeviceIds: updatedDeviceIds,
        },
        { merge: true }
      );
    }
  };

  // 導出所有函數
  module.exports = {
    createTripWithPassword,
    joinTripWithPassword,
    subscribeToUserTrips,
    getTripById,
    leaveTrip,
  };
}
