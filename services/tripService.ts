import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Trip, Participant } from '../types';
import { getLocalUser } from './localUser';
import { hashPassword, verifyPassword, generateTripId } from './password';

// 創建計畫（帶密碼）
export const createTripWithPassword = async (
  name: string,
  destination: string,
  password: string
): Promise<Trip> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  const tripId = generateTripId();
  const hashedPassword = hashPassword(password);

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
    password: hashedPassword,
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
export const joinTripWithPassword = async (
  tripId: string,
  password: string
): Promise<Trip> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  // 獲取計畫
  const tripDoc = await getDoc(doc(db, 'trips', tripId));
  if (!tripDoc.exists()) {
    throw new Error('計畫不存在');
  }

  const tripData = tripDoc.data();

  // 轉換日期
  const trip: Trip = {
    id: tripDoc.id,
    ...tripData,
    startDate: tripData.startDate.toDate(),
    endDate: tripData.endDate.toDate(),
    createdAt: tripData.createdAt.toDate(),
    participants: tripData.participants.map((p: any) => ({
      ...p,
      joinedAt: p.joinedAt.toDate(),
    })),
  } as Trip;

  // 驗證密碼
  if (!verifyPassword(password, trip.password)) {
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

// 獲取用戶參與的所有計畫
export const getUserTripsNew = async (): Promise<Trip[]> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    return [];
  }

  try {
    // 獲取用戶參與的計畫
    const tripsRef = collection(db, 'trips');
    const q = query(
      tripsRef,
      where('participantDeviceIds', 'array-contains', localUser.deviceId)
    );

    const snapshot = await getDocs(q);

    const userTrips: Trip[] = snapshot.docs.map(doc => {
      const data = doc.data();
      const participants = data.participants || [];

      return {
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
        createdAt: data.createdAt.toDate(),
        participants: participants.map((p: any) => ({
          ...p,
          joinedAt: p.joinedAt.toDate(),
        })),
        participantDeviceIds: data.participantDeviceIds || [],
      } as Trip;
    });

    // 按創建時間排序
    return userTrips.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch (error) {
    console.error('獲取計畫列表錯誤:', error);
    throw error;
  }
};

// 獲取單個計畫
export const getTripById = async (tripId: string): Promise<Trip | null> => {
  try {
    const tripDoc = await getDoc(doc(db, 'trips', tripId));
    if (!tripDoc.exists()) {
      return null;
    }

    const data = tripDoc.data();
    return {
      id: tripDoc.id,
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      participants: data.participants.map((p: any) => ({
        ...p,
        joinedAt: p.joinedAt.toDate(),
      })),
    } as Trip;
  } catch (error) {
    console.error('獲取計畫錯誤:', error);
    throw error;
  }
};
