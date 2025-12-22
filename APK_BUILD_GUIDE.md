# APK 建置與問題解決指南

## 🎯 目標
讓 APK 能夠順利在手機上運行，解決離線錯誤和環境變數配置問題。

---

## 📋 遇到的問題總結

### 問題 1：離線錯誤
**錯誤訊息：** `Failed to get doc because the client is offline`

**原因：**
- Firestore 沒有啟用離線持久化
- 網路不穩定時無法從快取讀取資料
- `getDoc` 調用沒有處理離線情況

**影響：**
- 行程頁面 loading 很久
- 添加計畫時出現離線錯誤

### 問題 2：環境變數配置
**問題：**
- EAS Build 時環境變數不會自動從 `.env` 讀取
- `app.config.js` 中 Google Maps API Key 的環境變數名稱不一致
- EAS Secrets 沒有設置

**影響：**
- 建置可能成功，但 App 運行時無法連接到 Firebase 或 Google Maps

### 問題 3：EAS Secrets 設置複雜
**問題：**
- `eas secret:create` 命令已被棄用
- 新命令 `eas env:create` 需要多個參數才能避免交互式提示
- 缺少 `--visibility` 參數會導致錯誤

---

## ✅ 解決方案

### 步驟 1：修復離線問題（核心修復）

#### 1.1 啟用 Firestore 離線持久化

在 `services/firebase.ts` 中添加：

```typescript
import { getFirestore, enableIndexedDbPersistence, enableNetwork } from 'firebase/firestore';

// 在初始化後添加
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Firestore persistence already enabled');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore persistence not supported');
    }
  });
} catch (error) {
  console.warn('⚠️ Could not enable Firestore persistence:', error);
}

enableNetwork(db).catch((err) => {
  console.error('❌ Failed to enable Firestore network:', err);
});
```

#### 1.2 修改 getDoc 調用以支援快取讀取

在 `services/tripService.ts` 中，所有 `getDoc` 調用改為：

```typescript
import { getDoc, getDocFromCache } from 'firebase/firestore';

// 範例：檢查計畫 ID 是否存在
let tripDoc;
try {
  tripDoc = await getDoc(doc(db, 'trips', tripId));
} catch (error: any) {
  if (error.code === 'unavailable' || error.message?.includes('offline')) {
    try {
      tripDoc = await getDocFromCache(doc(db, 'trips', tripId));
    } catch (cacheError) {
      // 處理快取錯誤
      tripDoc = { exists: () => false } as any;
    }
  } else {
    throw error;
  }
}
```

#### 1.3 改善 onSnapshot 錯誤處理

在 `subscribeToUserTrips` 和 `subscribeToPlaces` 中添加錯誤處理：

```typescript
onSnapshot(
  q,
  (snapshot) => {
    // 處理資料
  },
  (error) => {
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.warn('⚠️ 離線狀態，使用快取資料');
    } else {
      console.error('監聽失敗:', error);
    }
  }
);
```

### 步驟 2：修復環境變數配置

#### 2.1 修復 app.config.js

確保使用 `EXPO_PUBLIC_` 前綴：

```javascript
config: {
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "fallback-key"
}
```

#### 2.2 設置 EAS Secrets（建置前必須完成）

**方法 1：使用命令（推薦）**

```powershell
# 設置所有 Firebase 環境變數
eas env:create production --name EXPO_PUBLIC_FIREBASE_API_KEY --value "您的值" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "您的值" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "您的值" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "您的值" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "您的值" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_APP_ID --value "您的值" --type string --visibility secret --non-interactive

# 設置 Google Maps API Key
eas env:create production --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "您的值" --type string --visibility secret --non-interactive
```

**方法 2：通過 Expo Dashboard**

1. 前往 https://expo.dev
2. 選擇專案 → Settings → Secrets
3. 逐一添加所有環境變數

**驗證設置：**

```powershell
eas env:list --environment production
```

### 步驟 3：建置 APK

#### 3.1 確認環境變數已設置

```powershell
eas env:list --environment production
```

應該看到所有 7 個環境變數。

#### 3.2 建置 APK

```powershell
eas build --profile production --platform android
```

#### 3.3 下載並測試

1. 建置完成後下載 APK
2. 安裝到手機
3. 測試功能：
   - 創建計畫
   - 加入計畫
   - 查看行程列表
   - 添加景點

---

## 🔍 可能遇到的問題

### 問題 A：建置成功但 App 無法連接 Firebase

**檢查：**
1. 確認所有 EAS Secrets 都已設置
2. 確認環境變數名稱正確（必須以 `EXPO_PUBLIC_` 開頭）
3. 查看 App 啟動時的 console 日誌

**解決：**
- 重新設置 EAS Secrets
- 檢查 Firebase 配置是否正確

### 問題 B：離線時仍然出現錯誤

**檢查：**
1. 確認已啟用離線持久化
2. 確認所有 `getDoc` 調用都有快取處理

**解決：**
- 重新應用離線修復代碼
- 測試網路不穩定情況

### 問題 C：Google Maps 無法顯示

**檢查：**
1. 確認 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` 已設置
2. 確認 API Key 有正確的限制（Android 應用程式）

**解決：**
- 檢查 Google Cloud Console 中的 API Key 限制
- 確認 Android package name 正確

---

## 📝 快速檢查清單

建置 APK 前確認：

- [ ] 已修復離線問題（啟用持久化、修改 getDoc）
- [ ] 已修復環境變數配置（app.config.js）
- [ ] 已設置所有 EAS Secrets（7個環境變數）
- [ ] 已驗證 EAS Secrets（`eas env:list`）
- [ ] 本地 `.env` 文件存在（用於開發測試）

---

## 🚀 推薦執行順序

1. **先修復離線問題**（步驟 1）- 這是核心功能問題
2. **修復環境變數配置**（步驟 2.1）- 確保代碼正確
3. **設置 EAS Secrets**（步驟 2.2）- 建置前必須完成
4. **建置 APK**（步驟 3）
5. **測試並調試**（根據問題 A/B/C 處理）

---

## 💡 重要提醒

1. **不要跳過 EAS Secrets 設置** - 這是建置成功的關鍵
2. **離線問題修復很重要** - 影響用戶體驗
3. **建置前先測試本地開發** - 確保基本功能正常
4. **保留 `.env` 文件用於本地開發** - 但不要提交到 Git

---

## 📞 如果還有問題

1. 檢查建置日誌中的錯誤訊息
2. 查看 App 運行時的 console 輸出
3. 確認所有依賴都已正確安裝
4. 確認 Firebase 和 Google Maps 配置正確

