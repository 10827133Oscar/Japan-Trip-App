# 日本旅遊助手 🗾

一個專為家庭旅遊設計的跨平台應用，支持多人協作、地圖標記、路線規劃等功能。

🌐 **網頁版上線：** https://japan-trip-app-nine.vercel.app

## ✨ 功能特色

- 📱 **多平台支援**：Android APK + 網頁版（支援 iPhone、電腦）
- 🌐 **免費網頁版**：無需下載 App，瀏覽器即可使用
- 👨‍👩‍👧‍👦 **多人協作**：家人可以一起編輯行程，即時同步
- 🗺️ **地圖標記**：在地圖上標記所有景點位置
- 🚶 **路線規劃**：自動規劃最佳遊覽路線
- 📅 **行程管理**：按天數安排景點
- 🔐 **密碼保護**：每個計畫可設定密碼，只有知道密碼的人才能加入
- 🎨 **個性化**：自訂暱稱和代表色
- ☁️ **雲端同步**：資料自動保存在雲端
- 💰 **完全免費**：所有功能免費使用，無需付費

## 🌐 網頁版使用（推薦給 iPhone 用戶）

### 直接使用（無需安裝）

1. **打開網址：** https://japan-trip-app-nine.vercel.app
2. **開始使用** - 設定暱稱和顏色即可

### 安裝到主畫面（像 App 一樣使用）

**iPhone 用戶（Safari）：**
1. 打開網址：https://japan-trip-app-nine.vercel.app
2. 點擊底部的「分享」按鈕
3. 選擇「加入主畫面」
4. 完成！現在可以像 App 一樣打開使用

**Android 用戶（Chrome）：**
1. 打開網址：https://japan-trip-app-nine.vercel.app
2. 點擊右上角「⋮」選單
3. 選擇「新增至主畫面」
4. 完成！

**桌面瀏覽器：**
- 直接在瀏覽器中使用，無需安裝
- 建議使用 Chrome、Safari、Edge 等現代瀏覽器

### 網頁版 vs 原生 App

| 功能 | 網頁版 | Android APK |
|------|--------|-------------|
| 創建/加入計畫 | ✅ | ✅ |
| 新增/編輯景點 | ✅ | ✅ |
| 地圖顯示 | ✅ | ✅ |
| 多人協作 | ✅ | ✅ |
| 即時同步 | ✅ (2-5秒輪詢) | ✅ (即時) |
| 離線使用 | ❌ | ✅ |
| 安裝方式 | 瀏覽器/加入主畫面 | 下載 APK |
| iPhone 支援 | ✅ | ❌ |
| 無需下載 | ✅ | ❌ |

**推薦：**
- **iPhone 用戶** → 使用網頁版
- **Android 用戶** → 可使用 APK 或網頁版
- **電腦用戶** → 使用網頁版

---

## 🚀 開發者快速開始

