import { Location } from '../types';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// 路線規劃結果類型
export interface DirectionsResult {
  polyline: string;
  distance: string;
  duration: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
}

// 使用Google Directions API規劃路線
export const getDirections = async (
  origin: Location,
  destination: Location,
  waypoints?: Location[]
): Promise<DirectionsResult | null> => {
  try {
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=zh-TW&mode=walking`;

    // 添加途經點
    if (waypoints && waypoints.length > 0) {
      const waypointsStr = waypoints
        .map(wp => `${wp.latitude},${wp.longitude}`)
        .join('|');
      url += `&waypoints=${waypointsStr}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const leg = route.legs[0];

      return {
        polyline: route.overview_polyline.points,
        distance: leg.distance.text,
        duration: leg.duration.text,
        steps: leg.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance.text,
          duration: step.duration.text,
        })),
      };
    }

    return null;
  } catch (error) {
    console.error('獲取路線錯誤:', error);
    return null;
  }
};

// 解碼Google Polyline（用於在地圖上顯示路線）
export const decodePolyline = (encoded: string): Location[] => {
  const points: Location[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

// 搜尋附近景點（使用Places API）
export const searchNearbyPlaces = async (
  location: Location,
  keyword: string,
  radius: number = 1000
): Promise<any[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_MAPS_API_KEY}&language=zh-TW`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.results;
    }

    return [];
  } catch (error) {
    console.error('搜尋景點錯誤:', error);
    return [];
  }
};

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
