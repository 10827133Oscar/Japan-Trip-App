// 用戶類型
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

// 旅程類型
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  members: string[]; // 用戶ID列表
  createdBy: string;
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
