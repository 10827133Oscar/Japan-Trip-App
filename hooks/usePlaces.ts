import { useState, useEffect } from 'react';
import { Place } from '../types';
import {
  createPlace as createPlaceService,
  updatePlace as updatePlaceService,
  deletePlace as deletePlaceService,
  subscribeToPlaces,
} from '../services/firestore';

export const usePlaces = (tripId: string | null) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 即時監聽景點變化
  useEffect(() => {
    if (!tripId) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToPlaces(tripId, (updatedPlaces) => {
      setPlaces(updatedPlaces);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  // 新增景點
  const createPlace = async (place: Omit<Place, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const placeId = await createPlaceService(place);
      return placeId;
    } catch (err) {
      setError('新增景點失敗');
      console.error(err);
      throw err;
    }
  };

  // 更新景點
  const updatePlace = async (placeId: string, data: Partial<Place>) => {
    try {
      setError(null);
      await updatePlaceService(placeId, data);
    } catch (err) {
      setError('更新景點失敗');
      console.error(err);
      throw err;
    }
  };

  // 刪除景點
  const deletePlace = async (placeId: string) => {
    try {
      setError(null);
      await deletePlaceService(placeId);
    } catch (err) {
      setError('刪除景點失敗');
      console.error(err);
      throw err;
    }
  };

  // 按天數篩選景點
  const getPlacesByDay = (dayNumber: number): Place[] => {
    return places.filter(place => place.dayNumber === dayNumber);
  };

  // 按日期排序的景點
  const sortedPlaces = [...places].sort((a, b) => {
    if (a.dayNumber !== b.dayNumber) {
      return (a.dayNumber || 0) - (b.dayNumber || 0);
    }
    return (a.order || 0) - (b.order || 0);
  });

  return {
    places,
    sortedPlaces,
    loading,
    error,
    createPlace,
    updatePlace,
    deletePlace,
    getPlacesByDay,
  };
};
