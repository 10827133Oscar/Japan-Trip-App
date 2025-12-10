import { useState, useEffect } from 'react';
import { Trip } from '../types';
import { createTrip as createTripService, getUserTrips } from '../services/firestore';

export const useTrip = (userId: string | null) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 載入用戶的旅程
  useEffect(() => {
    if (!userId) {
      setTrips([]);
      setCurrentTrip(null);
      setLoading(false);
      return;
    }

    loadTrips();
  }, [userId]);

  const loadTrips = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const userTrips = await getUserTrips(userId);
      setTrips(userTrips);

      // 如果有旅程，默認選擇第一個
      if (userTrips.length > 0 && !currentTrip) {
        setCurrentTrip(userTrips[0]);
      }
    } catch (err) {
      setError('載入旅程失敗');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 創建新旅程
  const createTrip = async (trip: Omit<Trip, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const tripId = await createTripService(trip);
      await loadTrips(); // 重新載入旅程列表
      return tripId;
    } catch (err) {
      setError('創建旅程失敗');
      console.error(err);
      throw err;
    }
  };

  // 選擇當前旅程
  const selectTrip = (trip: Trip) => {
    setCurrentTrip(trip);
  };

  return {
    trips,
    currentTrip,
    loading,
    error,
    createTrip,
    selectTrip,
    refreshTrips: loadTrips,
  };
};