> **注意：** 以下內容適用於開發者。一般用戶請直接使用網頁版：https://japan-trip-app-nine.vercel.app

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
```

### 5. 運行App

#### 方式 1：運行網頁版（推薦）

```bash
# 啟動網頁版開發伺服器
npm run web
```

然後在瀏覽器打開：http://localhost:8081

#### 方式 2：運行原生 App（需要手機）

```bash
# 啟動 Expo 開發伺服器
npx expo start
```

然後：
1. 在手機上打開 **Expo Go** App
2. 掃描終端顯示的 QR code
3. App將在您的手機上載入並運行

## 📱 如何使用

### 1. 首次使用
- 打開App後，輸入您的**暱稱**（最多10個字）
- 選擇一個**代表色**（8種顏色可選）
- 點擊「開始使用」

### 2. 創建計畫
- 在主頁點擊「創建計畫」
- 輸入計畫名稱（例如：東京家庭旅遊）
- 輸入目的地（例如：東京）
- 設定一個**計畫密碼**（用於分享給家人朋友）
- 點擊「創建」
- **重要**：記下顯示的**計畫 ID**（6位數字），點擊可複製

### 3. 邀請家人加入
- 將**計畫 ID** 和**密碼**分享給家人
- 家人打開App後，點擊「加入計畫」
- 輸入您分享的計畫 ID 和密碼
- 成功加入後，就能一起協作編輯

### 4. 添加景點
- 切換到「景點」頁面
- 點擊右下角的 **+** 按鈕
- 填寫景點資訊：
  - **景點名稱**：例如「淺草寺」
  - **地址**：例如「東京都台東區淺草2-3-1」
  - **類型**：例如「寺廟」
  - **第幾天**：例如「1」（表示第一天）
  - **備註**：例如「必看雷門」
- 點擊「新增景點」

### 5. 查看地圖
- 切換到「地圖」頁面
- 所有景點會以標記顯示在地圖上
- 點擊「規劃路線」按鈕自動規劃最佳路線

### 6. 多人協作
- 所有計畫成員的編輯都會**即時同步**
- 在景點列表可以看到誰添加了哪個景點（根據代表色區分）
- 所有成員都可以添加、編輯、刪除景點

## 🔐 密碼認證系統說明

本 App 使用**本地用戶 + 密碼保護計畫**的認證方式，無需 Google 帳號。

### 工作原理

1. **本地用戶**
   - 首次使用時設定暱稱和代表色
   - 系統自動生成唯一的裝置 ID
   - 資料儲存在手機本地（AsyncStorage）

2. **計畫密碼保護**
   - 創建計畫時設定密碼（加密儲存）
   - 獲得唯一的 6 位數計畫 ID
   - 分享 ID + 密碼給家人即可協作

3. **多人協作**
   - 每個人用自己的暱稱和顏色
   - 通過計畫 ID 和密碼加入同一個計畫
   - 即時同步所有編輯

### 隱私與安全

- ✅ 無需提供個人資訊
- ✅ 密碼加密儲存在 Firebase
- ✅ 只有知道 ID 和密碼的人才能加入
- ✅ 計畫 ID 隨機生成，難以猜測
- ✅ 適合家庭和小團隊使用

## 🛡️ 配置Firestore安全規則

為了保護您的資料，請在Firebase Console設定安全規則：

1. 前往Firebase Console → Firestore Database → 規則
2. 複製以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 計畫規則 - 開放讀取，允許寫入
    match /trips/{tripId} {
      allow read: if true;
      allow write: if true;
    }

    // 景點規則 - 開放讀取，允許寫入
    match /places/{placeId} {
      allow read: if true;
      allow write: if true;
    }

    // 行程規則 - 開放讀取，允許寫入
    match /itineraries/{itineraryId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. 點擊「發布」

**⚠️ 安全性說明：**
- 這些規則允許所有人讀寫資料，但計畫受密碼保護
- 沒有計畫 ID 和密碼的人無法找到您的計畫
- 對於家庭使用已足夠安全

## 📦 打包發布

### 🌐 網頁版部署到 Vercel（完全免費，推薦）

```bash
# 1. 構建網頁版
npm run build

# 2. 安裝 Vercel CLI
npm install -g vercel

# 3. 登入 Vercel
vercel login

# 4. 部署到 Vercel（第一次部署）
vercel

# 5. 部署到生產環境
vercel --prod
```

**設定環境變數（在 Vercel Dashboard）：**
1. 前往 Vercel Dashboard → 你的專案 → Settings → Environment Variables
2. 添加以下變數：
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

**詳細部署指南：** 請參考 `WEB_DEPLOYMENT_GUIDE.md`

---

### 📱 Android APK（給 Android 用戶）

**測試版（內部分享）：**
```bash
# 安裝 EAS CLI
npm install -g eas-cli

# 登入 Expo 帳號
eas login

# 建立 Android APK
eas build --platform android --profile preview

