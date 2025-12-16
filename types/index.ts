// 本地用戶類型（已棄用，改用 localUser.ts）
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

// 參與者類型
export interface Participant {
  deviceId: string;    // 裝置 ID
  nickname: string;    // 暱稱
  color: string;       // 顏色
  joinedAt: Date;      // 加入時間
}

// 旅程類型
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  password: string;              // 計畫密碼（已加密）
  creatorDeviceId: string;       // 建立者裝置 ID
  participants: Participant[];   // 參與者列表
  participantDeviceIds: string[]; // 參與者裝置 ID 列表（用於查詢）
  createdAt: Date;
}

// 景點位置類型
export interface Location {
  latitude: number;
  longitude: number;
}

// 景點類型
export interface Place {
  id: string;
  tripId: string;
  name: string;
  address: string;
  location: Location;
  category?: string;
  notes?: string;
  photos?: string[];
  visitDate?: Date;
  dayNumber?: number;
  order?: number;
  addedBy: string;
  createdAt: Date;
}

// 每日行程類型
export interface Itinerary {
  id: string;
  tripId: string;
  date: Date;
  dayNumber: number;
  placeIds: string[];
  routePolyline?: string;
}

// 認證狀態類型
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
