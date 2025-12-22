# Google Maps API 設定指南

## 🚨 解決 ApiNotActivatedMapError 錯誤

如果看到 `ApiNotActivatedMapError`，表示 **Maps JavaScript API** 尚未啟用。

## ⚠️ 為什麼手機 App 可以顯示地圖，但網頁版不行？

這是因為**手機 App 和網頁版使用不同的 Google Maps API**：

### 手機 App（Android/iOS）
- 使用 `react-native-maps` 套件
- **Android** 使用：**Maps SDK for Android**
- **iOS** 使用：**Maps SDK for iOS**
- 這些是**原生 SDK**，需要不同的 API

### 網頁版
- 使用 `@react-google-maps/api` 套件
- 使用：**Maps JavaScript API**
- 這是**完全不同的 API**，需要單獨啟用

### 總結
你可能已經啟用了：
- ✅ **Maps SDK for Android**（所以手機 App 可以顯示地圖）
- ✅ **Maps SDK for iOS**（如果有的話）
- ❌ **Maps JavaScript API**（網頁版需要，但還沒啟用）← **這就是問題所在！**

**解決方法：** 需要在 Google Cloud Console 中**額外啟用**「Maps JavaScript API」。

## 📋 完整設定步驟

### 步驟 1: 啟用 Maps JavaScript API

1. **前往 Google Cloud Console**
   - 打開 [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - 使用與 Firebase 相同的 Google 帳號登入

2. **選擇正確的專案**
   - 在頂部選擇你的專案（應該與 Firebase 專案相同）
   - 如果找不到，檢查 Firebase Console 中的 Project ID

3. **啟用 Maps JavaScript API**
   - 左側選單：點擊「**API 和服務**」→「**程式庫**」
   - 在搜尋欄輸入「**Maps JavaScript API**」
   - 點擊「**Maps JavaScript API**」結果
   - 點擊「**啟用**」按鈕
   - ⏳ 等待幾秒讓 API 啟用完成

### 步驟 2: 檢查 API Key 權限

1. **進入憑證頁面**
   - 左側選單：點擊「**API 和服務**」→「**憑證**」
   - 找到你的 API Key（應該與 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` 相同）

2. **編輯 API Key**
   - 點擊你的 API Key 名稱
   - 在「**API 限制**」區塊：
     - 選擇「**限制金鑰**」
     - 在「選取 API」中，確認「**Maps JavaScript API**」已勾選 ✅
     - 或選擇「**不限制**」（開發階段推薦）

3. **設定應用程式限制（如果有的話）**
   - 在「**應用程式限制**」區塊：
     - 如果選擇「**HTTP 引用來源（網站）**」，請加入：
       ```
       https://*.vercel.app/*
       http://localhost:*
       ```
     - 或選擇「**無**」（開發階段推薦）

4. **儲存變更**
   - 點擊「**儲存**」按鈕
   - 等待幾秒讓變更生效

### 步驟 3: 驗證設定

1. **檢查 API 是否已啟用**
   - 回到「**API 和服務**」→「**已啟用的 API**」
   - 確認「**Maps JavaScript API**」在列表中 ✅

2. **測試地圖**
   - 重新整理你的網頁
   - 檢查地圖是否正常顯示
   - 如果仍有錯誤，等待 1-2 分鐘後再試（API 啟用可能需要時間）

## 🔍 疑難排解

### 問題 1: 找不到「程式庫」選單

**解決：**
- 確認你已選擇正確的專案
- 確認你的帳號有專案的管理員權限
- 嘗試直接訪問：`https://console.cloud.google.com/apis/library/maps-backend.googleapis.com`

### 問題 2: 啟用按鈕是灰色的

**解決：**
- 檢查你的 Google Cloud 帳號是否有計費帳戶
- 即使有免費額度，也需要設定計費帳戶
- 前往「**計費**」頁面設定（不會立即收費，有 $200 免費額度）

### 問題 3: API 已啟用但仍有錯誤

**解決：**
1. 確認 API Key 正確：
   - 檢查 Vercel 環境變數中的 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
   - 確認與 Google Cloud Console 中的 API Key 相同

2. 清除瀏覽器快取：
   - 按 `Ctrl + Shift + Delete`（Windows）
   - 清除快取和 Cookie
   - 重新載入網頁

3. 等待 API 生效：
   - API 啟用後可能需要 1-5 分鐘才會生效
   - 如果 5 分鐘後仍有問題，檢查 API Key 設定

### 問題 4: 看到「RefererNotAllowedMapError」

**解決：**
- 這表示 API Key 的網域限制設定錯誤
- 在 API Key 設定中，檢查「應用程式限制」
- 確認已加入 `https://*.vercel.app/*`

## 📝 快速檢查清單

完成設定後，確認以下項目：

- [ ] **Maps JavaScript API** 已啟用（在「已啟用的 API」列表中）
  - ⚠️ 這與「Maps SDK for Android」是**不同的 API**
- [ ] API Key 的「API 限制」包含 **Maps JavaScript API**
- [ ] API Key 的「應用程式限制」已設定正確的網域（或選擇「無」）
- [ ] Vercel 環境變數 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` 已設定
- [ ] 已重新部署網站（如果修改了環境變數）

## 📊 API 對照表

| 平台 | 使用的套件 | 需要的 API | 狀態 |
|------|-----------|-----------|------|
| Android App | `react-native-maps` | **Maps SDK for Android** | ✅ 通常已啟用 |
| iOS App | `react-native-maps` | **Maps SDK for iOS** | ✅ 通常已啟用 |
| 網頁版 | `@react-google-maps/api` | **Maps JavaScript API** | ❌ 需要額外啟用 |

## 💡 關於 Marker 棄用警告

`google.maps.Marker is deprecated` 只是警告，不影響功能。Google 建議使用 `AdvancedMarkerElement`，但現有的 Marker 仍可正常使用至少 12 個月。

如果需要修復警告，可以：
1. 等待 Google 提供更完整的遷移指南
2. 或參考：[遷移至高級標記](https://developers.google.com/maps/documentation/javascript/advanced-markers/migration)

## 🔗 相關連結

- [Google Cloud Console](https://console.cloud.google.com/)
- [Maps JavaScript API 文件](https://developers.google.com/maps/documentation/javascript)
- [API 錯誤訊息說明](https://developers.google.com/maps/documentation/javascript/error-messages)

