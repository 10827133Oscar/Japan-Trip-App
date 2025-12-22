import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types';
import {
    createTripWithPassword,
    joinTripWithPassword,
    subscribeToUserTrips,
    leaveTrip as leaveTripService,
} from '../services/tripService';

const SELECTED_TRIP_ID_KEY = '@japan_trip_app:selected_trip_id';

interface TripContextType {
    trips: Trip[];
    currentTrip: Trip | null;
    loading: boolean;
    error: string | null;
    createTrip: (name: string, destination: string, password: string, tripId: string) => Promise<Trip>;
    joinTrip: (tripId: string, password: string) => Promise<Trip>;
    leaveTrip: (tripId: string) => Promise<void>;
    selectTrip: (trip: Trip) => Promise<void>;
    refreshTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 初始化選擇
    const initializeSelection = async (planList: Trip[]) => {
        const savedTripId = await AsyncStorage.getItem(SELECTED_TRIP_ID_KEY);
        if (savedTripId) {
            const savedTrip = planList.find(t => t.id === savedTripId);
            if (savedTrip) {
                setCurrentTrip(savedTrip);
            } else if (planList.length > 0) {
                setCurrentTrip(planList[0]);
                await AsyncStorage.setItem(SELECTED_TRIP_ID_KEY, planList[0].id);
            } else {
                setCurrentTrip(null);
            }
        } else if (planList.length > 0) {
            setCurrentTrip(planList[0]);
            await AsyncStorage.setItem(SELECTED_TRIP_ID_KEY, planList[0].id);
        } else {
            setCurrentTrip(null);
        }
    };

    useEffect(() => {
        setLoading(true);
        // 設置超時，避免 loading 狀態持續太久（例如離線時）
        const loadingTimeout = setTimeout(() => {
            console.warn('⚠️ 載入計畫列表超時，可能處於離線狀態');
            setLoading(false);
        }, 10000); // 10 秒超時

        const unsubscribe = subscribeToUserTrips((updatedTrips) => {
            clearTimeout(loadingTimeout);
            setTrips(updatedTrips);
            // 如果還沒有選中任何計畫，或者當前計畫已不在列表中
            if (!currentTrip || !updatedTrips.find(t => t.id === currentTrip.id)) {
                initializeSelection(updatedTrips);
            } else {
                // 更新當前計畫的資料（如果有變動，例如成員名單變了）
                const latestCurrent = updatedTrips.find(t => t.id === currentTrip.id);
                if (latestCurrent) {
                    setCurrentTrip(latestCurrent);
                }
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(loadingTimeout);
            unsubscribe();
        };
    }, [currentTrip?.id]);

    const createTrip = async (name: string, destination: string, password: string, tripId: string) => {
        try {
            setError(null);
            const newTrip = await createTripWithPassword(name, destination, password, tripId);
            // 不需要手動 loadTrips，subscribeToUserTrips 會負責
            setCurrentTrip(newTrip);
            await AsyncStorage.setItem(SELECTED_TRIP_ID_KEY, newTrip.id);
            return newTrip;
        } catch (err: any) {
            const errorMsg = err?.message || '創建計畫失敗';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const joinTrip = async (tripId: string, password: string) => {
        try {
            setError(null);
            const trip = await joinTripWithPassword(tripId, password);
            setCurrentTrip(trip);
            await AsyncStorage.setItem(SELECTED_TRIP_ID_KEY, trip.id);
            return trip;
        } catch (err: any) {
            const errorMsg = err?.message || '加入計畫失敗';
            setError(errorMsg);
            throw new Error(errorMsg);
        }
    };

    const leaveTrip = async (tripId: string) => {
        try {
            setLoading(true);
            setError(null);
            await leaveTripService(tripId);

            const savedTripId = await AsyncStorage.getItem(SELECTED_TRIP_ID_KEY);
            if (savedTripId === tripId) {
                await AsyncStorage.removeItem(SELECTED_TRIP_ID_KEY);
                setCurrentTrip(null);
            }
        } catch (err: any) {
            setError(err?.message || '退出計畫失敗');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const selectTrip = async (trip: Trip) => {
        setCurrentTrip(trip);
        await AsyncStorage.setItem(SELECTED_TRIP_ID_KEY, trip.id);
    };

    const refreshTrips = async () => {
        // 實際上不需要，因為有 subscribe
    };

    return (
        <TripContext.Provider value={{
            trips,
            currentTrip,
            loading,
            error,
            createTrip,
            joinTrip,
            leaveTrip,
            selectTrip,
            refreshTrips,
        }}>
            {children}
        </TripContext.Provider>
    );
}

export function useTripContext() {
    const context = useContext(TripContext);
    if (context === undefined) {
        throw new Error('useTripContext must be used within a TripProvider');
    }
    return context;
}
