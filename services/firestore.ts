import { Platform } from 'react-native';
import { Trip, Place, Itinerary, User } from '../types';

// 根據平台動態導入
let placeServiceModule: any;

if (Platform.OS === 'web') {
  // 網頁版：使用 REST API
  placeServiceModule = require('./webPlaceService');
} else {
  // 原生版：使用 Firestore SDK
  const {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
    arrayUnion,
    arrayRemove,
  } = require('firebase/firestore');
  const { db } = require('./firebase');

  // ========== 景點管理 ==========

  // 新增景點
  const createPlace = async (place: Omit<Place, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'places'), {
        ...place,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('新增景點錯誤:', error);
      throw error;
    }
  };

  // 更新景點
  const updatePlace = async (placeId: string, data: Partial<Place>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'places', placeId), data);
    } catch (error) {
      console.error('更新景點錯誤:', error);
      throw error;
    }
  };

  // 刪除景點
  const deletePlace = async (placeId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'places', placeId));
    } catch (error) {
      console.error('刪除景點錯誤:', error);
      throw error;
    }
  };

  // 獲取旅程的所有景點
  const getTripPlaces = async (tripId: string): Promise<Place[]> => {
    try {
      const q = query(
        collection(db, 'places'),
        where('tripId', '==', tripId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        visitDate: doc.data().visitDate ? doc.data().visitDate.toDate() : undefined,
      } as Place));
    } catch (error) {
      console.error('獲取景點列表錯誤:', error);
      throw error;
    }
  };

  // 即時監聽景點變化（多人協作核心功能）
  const subscribeToPlaces = (
    tripId: string,
    callback: (places: Place[]) => void
  ): (() => void) => {
    const q = query(
      collection(db, 'places'),
      where('tripId', '==', tripId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const places = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          visitDate: doc.data().visitDate ? doc.data().visitDate.toDate() : undefined,
        } as Place));
        callback(places);
      },
      (error) => {
        // 處理離線錯誤
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.warn('⚠️ 離線狀態，使用快取資料');
          // onSnapshot 會自動使用快取，所以這裡只是記錄警告
        } else {
          console.error('監聽景點變化錯誤:', error);
        }
      }
    );
  };

  placeServiceModule = {
    createPlace,
    updatePlace,
    deletePlace,
    getTripPlaces,
    subscribeToPlaces,
  };
}

// 重新導出景點相關函數
export const createPlace = placeServiceModule.createPlace;
export const updatePlace = placeServiceModule.updatePlace;
export const deletePlace = placeServiceModule.deletePlace;
export const getTripPlaces = placeServiceModule.getTripPlaces;
export const subscribeToPlaces = placeServiceModule.subscribeToPlaces;

// 注意：以下函數只在原生 App 中使用，網頁版不使用
// 如果需要網頁版支援，需要創建對應的 REST API 實現
if (Platform.OS !== 'web') {
  const {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    arrayUnion,
    arrayRemove,
  } = require('firebase/firestore');
  const { db } = require('./firebase');

  // ========== 行程管理 ==========
  module.exports.createItinerary = async (
    itinerary: Omit<Itinerary, 'id'>
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'itineraries'), itinerary);
      return docRef.id;
    } catch (error) {
      console.error('創建行程錯誤:', error);
      throw error;
    }
  };

  module.exports.updateItinerary = async (
    itineraryId: string,
    data: Partial<Itinerary>
  ): Promise<void> => {
    try {
      await updateDoc(doc(db, 'itineraries', itineraryId), data);
    } catch (error) {
      console.error('更新行程錯誤:', error);
      throw error;
    }
  };

  module.exports.getTripItineraries = async (tripId: string): Promise<Itinerary[]> => {
    try {
      const q = query(
        collection(db, 'itineraries'),
        where('tripId', '==', tripId),
        orderBy('dayNumber', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      } as Itinerary));
    } catch (error) {
      console.error('獲取行程列表錯誤:', error);
      throw error;
    }
  };

  // ========== 成員管理 ==========
  module.exports.getUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const userDoc = snapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data(),
        createdAt: userDoc.data().createdAt.toDate(),
      } as User;
    } catch (error) {
      console.error('查找用戶錯誤:', error);
      throw error;
    }
  };

  module.exports.addMemberToTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        members: arrayUnion(userId),
      });
    } catch (error) {
      console.error('添加成員錯誤:', error);
      throw error;
    }
  };

  module.exports.removeMemberFromTrip = async (tripId: string, userId: string): Promise<void> => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        members: arrayRemove(userId),
      });
    } catch (error) {
      console.error('移除成員錯誤:', error);
      throw error;
    }
  };

  module.exports.getTripMembers = async (memberIds: string[]): Promise<User[]> => {
    try {
      if (memberIds.length === 0) return [];

      const members: User[] = [];

      for (let i = 0; i < memberIds.length; i += 10) {
        const batch = memberIds.slice(i, i + 10);
        const q = query(collection(db, 'users'), where('__name__', 'in', batch));
        const snapshot = await getDocs(q);

        snapshot.docs.forEach((doc) => {
          members.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
          } as User);
        });
      }

      return members;
    } catch (error) {
      console.error('獲取成員資料錯誤:', error);
      throw error;
    }
  };

  module.exports.isTripMember = async (tripId: string, userId: string): Promise<boolean> => {
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (!tripDoc.exists()) return false;

      const tripData = tripDoc.data() as Trip;
      return tripData.members.includes(userId);
    } catch (error) {
      console.error('檢查成員權限錯誤:', error);
      return false;
    }
  };
}
