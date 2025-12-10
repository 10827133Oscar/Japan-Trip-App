# 🚀 快速設定指南

這個指南將幫助您在**30分鐘內**完成所有配置並運行App。

## 📋 檢查清單

在開始之前，請確保您已經：
- [ ] 安裝了Node.js（v18或更高）
- [ ] 在手機上安裝了Expo Go App
- [ ] 擁有Google帳號（用於Firebase和Google Cloud）

## 步驟一：安裝依賴（5分鐘）

```bash
cd japan-trip-app
npm install
```

## 步驟二：創建並配置Firebase專案（10分鐘）

### 2.1 創建專案
1. 前往 https://console.firebase.google.com
2. 點擊「新增專案」
3. 專案名稱：`japan-trip-app`
4. 停用Google Analytics（可選）
5. 點擊「建立專案」

### 2.2 啟用Authentication
1. 左側選單 → `Authentication`
2. 點擊「開始使用」
3. 選擇「Google」登入方式
4. 啟用後，填寫專案支援電子郵件
5. **保存**

### 2.3 建立Firestore
1. 左側選單 → `Firestore Database`
2. 點擊「建立資料庫」
3. 選擇「以測試模式啟動」
4. 位置選擇：`asia-northeast1`（東京）
5. 點擊「啟用」

### 2.4 獲取Firebase配置
1. 點擊設定圖示 ⚙️ → 專案設定
2. 向下滾動到「您的應用程式」
3. 點擊 `</>` 圖示（Web）
4. 應用程式暱稱：`Japan Trip Web`
5. **複製** `firebaseConfig` 中的所有值

## 步驟三：設定Google Cloud（10分鐘）

### 3.1 啟用Google Maps API
1. 前往 https://console.cloud.google.com
2. 選擇您的Firebase專案（左上角下拉選單）
3. 左側選單 → `API和服務` → `程式庫`
4. 搜尋並**啟用**以下API：
   - Maps SDK for Android
   - Maps SDK for iOS
   - Directions API
   - Geocoding API

### 3.2 創建API金鑰
1. 左側選單 → `API和服務` → `憑證`
2. 點擊「+ 建立憑證」→ 選擇「API金鑰」
3. **複製**金鑰（稍後需要）
4. 點擊「限制金鑰」
5. 名稱：`Japan Trip Maps API Key`
6. API限制 → 選擇「限制金鑰」
7. 選擇剛才啟用的4個API
8. **保存**

### 3.3 設定OAuth 2.0（重要！）
1. 還在「憑證」頁面
2. 點擊「+ 建立憑證」→ 「OAuth 2.0 用戶端 ID」
3. 如果提示配置同意畫面，點擊「設定同意畫面」：
   - 選擇「外部」→ 點擊「建立」
   - 應用程式名稱：`日本旅遊助手`
   - 使用者支援電子郵件：選擇您的email
   - 開發人員聯絡資訊：填入您的email
   - 點擊「儲存並繼續」
   - 範圍：直接點擊「儲存並繼續」
   - 測試使用者：點擊「+ ADD USERS」，添加您和家人的email
   - 點擊「儲存並繼續」
4. 返回「憑證」頁面，再次點擊「+ 建立憑證」→ 「OAuth 2.0 用戶端 ID」
5. 應用程式類型：選擇「網頁應用程式」
6. 名稱：`Japan Trip Web Client`
7. 已授權的重新導向 URI：
   - 點擊「+ 新增 URI」
   - 輸入：`https://auth.expo.io/@your-expo-username/japan-trip-app`
   - （暫時可以填 `https://localhost`，稍後修改）
8. **複製** Client ID（Web Client ID）

## 步驟四：配置環境變數（3分鐘）

1. 複製 `.env.example` 為 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 用文字編輯器打開 `.env`，填入剛才獲取的值：

```env
# 從Firebase專案設定中獲取
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=japan-trip-app-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=japan-trip-app-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=japan-trip-app-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# 從Google Cloud API金鑰獲取
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# 從OAuth 2.0 Client ID獲取
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=(暫時留空)
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=(暫時留空)
```

3. **保存**文件

## 步驟五：運行App（2分鐘）

1. 啟動開發伺服器：
   ```bash
   npx expo start
   ```

2. 打開手機上的 **Expo Go** App

3. 掃描終端顯示的 **QR code**

4. App開始載入！🎉

## 🎯 首次使用

1. App載入後，點擊「使用Google登入」
2. 選擇您的Google帳號
3. 允許權限請求
4. 登入成功！

5. 創建第一個行程：
   - 點擊「+ 新增行程」
   - 輸入：「東京家庭旅遊」
   - 點擊「創建」

6. 添加第一個景點：
   - 切換到「景點」頁籤
   - 點擊右下角 **+** 按鈕
   - 景點名稱：`淺草寺`
   - 地址：`東京都台東區淺草2-3-1`
   - 第幾天：`1`
   - 點擊「新增景點」

7. 查看地圖：
   - 切換到「地圖」頁籤
   - 景點會顯示在地圖上！

## ❓ 常見問題

### Q: 無法登入？
A: 檢查以下項目：
- Firebase Authentication是否啟用Google登入
- `.env`文件中的配置是否正確
- OAuth同意畫面是否配置完成

### Q: 地圖無法顯示？
A: 確認：
- Google Maps API都已啟用
- API金鑰是否正確填入`.env`
- API金鑰沒有過度限制

### Q: 無法添加景點？
A: 可能原因：
- Firestore安全規則過於嚴格（應該使用測試模式）
- 地址格式不正確（需要完整地址）
- Geocoding API未啟用

### Q: 提示「Expo username」是什麼？
A:
- 運行 `npx expo login` 登入或註冊Expo帳號
- 運行 `npx expo whoami` 查看您的username

## 🔧 進階設定（可選）

### 配置生產環境的Firestore安全規則

1. Firebase Console → Firestore Database → 規則
2. 複製 `firestore.rules` 文件的內容
3. 貼上並發布

### 為iOS和Android創建OAuth Client

**iOS:**
1. Google Cloud Console → 憑證
2. 創建「OAuth 2.0 用戶端 ID」
3. 應用程式類型：iOS
4. Bundle ID：`com.yourname.japantripapp`

**Android:**
1. 創建「OAuth 2.0 用戶端 ID」
2. 應用程式類型：Android
3. 套件名稱：`com.yourname.japantripapp`
4. SHA-1：運行 `eas credentials` 獲取

## 🎊 完成！

恭喜！您的日本旅遊助手App已經可以使用了！

如果遇到任何問題，請參考 `README.md` 中的詳細說明。

---

**開始規劃您的東京之旅吧！🗼**
