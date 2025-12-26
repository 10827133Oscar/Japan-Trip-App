import { Location } from '../types';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// 地理編碼（地址轉座標）
export const geocodeAddress = async (address: string): Promise<Location | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&language=zh-TW`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error('地理編碼錯誤:', error);
    return null;
  }
};

// 反向地理編碼（座標轉地址）
export const reverseGeocode = async (location: Location): Promise<string | null> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=zh-TW`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error('反向地理編碼錯誤:', error);
    return null;
  }
};
