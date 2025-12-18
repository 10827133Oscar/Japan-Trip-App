import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
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
  password: string,
  tripId: string // 新增：傳入自定義 ID
): Promise<Trip> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('請先設定暱稱');
  }

  // 檢查 ID 是否已存在
  const tripDoc = await getDoc(doc(db, 'trips', tripId));
  if (tripDoc.exists()) {
    throw new Error('此計畫 ID 已被使用，請換一個（例如：japan2024）');
  }

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

// 即時監聽用戶的所有計畫
export const subscribeToUserTrips = (
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

    unsubscribe = onSnapshot(q, (snapshot) => {
      const userTrips: Trip[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const participants = data.participants || [];

        return {
          id: doc.id,
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
      });

      // 按創建時間排序
      callback(userTrips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, (error) => {
      console.error('監聽計畫列表失敗:', error);
    });
  };

  setup();

  return () => {
    if (unsubscribe) unsubscribe();
  };
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

// 退出計畫
export const leaveTrip = async (tripId: string): Promise<void> => {
  const localUser = await getLocalUser();
  if (!localUser) {
    throw new Error('用戶未登錄');
  }

  const tripDocRef = doc(db, 'trips', tripId);
  const tripDoc = await getDoc(tripDocRef);

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
