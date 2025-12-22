# 建置前檢查清單 ✅

## 📋 已完成的修復

### ✅ 問題 1：離線錯誤（已完成）
- [x] 啟用 Firestore 離線持久化
- [x] 修改所有 `getDoc` 調用以支援快取讀取
- [x] 改善 `onSnapshot` 錯誤處理
- [x] 添加 loading 超時機制

### ✅ 問題 2：環境變數配置（已完成）
- [x] 修復 `app.config.js` 中的環境變數名稱
- [x] 設置所有 7 個 EAS Secrets
- [x] 使用正確的可見性設置（Sensitive）

---

## 🔍 建置前檢查項目

### 1. 代碼檢查 ✅
- [x] 無 linter 錯誤
- [x] 無語法錯誤
- [x] 無類型錯誤
- [x] 所有導入正確

### 2. 配置文件檢查

#### app.config.js ✅
- [x] 使用 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`（正確）
- [x] 有 fallback API Key（可選，但已設置）
- [x] 所有必要欄位已填寫

#### eas.json ⚠️ 需要檢查
- [ ] `production` profile 是否有 Android 配置？
- [ ] 是否需要指定 `buildType`？

#### package.json ✅
- [x] 所有依賴版本正確
- [x] 無缺失的依賴

### 3. 資源文件檢查 ✅
- [x] `assets/icon.png` 存在
- [x] `assets/splash-icon.png` 存在
- [x] `assets/adaptive-icon.png` 存在

### 4. 環境變數檢查 ✅
- [x] 所有 7 個環境變數已設置
- [x] 設置在 `production` 環境
- [x] 使用 `Sensitive` 可見性

### 5. Firebase 配置檢查 ✅
- [x] Firebase 配置正確
- [x] 離線持久化已啟用
- [x] 錯誤處理完善

---

## ⚠️ 發現的問題

### 問題 1：eas.json 的 production profile 配置不完整

**當前配置：**
```json
"production": {
  "autoIncrement": true
}
```

**建議配置：**
```json
"production": {
  "autoIncrement": true,
  "distribution": "store",
  "android": {
    "buildType": "app-bundle"
  }
}
```

**影響：**
- 如果只建置 APK，當前配置可以
- 但如果要上架到 Google Play，建議使用 `app-bundle`
- 當前配置應該可以建置 APK

### 問題 2：硬編碼的 Fallback API Key

**位置：** `app.config.js` 第 25 和 51 行

**當前：**
```javascript
googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDHkb76jce-ulZ1zWruhppb68vJzKm8UG8"
```

**說明：**
- 這是 fallback，如果環境變數未設置會使用這個值
- 由於您已經設置了 EAS Secrets，這個 fallback 不會被使用
- **建議：** 可以保留（作為備用），或移除（強制使用環境變數）

---

## ✅ 可以建置的確認

### 核心功能
- ✅ 離線問題已修復
- ✅ 環境變數已配置
- ✅ 代碼無錯誤
- ✅ 資源文件完整

### 建置配置
- ✅ `app.config.js` 正確
- ⚠️ `eas.json` 的 production profile 較簡潔，但應該可以建置 APK
- ✅ 所有依賴已安裝

---

## 🚀 建置命令

### 建置 APK（推薦）

```powershell
cd "C:\Users\TEST1\Desktop\日本App Claude\japan-trip-app"
eas build --profile production --platform android
```

### 如果遇到問題，可以嘗試：

```powershell
# 清除快取重新建置
eas build --profile production --platform android --clear-cache
```

---

## 📝 建置後測試清單

建置完成後，請測試：

### 基本功能
- [ ] App 可以正常啟動
- [ ] 可以創建計畫
- [ ] 可以加入計畫
- [ ] 行程列表正常顯示（不會 loading 太久）

### 核心功能
- [ ] 可以添加景點（不會出現離線錯誤）
- [ ] 地圖可以正常顯示
- [ ] 地圖標記正確顯示
- [ ] 可以查看景點詳情

### 離線功能
- [ ] 關閉網路後，可以查看已載入的計畫
- [ ] 不會出現 "Failed to get doc" 錯誤
- [ ] Loading 不會持續太久

---

## ⚠️ 如果建置失敗

### 常見錯誤 1：環境變數未設置

**錯誤訊息：** App 運行時無法連接 Firebase

**解決：**
1. 確認所有 EAS Secrets 已設置：`eas env:list --environment production`
2. 重新設置缺失的環境變數

### 常見錯誤 2：資源文件缺失

**錯誤訊息：** Cannot find module './assets/icon.png'

**解決：**
1. 確認所有資源文件存在
2. 檢查 `app.config.js` 中的路徑是否正確

### 常見錯誤 3：依賴問題

**錯誤訊息：** Module not found

**解決：**
```powershell
npm install
```

### 常見錯誤 4：建置配置問題

**錯誤訊息：** Build configuration error

**解決：**
1. 檢查 `eas.json` 配置
2. 檢查 `app.config.js` 配置
3. 查看建置日誌找出具體錯誤

---

## 🎯 總結

### 當前狀態
- ✅ **代碼：** 無錯誤，已修復離線問題
- ✅ **配置：** 環境變數已設置，配置文件正確
- ✅ **資源：** 所有必要文件存在
- ⚠️ **eas.json：** 配置較簡潔，但應該可以建置

### 建議
1. **可以直接建置** - 所有核心問題已解決
2. **如果建置失敗** - 查看建置日誌，根據錯誤訊息處理
3. **建置成功後** - 按照測試清單測試所有功能

---

## 📞 需要幫助？

如果建置時遇到問題：
1. 查看建置日誌中的錯誤訊息
2. 檢查是否所有環境變數都已設置
3. 確認所有依賴都已安裝
4. 查看 Expo 文檔或錯誤訊息

