# 日本旅遊助手 - 技術文檔

**專案名稱：** Japan Trip App
**版本：** 1.3.0
**最後更新：** 2025-12-26

---

## 📑 目錄

1. [技術棧總覽](#技術棧總覽)
2. [專案架構](#專案架構)
3. [核心技術實現](#核心技術實現)
4. [平台適配策略](#平台適配策略)
5. [資料庫設計](#資料庫設計)
6. [開發環境配置](#開發環境配置)
7. [部署策略](#部署策略)

---

## 技術棧總覽

### 前端框架
- **React Native** `0.81.5` - 跨平台移動應用框架
- **React** `19.1.0` - UI 框架
- **React DOM** `19.1.0` - 網頁版渲染
- **React Native Web** `0.21.0` - React Native 組件轉網頁

### 路由與導航
- **Expo Router** `6.0.17` - 基於檔案系統的路由
- **Expo** `54.0.27` - React Native 開發工具鏈

### 狀態管理
- **React Context API** - 全局狀態管理（用戶、主題）
- **React Hooks** - 本地狀態管理

### 後端服務
- **Firebase** `12.6.0`
  - Firestore - 雲端資料庫
  - REST API - 網頁版資料存取

### 地圖服務
- **react-native-maps** `1.20.1` - 原生地圖（Android/iOS）
- **@react-google-maps/api** `2.20.8` - 網頁版 Google Maps
- **Google Maps API**
  - Maps SDK for Android
  - Maps SDK for iOS
  - Maps JavaScript API

### 本地存儲
- **AsyncStorage** `2.2.0` - 持久化存儲（跨平台）

### UI 組件庫
- **@expo/vector-icons** `15.0.3` - 圖標庫
- **expo-status-bar** `3.0.9` - 狀態欄控制
- **react-native-safe-area-context** `5.6.0` - 安全區域處理
- **react-native-screens** `4.16.0` - 原生屏幕優化

### 功能模組
- **expo-location** `19.0.8` - 定位服務
- **expo-clipboard** `8.0.8` - 剪貼板操作
- **expo-linking** `8.0.10` - Deep Linking
- **expo-constants** `18.0.11` - 環境常數
- **expo-font** `14.0.10` - 自定義字體

### 開發工具
- **TypeScript** `5.9.2` - 靜態類型檢查
- **@types/react** `19.1.10` - React 類型定義

### 部署平台
- **Vercel** - 網頁版部署（免費）
- **GitHub** - 版本控制與 CI/CD

---

## 專案架構

### 目錄結構

```
japan-trip-app/
├── app/                          # 應用程式頁面（Expo Router）
│   ├── (tabs)/                   # Tab 導航頁面
│   │   ├── index.tsx             # 行程列表頁
│   │   ├── places.tsx            # 景點列表頁
│   │   ├── map.tsx               # 地圖頁面
│   │   ├── profile.tsx           # 個人資料頁
│   │   └── _layout.tsx           # Tab 佈局
│   ├── place-detail/             # 動態路由
│   │   └── [id].tsx              # 景點詳情頁
│   ├── login.tsx                 # 登入頁面
│   └── _layout.tsx               # 根佈局
│
├── components/                   # UI 組件
│   ├── modals/                   # 彈窗組件
│   │   ├── CreateTripModal.tsx   # 創建計畫
│   │   ├── JoinTripModal.tsx     # 加入計畫
│   │   ├── TripDetailsModal.tsx  # 計畫詳情
│   │   └── AddPlaceModal.tsx     # 新增景點
│   ├── MapView.tsx               # 原生地圖組件
│   ├── WebMapView.tsx            # 網頁版地圖組件
│   ├── PlaceCard.tsx             # 景點卡片
│   ├── RouteView.tsx             # 路線視圖
│   └── TripMembers.tsx           # 成員列表
│
├── services/                     # 業務邏輯層
│   ├── firebase.ts               # Firebase 初始化
│   ├── firestore.ts              # Firestore 服務（平台適配）
│   ├── tripService.ts            # Trip 服務（平台適配）
│   ├── webFirebase.ts            # 網頁版 REST API
│   ├── webPlaceService.ts        # 網頁版 Place 服務
│   ├── webTripService.ts         # 網頁版 Trip 服務
│   ├── localUser.ts              # 本地用戶管理
│   ├── password.ts               # 密碼加密
│   ├── maps.ts                   # 地圖工具
│   └── weatherService.ts         # 天氣 API
│
├── hooks/                        # 自定義 Hooks
│   ├── useLocalAuth.ts           # 本地認證
│   ├── useTrip.ts                # Trip 狀態管理
│   └── usePlaces.ts              # Place 狀態管理
│
├── context/                      # React Context
│   └── UserContext.tsx           # 用戶全局狀態
│
├── types/                        # TypeScript 類型定義
│   └── index.ts                  # 全局類型
│
├── utils/                        # 工具函數
│   └── alert.ts                  # 跨平台警告對話框
│
├── assets/                       # 靜態資源
│   └── images/                   # 圖片資源
│
├── .env                          # 環境變數（本地）
├── vercel.json                   # Vercel 部署配置
├── tsconfig.json                 # TypeScript 配置
├── package.json                  # 依賴管理
└── README.md                     # 專案說明
```

### 核心模組說明

#### 1. 服務層（Services）

**平台適配服務：**
- `firestore.ts` - 根據 Platform.OS 自動選擇原生或網頁版 Place 服務
- `tripService.ts` - 根據 Platform.OS 自動選擇原生或網頁版 Trip 服務

**原生版服務：**
- 使用 Firestore SDK（`@firebase/firestore`）
- 支援即時監聽（`onSnapshot`）
- 支援離線模式

**網頁版服務：**
- `webFirebase.ts` - Firebase REST API 封裝
- `webPlaceService.ts` - 景點管理（REST API）
- `webTripService.ts` - 計畫管理（REST API）
- 使用輪詢模擬即時更新（2-5 秒）

#### 2. 數據流架構

```
UI 組件
    ↓
自定義 Hooks (useTrip, usePlaces)
    ↓
服務層適配器 (tripService, firestore)
    ↓ (Platform.OS 判斷)
    ├─ 原生版：Firestore SDK
    └─ 網頁版：REST API (webTripService, webPlaceService)
         ↓
    Firebase Backend
```

---

## 核心技術實現

### 1. 跨平台地圖實現

#### 原生版（Android/iOS）
```typescript
// app/(tabs)/map.tsx
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

<MapView
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  region={region}
  onPress={handleMapPress}
>
  {places.map(place => (
    <Marker
      key={place.id}
      coordinate={place.location}
      title={place.name}
    />
  ))}
</MapView>
```

#### 網頁版
```typescript
// components/WebMapView.tsx
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const { isLoaded } = useLoadScript({
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!,
  libraries: LIBRARIES, // 外部化避免重複載入
});

<GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={center}
  zoom={zoom}
  onClick={onMapClick}
>
  {places.map(place => (
    <Marker
      key={place.id}
      position={place.location}
      title={place.name}
    />
  ))}
</GoogleMap>
```

### 2. Firebase REST API 實現

#### 資料格式轉換
```typescript
// services/webFirebase.ts

// Firestore REST API 格式
{
  "fields": {
    "name": { "stringValue": "淺草寺" },
    "latitude": { "doubleValue": 35.7147 },
    "members": { "arrayValue": { "values": [...] } }
  }
}

// 應用程式格式
{
  "name": "淺草寺",
  "latitude": 35.7147,
  "members": [...]
}
```

#### CRUD 操作
```typescript
// 創建文檔（POST）
POST https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/trips?documentId=trip_123

// 更新文檔（PATCH）
PATCH https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/trips/trip_123

// 查詢文檔（runQuery）
POST https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents:runQuery
{
  "structuredQuery": {
    "from": [{ "collectionId": "trips" }],
    "where": {
      "fieldFilter": {
        "field": { "fieldPath": "members" },
        "op": "ARRAY_CONTAINS",
        "value": { "stringValue": "device_123" }
      }
    }
  }
}

// 刪除文檔（DELETE）
DELETE https://firestore.googleapis.com/v1/projects/{projectId}/databases/(default)/documents/trips/trip_123
```

### 3. 即時更新實現

#### 原生版（真正即時）
```typescript
// services/firestore.ts (原生)
import { onSnapshot, collection, query, where } from 'firebase/firestore';

export const subscribeToPlaces = (
  tripId: string,
  callback: (places: Place[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'places'),
    where('tripId', '==', tripId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const places = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(places);
  });

  return unsubscribe;
};
```

#### 網頁版（輪詢模擬）
```typescript
// services/webPlaceService.ts
export const subscribeToPlaces = (
  tripId: string,
  callback: (places: Place[]) => void
): (() => void) => {
  let isActive = true;
  let lastPlaces: Place[] | null = null;

  const poll = async () => {
    if (!isActive) return;

    try {
      const places = await getTripPlaces(tripId);

      // 檢測變化
      if (lastPlaces === null || JSON.stringify(places) !== JSON.stringify(lastPlaces)) {
        lastPlaces = places;
        callback(places);
      }
    } catch (error) {
      console.error('輪詢錯誤:', error);
      if (lastPlaces === null) {
        callback([]);
        lastPlaces = [];
      }
    }

    // 每 2 秒輪詢一次
    if (isActive) {
      setTimeout(poll, 2000);
    }
  };

  poll(); // 立即執行

  return () => { isActive = false; };
};
```

### 4. 跨平台警告對話框

```typescript
// utils/alert.ts
import { Alert as RNAlert, Platform } from 'react-native';

export const Alert = {
  alert: (title, message, buttons) => {
    if (Platform.OS === 'web') {
      // 網頁版使用瀏覽器原生對話框
      if (buttons && buttons.length > 1) {
        const confirmed = window.confirm(`${title}\n\n${message}`);
        if (confirmed) {
          const confirmButton = buttons.find(b => b.style !== 'cancel');
          confirmButton?.onPress?.();
        } else {
          const cancelButton = buttons.find(b => b.style === 'cancel');
          cancelButton?.onPress?.();
        }
      } else {
        window.alert(`${title}\n\n${message}`);
        buttons?.[0]?.onPress?.();
      }
    } else {
      // 原生版使用 React Native Alert
      RNAlert.alert(title, message, buttons);
    }
  },
};
```

### 5. 密碼加密

```typescript
// services/password.ts

// SHA-256 哈希
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// 密碼驗證
export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const inputHash = await hashPassword(password);
  return inputHash === hashedPassword;
};
```

---

## 平台適配策略

### 1. 條件式導入

```typescript
// services/firestore.ts
import { Platform } from 'react-native';

let createPlace: any;
let updatePlace: any;
let deletePlace: any;
let getTripPlaces: any;
let subscribeToPlaces: any;

if (Platform.OS === 'web') {
  // 網頁版使用 REST API
  const webService = require('./webPlaceService');
  createPlace = webService.createPlace;
  updatePlace = webService.updatePlace;
  deletePlace = webService.deletePlace;
  getTripPlaces = webService.getTripPlaces;
  subscribeToPlaces = webService.subscribeToPlaces;
} else {
  // 原生版使用 Firestore SDK
  // ... 原生實作
}

export { createPlace, updatePlace, deletePlace, getTripPlaces, subscribeToPlaces };
```

### 2. 組件條件渲染

```typescript
// app/(tabs)/map.tsx
import { Platform } from 'react-native';
import MapView from '../../components/MapView';
import WebMapView from '../../components/WebMapView';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <WebMapView places={places} onMapClick={handleMapClick} />
      ) : (
        <MapView places={places} onMapPress={handleMapPress} />
      )}
    </View>
  );
}
```

### 3. 平台特定檔案

```
components/
├── MapView.tsx           # 原生版地圖（Android/iOS）
└── WebMapView.tsx        # 網頁版地圖

services/
├── firestore.ts          # 平台適配器
├── webFirebase.ts        # 網頁版專用
├── webPlaceService.ts    # 網頁版專用
└── webTripService.ts     # 網頁版專用
```

---

## 資料庫設計

### Firestore 資料結構

#### Collections

**1. trips（旅程）**
```typescript
{
  id: string;                    // 文檔 ID（用戶設定的 tripId）
  name: string;                  // 計畫名稱
  destination: string;           // 目的地
  startDate: Date;               // 開始日期
  endDate: Date;                 // 結束日期
  password: string;              // 密碼哈希（SHA-256）
  members: string[];             // 成員設備 ID 陣列
  createdBy: string;             // 創建者設備 ID
  createdAt: Date;               // 創建時間
}
```

**索引：**
- `members` (ARRAY_CONTAINS) - 查詢用戶參與的計畫

**2. places（景點）**
```typescript
{
  id: string;                    // 文檔 ID（自動生成）
  tripId: string;                // 所屬計畫 ID
  name: string;                  // 景點名稱
  address: string;               // 地址
  location: {                    // 座標
    latitude: number;            // 緯度（doubleValue）
    longitude: number;           // 經度（doubleValue）
  };
  category?: string;             // 分類（餐廳、景點、住宿等）
  notes?: string;                // 備註
  photos?: string[];             // 照片 URL 陣列
  visitDate?: Date;              // 預計參訪日期
  dayNumber?: number;            // 第幾天
  order?: number;                // 排序順序
  addedBy: string;               // 新增者設備 ID
  createdAt: Date;               // 新增時間
}
```

**索引：**
- `tripId` (==) - 查詢計畫的所有景點

#### 查詢優化

```typescript
// 高效查詢：使用索引
query(collection(db, 'trips'), where('members', 'array-contains', deviceId));
query(collection(db, 'places'), where('tripId', '==', tripId));

// 避免：全表掃描
query(collection(db, 'trips')); // ❌ 沒有 where 條件
```

---

## 開發環境配置

### 環境變數

**`.env`（本地開發）**
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=japan-trip-app-xxxx
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

**Vercel（生產環境）**
- 在 Vercel 專案設定中配置相同的環境變數
- 類型：Environment Variables
- 適用於：Production, Preview, Development

### NPM 腳本

```json
{
  "scripts": {
    "start": "expo start",           // 啟動開發伺服器
    "android": "expo start --android", // Android 模擬器
    "ios": "expo start --ios",       // iOS 模擬器
    "web": "expo start --web",       // 網頁版開發
    "build": "expo export --platform web" // 構建網頁版
  }
}
```

### 開發工作流

1. **本地開發**
   ```bash
   npm start          # 啟動 Metro Bundler
   按 w             # 打開網頁版
   按 a             # 打開 Android 模擬器
   按 i             # 打開 iOS 模擬器
   ```

2. **測試**
   - 網頁版：`http://localhost:8081`
   - Android：使用 Android Studio 模擬器
   - iOS：使用 Xcode 模擬器

3. **構建**
   ```bash
   # 網頁版
   npm run build

   # Android APK
   eas build --platform android --profile preview
   ```

---

## 部署策略

### 1. 網頁版部署（Vercel）

#### 自動部署流程
```
GitHub (master branch)
    ↓ (git push)
Vercel 偵測到變更
    ↓
自動構建 (expo export --platform web)
    ↓
部署到 CDN
    ↓
https://japan-trip-app-nine.vercel.app
```

#### Vercel 配置（`vercel.json`）
```json
{
  "buildCommand": "expo export --platform web",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/_expo/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 靜態資源處理
- `/_expo/static/*` - Expo 生成的靜態資源（JS、CSS）
- `/assets/*` - 圖片、字體等資源
- `/favicon.ico` - 網站圖標
- 其他路徑 → `index.html`（SPA 路由）

### 2. Android 部署

#### 使用 Expo Application Services (EAS)
```bash
# 安裝 EAS CLI
npm install -g eas-cli

# 登入 Expo 帳號
eas login

# 配置構建
eas build:configure

# 構建 APK
eas build --platform android --profile preview

# 下載 APK
eas build:list
```

#### 本地構建（無需 EAS）
```bash
# 使用 Expo 本地構建
expo build:android -t apk

# APK 會上傳到 Expo 伺服器
# 下載連結會顯示在終端
```

### 3. 版本管理

#### Git 工作流
```bash
# 開發分支
git checkout develop
git add .
git commit -m "feat: 新功能"
git push origin develop

# 合併到主分支並部署
git checkout master
git merge develop
git push origin master  # 觸發 Vercel 自動部署

# 版本標籤
git tag v1.3.0
git push origin v1.3.0
```

#### 版本號規範（Semantic Versioning）
- **Major (1.x.x)** - 重大變更、不向後兼容
- **Minor (x.1.x)** - 新功能、向後兼容
- **Patch (x.x.1)** - Bug 修復、優化

---

## 效能優化

### 1. 網頁版優化

#### 輪詢策略
```typescript
// 智能輪詢：僅在資料變化時觸發更新
const placesChanged = lastPlaces === null ||
  JSON.stringify(places) !== JSON.stringify(lastPlaces);

if (placesChanged) {
  callback(places);
}
```

#### 靜態資源快取
```json
// vercel.json
{
  "headers": [
    {
      "source": "/_expo/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 2. 原生版優化

#### 即時監聽
- 使用 Firestore `onSnapshot` 替代輪詢
- 僅在資料變更時觸發回調
- 支援離線模式

#### 查詢優化
```typescript
// 使用索引查詢
const q = query(
  collection(db, 'places'),
  where('tripId', '==', tripId)
);

// 排序由 Firestore 處理
places.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
```

---

## 安全性

### 1. 密碼保護
- 使用 SHA-256 哈希加密
- 密碼永不明文存儲
- 客戶端驗證，減少伺服器負擔

### 2. 資料隔離
- 每個計畫有唯一 ID 和密碼
- 使用 `members` 陣列控制存取權限
- Firestore 查詢僅返回用戶有權限的資料

### 3. API 金鑰保護
- 環境變數存儲（`.env`）
- Vercel 環境變數加密
- Google Maps API Key 限制（HTTP Referrer、API 限制）

---

## 已知限制與改進方向

### 限制
1. **網頁版即時更新延遲**（2-5 秒輪詢間隔）
2. **Marker 棄用警告**（Google Maps API，至少 12 個月不影響）
3. **無離線支援**（網頁版依賴網路連接）

### 改進方向
1. **遷移到 Firebase Realtime Database**（支援 WebSocket 即時更新）
2. **使用 AdvancedMarkerElement**（Google Maps 新 API）
3. **實現 PWA**（支援離線模式、安裝到主畫面）
4. **優化輪詢策略**（根據用戶活動調整頻率）

---

## 成本分析

| 服務 | 方案 | 費用 |
|------|------|------|
| Firebase Firestore | Spark（免費） | $0 |
| Google Maps API | 免費額度 | $0 |
| Vercel 部署 | Hobby（免費） | $0 |
| GitHub 託管 | 免費 | $0 |
| **總成本** | | **$0/月** |

**免費額度限制：**
- Firestore：50,000 讀取/天、20,000 寫入/天
- Google Maps：28,000 次載入/月
- Vercel：100 GB 頻寬/月

---

## 相關連結

- **生產網址：** https://japan-trip-app-nine.vercel.app
- **GitHub 倉庫：** https://github.com/10827133Oscar/Japan-Trip-App
- **Vercel 專案：** https://vercel.com/10827133oscars-projects/japan-trip-app

---

## 技術文檔維護

**維護者：** Oscar
**建立日期：** 2025-12-26
**最後更新：** 2025-12-26
**文檔版本：** 1.0.0

如有技術問題，請提交 GitHub Issue 或查閱以下文檔：
- `README.md` - 專案說明
- `WEB_DEPLOYMENT_GUIDE.md` - 網頁版部署指南
- `GOOGLE_MAPS_API_SETUP.md` - Google Maps API 設定
- `WEB_MIGRATION_PROGRESS.md` - 網頁版移植進度
