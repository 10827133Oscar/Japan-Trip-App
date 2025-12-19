# 日本旅遊助手 🗾

一個專為家庭旅遊設計的跨平台移動App，支持多人協作、地圖標記、路線規劃等功能。

## ✨ 功能特色

- 📱 **跨平台**：一次開發，iOS和Android都能使用
- 👨‍👩‍👧‍👦 **多人協作**：家人可以一起編輯行程，即時同步
- 🗺️ **地圖標記**：在地圖上標記所有景點位置
- 🚶 **路線規劃**：自動規劃最佳遊覽路線
- 📅 **行程管理**：按天數安排景點
- 🔐 **密碼保護**：每個計畫可設定密碼，只有知道密碼的人才能加入
- 🎨 **個性化**：自訂暱稱和代表色
- ☁️ **雲端同步**：資料自動保存在雲端

## 🚀 快速開始

### 前置要求

- Node.js (v18或更高版本)
- npm或yarn
- 智能手機（用於測試）
- Expo Go App（從App Store或Google Play下載）

### 1. 安裝依賴

```bash
cd japan-trip-app
npm install
```

### 2. 配置Firebase

#### 2.1 創建Firebase專案

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 點擊「建立專案」
3. 輸入專案名稱：`japan-trip-app`
4. 點擊「繼續」並完成設定

#### 2.2 啟用Firebase服務

**Firestore Database（資料庫）：**
1. 在左側選單點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」（開發階段）
4. 選擇區域：`asia-northeast1`（東京）
5. 點擊「啟用」

**Storage（儲存）：**（可選，用於上傳照片）
1. 在左側選單點擊「Storage」
2. 點擊「開始使用」
3. 選擇測試模式
4. 點擊「完成」

#### 2.3 獲取Firebase配置

1. 在Firebase Console點擊專案設定（齒輪圖示）
2. 在「一般」標籤中，向下滾動到「您的應用程式」
3. 點擊「</> Web」圖示新增Web應用
4. 輸入應用名稱，點擊「註冊應用程式」
5. 複製`firebaseConfig`中的配置值

#### 2.4 配置OAuth Client IDs

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 選擇您的Firebase專案
3. 左側選單：「API和服務」→「憑證」
4. 點擊「建立憑證」→「OAuth 2.0 客戶端 ID」
5. 創建以下三個Client ID：
   - **Web Client**：應用程式類型選「網頁應用程式」
   - **iOS Client**（如需iOS）：應用程式類型選「iOS」
   - **Android Client**（如需Android）：應用程式類型選「Android」

### 3. 配置Google Maps API

#### 3.1 啟用Google Maps API