# 下載 APK 並分享給家人
```

**正式發布到 Google Play：**（需要 Google Play 開發者帳號，$25 一次性）
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

### 🍎 iOS（不推薦，建議使用網頁版）

**為什麼不推薦：**
- 需要 Apple Developer 帳號（$99/年）
- 審核流程複雜且耗時
- 網頁版可完美支援 iPhone

**如果仍要發布到 App Store：**
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## 💰 成本估算

| 服務 | 免費額度 | 預計費用 | 說明 |
|------|----------|----------|------|
| **Vercel 網頁託管** | 100 GB 流量/月 | **$0** | 網頁版部署平台 |
| **Firestore** | 每天 50,000 次讀取、20,000 次寫入 | **$0** | 資料庫 |
| **Firebase Storage** | 5GB 儲存、1GB/天下載 | **$0** | 圖片儲存（可選） |
| **Google Maps API** | 每月 $200 額度 | **$0** | 約 40,000 次請求 |
| **Expo 開發** | 完全免費 | **$0** | 開發框架 |
| **總計** | | **$0** | 🎉 |

**說明：**
- ✅ 網頁版 + Android APK 完全免費
- ✅ 家庭使用完全在免費額度內
- ✅ 無需 Apple Developer 帳號（$99/年）
- ✅ 無需 Google Play 開發者帳號（$25）
- ✅ 總成本：**$0**

## 🔧 故障排除

### 問題：無法創建或加入計畫
- 檢查網路連接是否正常
- 確認`.env`文件中的Firebase配置是否正確
- 確認Firestore已在Firebase Console中啟用
- 檢查計畫 ID 是否正確（6位數字）
- 確認密碼輸入正確

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

### 核心技術
- **前端框架**：React Native + Expo SDK 54
- **導航**：Expo Router（檔案系統路由）
- **狀態管理**：React Hooks + Context API
- **語言**：TypeScript

### 資料庫與後端
- **資料庫**：Cloud Firestore
  - 原生 App：Firestore SDK（即時監聽）
  - 網頁版：Firebase REST API（輪詢模擬）
- **認證方式**：本地用戶 + 計畫密碼保護

### 地圖服務
- **Android/iOS**：react-native-maps (Google Maps SDK)
- **網頁版**：@react-google-maps/api (Google Maps JavaScript API)
- **平台自動選擇**：Platform.OS 條件載入

### 部署與託管
- **網頁版**：Vercel（自動部署）
- **Android APK**：EAS Build
- **CI/CD**：Git push 觸發 Vercel 自動部署

### 跨平台架構
- 平台適配層：services/tripService.ts, services/firestore.ts
- 網頁版服務：webFirebase.ts, webTripService.ts, webPlaceService.ts
- 網頁版組件：WebMapView.tsx
- 跨平台工具：utils/alert.ts

## 📚 詳細文檔

- **[網頁版部署指南](WEB_DEPLOYMENT_GUIDE.md)** - 完整的 Vercel 部署教學
- **[Google Maps API 設定](GOOGLE_MAPS_API_SETUP.md)** - Maps JavaScript API 設定步驟
- **[網頁版移植進度](WEB_MIGRATION_PROGRESS.md)** - 網頁版開發完整記錄
- **[部署資訊總覽](DEPLOYMENT_INFO.md)** - 所有部署相關資訊
- **[Firestore 規則部署](DEPLOY_FIRESTORE_RULES.md)** - 資料庫安全規則設定

## 🤝 協作開發

如果您想為這個專案貢獻代碼：

1. Fork這個專案
2. 創建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交Pull Request

## 📄 版本歷史

- **v1.3.0** (2024-12) - 網頁版完整部署
  - ✅ 新增網頁版支援（Vercel）
  - ✅ 修復 4 個關鍵 Bug
  - ✅ 完整的跨平台架構

- **v1.2.0** (2024-12) - 密碼認證系統
  - ✅ 計畫密碼保護
  - ✅ 自定義計畫 ID

- **v1.1.0** (2024-12) - 功能完善
  - ✅ 多人協作即時同步
  - ✅ 地圖路線規劃

- **v1.0.0** (2024-12) - 初始版本
  - ✅ 基本功能實現

## 📄 授權

此專案為個人使用專案，僅供學習和家庭使用。

## 💬 聯繫方式

如有問題或建議，歡迎聯繫開發者。

---

**🌐 立即體驗：** https://japan-trip-app-nine.vercel.app

**祝您旅途愉快！🎌**
