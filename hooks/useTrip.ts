import { useState, useEffect } from 'react';
import { Trip } from '../types';
import {
  createTripWithPassword,
  joinTripWithPassword,
  getUserTripsNew,
} from '../services/tripService';

export const useTrip = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入用戶的計畫
  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const userTrips = await getUserTripsNew();
      setTrips(userTrips);

      // 如果有計畫，默認選擇第一個
      if (userTrips.length > 0 && !currentTrip) {
        setCurrentTrip(userTrips[0]);
      }
    } catch (err) {
      setError('載入計畫失敗');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 創建新計畫（帶密碼）
  const createTrip = async (
    name: string,
    destination: string,
    password: string
  ): Promise<Trip> => {
    try {
      setError(null);
      const newTrip = await createTripWithPassword(name, destination, password);
      await loadTrips(); // 重新載入計畫列表
      setCurrentTrip(newTrip); // 自動選擇新創建的計畫
      return newTrip;
    } catch (err: any) {
      const errorMsg = err?.message || '創建計畫失敗';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    }
  };

  // 加入計畫（驗證密碼）
  const joinTrip = async (tripId: string, password: string): Promise<Trip> => {
    try {
      setError(null);
      const trip = await joinTripWithPassword(tripId, password);
      await loadTrips(); // 重新載入計畫列表
      setCurrentTrip(trip); // 自動選擇加入的計畫
      return trip;
    } catch (err: any) {
      const errorMsg = err?.message || '加入計畫失敗';
      setError(errorMsg);
      console.error(err);
      throw new Error(errorMsg);
    }
  };

  // 選擇當前計畫
  const selectTrip = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  return {
    trips,
    currentTrip,
    loading,
    error,
    createTrip,
    joinTrip,
    selectTrip,
    refreshTrips: loadTrips,
  };
};