1. 在 [Google Cloud Console](https://console.cloud.google.com)
2. 確保選擇了正確的專案
3. 左側選單：「API和服務」→「資料庫」
4. 搜尋並啟用以下API：
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
   - Geocoding API
   - Places API（可選）

#### 3.2 創建API金鑰

1. 左側選單：「API和服務」→「憑證」
2. 點擊「建立憑證」→「API金鑰」
3. 創建後，點擊「限制金鑰」
4. 設定應用程式限制（推薦）：
   - iOS：設定iOS應用程式的Bundle ID
   - Android：設定Android應用程式的套件名稱和SHA-1指紋
5. 限制API（選擇上述啟用的API）

### 4. 配置環境變數

複製 `.env.example` 到 `.env`：

```bash
cp .env.example .env
```

編輯 `.env` 文件，填入您的配置：

```env
# Firebase配置（從Firebase Console獲取）
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google OAuth配置（從Google Cloud Console獲取）
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

### 5. 運行App

```bash
# 啟動開發伺服器
npx expo start
```

然後：
1. 在手機上打開 **Expo Go** App
2. 掃描終端顯示的 QR code
3. App將在您的手機上載入並運行

## 📱 如何使用

### 1. 登入
- 打開App後，點擊「使用Google登入」
- 選擇您的Google帳號完成登入

### 2. 創建旅程
- 在「行程」頁面，點擊「+ 新增行程」
- 輸入行程名稱（例如：東京家庭旅遊）
- 輸入目的地（例如：東京）
- 點擊「創建」

### 3. 添加景點
- 切換到「景點」頁面
- 點擊右下角的 **+** 按鈕
- 填寫景點資訊：
  - **景點名稱**：例如「淺草寺」
  - **地址**：例如「東京都台東區淺草2-3-1」
  - **類型**：例如「寺廟」
  - **第幾天**：例如「1」（表示第一天）
  - **備註**：例如「必看雷門」
- 點擊「新增景點」

### 4. 查看地圖
- 切換到「地圖」頁面
- 所有景點會以標記顯示在地圖上
- 點擊「規劃路線」按鈕自動規劃最佳路線

### 5. 多人協作
- 將您的Google帳號分享給家人
- 家人登入相同帳號即可查看和編輯行程
- 所有修改會即時同步到所有設備

## 🛡️ 配置Firestore安全規則

為了保護您的資料，請在Firebase Console設定安全規則：

1. 前往Firebase Console → Firestore Database → 規則
2. 複製以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只有登入用戶可以讀寫自己的資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 旅程規則
    match /trips/{tripId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
    }

    // 景點規則
    match /places/{placeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        (request.auth.uid == resource.data.addedBy ||
         request.auth.uid in get(/databases/$(database)/documents/trips/$(resource.data.tripId)).data.members);
    }

    // 行程規則
    match /itineraries/{itineraryId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. 點擊「發布」

## 📦 打包發布

### 測試版（給家人使用）

**iOS - TestFlight：**
```bash
# 安裝EAS CLI
npm install -g eas-cli

# 登入Expo帳號
eas login

# 建立iOS build
eas build --platform ios --profile preview

# 上傳到TestFlight
```

**Android - 內部測試：**
```bash
# 建立Android build
eas build --platform android --profile preview

# 下載APK並分享給家人
```

### 正式發布

**iOS App Store：**（需要Apple Developer帳號，$99/年）
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

**Google Play Store：**（需要Google Play開發者帳號，$25一次性）
```bash
eas build --platform android --profile production
eas submit --platform android
```

## 💰 成本估算

| 服務 | 免費額度 | 預計費用 |
|------|----------|----------|
| Firebase Authentication | 無限次 | $0 |
| Firestore | 每天50,000次讀取 | $0（家庭使用足夠） |
| Firebase Storage | 5GB儲存 | $0 |
| Google Maps API | 每月$200額度 | $0（約40,000次請求） |
| Expo開發 | 完全免費 | $0 |
| **總計** | | **$0** |

## 🔧 故障排除

### 問題：無法登入
- 檢查`.env`文件中的Firebase配置是否正確
- 確認Firebase Console中已啟用Google登入
- 檢查OAuth Client ID是否正確配置

### 問題：地圖無法顯示
- 確認Google Maps API已啟用
- 檢查API金鑰是否正確
- 確認API金鑰沒有設定過於嚴格的限制

### 問題：無法添加景點
- 檢查Firestore是否已創建並啟用
- 確認安全規則允許當前用戶寫入
- 檢查地址是否有效（Geocoding API需要有效地址）

### 問題：無法規劃路線
- 確認Directions API已啟用
- 檢查至少有2個景點
- 確認景點都有有效的經緯度座標

## 📝 技術棧

- **前端框架**：React Native + Expo
- **導航**：Expo Router
- **認證**：Firebase Authentication
- **資料庫**：Cloud Firestore
- **地圖**：Google Maps SDK
- **狀態管理**：React Hooks + Context
- **語言**：TypeScript

## 🤝 協作開發

如果您想為這個專案貢獻代碼：

1. Fork這個專案
2. 創建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 授權

此專案為個人使用專案，僅供學習和家庭使用。

## 💬 聯繫方式

如有問題或建議，歡迎聯繫開發者。

---

**祝您旅途愉快！🎌**
