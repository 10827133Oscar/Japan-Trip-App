import {
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
} from 'firebase/firestore';
import { db } from './firebase';
import { Trip, Place, Itinerary, User } from '../types';

// ========== 旅程管理 ==========

// 創建旅程
export const createTrip = async (trip: Omit<Trip, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...trip,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('創建旅程錯誤:', error);
    throw error;
  }
};

// 獲取用戶的旅程列表
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    } as Trip));
  } catch (error) {
    console.error('獲取旅程列表錯誤:', error);
    throw error;
  }
};

// ========== 景點管理 ==========

// 新增景點
export const createPlace = async (place: Omit<Place, 'id' | 'createdAt'>): Promise<string> => {
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
export const updatePlace = async (placeId: string, data: Partial<Place>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'places', placeId), data);
  } catch (error) {
    console.error('更新景點錯誤:', error);
    throw error;
  }
};

// 刪除景點
export const deletePlace = async (placeId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'places', placeId));
  } catch (error) {
    console.error('刪除景點錯誤:', error);
    throw error;
  }
};

// 獲取旅程的所有景點
export const getTripPlaces = async (tripId: string): Promise<Place[]> => {
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
export const subscribeToPlaces = (
  tripId: string,
  callback: (places: Place[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'places'),
    where('tripId', '==', tripId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const places = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      visitDate: doc.data().visitDate ? doc.data().visitDate.toDate() : undefined,
    } as Place));
    callback(places);
  });
};

// ========== 行程管理 ==========

// 創建每日行程
export const createItinerary = async (
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

// 更新每日行程
export const updateItinerary = async (
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

// 獲取旅程的所有行程
export const getTripItineraries = async (tripId: string): Promise<Itinerary[]> => {
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

// 通過email查找用戶
export const getUserByEmail = async (email: string): Promise<User | null> => {
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

// 邀請成員加入旅程
export const addMemberToTrip = async (tripId: string, userId: string): Promise<void> => {
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

// 從旅程中移除成員
export const removeMemberFromTrip = async (tripId: string, userId: string): Promise<void> => {
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

// 獲取旅程所有成員的資料
export const getTripMembers = async (memberIds: string[]): Promise<User[]> => {
  try {
    if (memberIds.length === 0) return [];

    const members: User[] = [];

    // Firestore 的 'in' 查詢最多支持 10 個值，所以需要分批查詢
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

// 檢查用戶是否為旅程成員
export const isTripMember = async (tripId: string, userId: string): Promise<boolean> => {
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
