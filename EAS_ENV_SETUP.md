# EAS Build 環境變數設置指南

## ⚠️ 重要：建置 APK 前必須設置環境變數

使用 `eas build` 建置 APK 時，環境變數不會自動從 `.env` 文件讀取。您需要通過 **EAS Secrets** 來設置環境變數。

## 📋 需要設置的環境變數

### Firebase 配置（6個）
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### Google Maps API（1個）
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

### Google OAuth（可選，如果使用 Google 登入）
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

## 🚀 設置步驟

### 方法 1：使用 EAS CLI 命令（推薦）

```bash
# 設置 Firebase 環境變數（使用新的 eas env:create 命令）
# 注意：必須指定 --visibility secret 和 --non-interactive 才能避免交互式提示
eas env:create production --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-firebase-api-key" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "your-project.firebaseapp.com" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "your-project-id" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "your-project.appspot.com" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "123456789" --type string --visibility secret --non-interactive
eas env:create production --name EXPO_PUBLIC_FIREBASE_APP_ID --value "1:123456789:web:abcdef" --type string --visibility secret --non-interactive

# 設置 Google Maps API Key
eas env:create production --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "your-google-maps-api-key" --type string --visibility secret --non-interactive
```

**注意：** `eas secret:create` 命令已被棄用，請使用 `eas env:create` 代替。

### 方法 2：通過 EAS 網站設置

1. 前往 [Expo Dashboard](https://expo.dev)
2. 選擇您的專案
3. 進入 **Settings** → **Secrets**
4. 點擊 **Create Secret**
5. 輸入環境變數名稱和值
6. 重複步驟 4-5 設置所有環境變數

## ✅ 驗證設置

設置完成後，可以查看已設置的環境變數：

```bash
eas env:list --environment production
```

## 🔍 檢查環境變數是否正確

建置時，環境變數會自動注入到建置過程中。如果環境變數缺失，建置可能會失敗或 App 運行時會出現錯誤。

### 檢查方法：

1. **建置前檢查**：執行 `eas secret:list` 確認所有必要的環境變數都已設置
2. **建置後檢查**：查看建置日誌，確認沒有環境變數相關的錯誤
3. **運行時檢查**：App 啟動時會輸出 Firebase 配置資訊到 console

## ⚠️ 常見問題

### Q: 為什麼建置後 App 無法連接到 Firebase？

**A:** 可能是環境變數沒有正確設置。檢查：
1. 確認所有 Firebase 環境變數都已通過 `eas env:create` 設置
2. 確認環境變數名稱正確（必須以 `EXPO_PUBLIC_` 開頭）
3. 確認環境變數值正確（沒有多餘的空格或引號）
4. 確認環境變數設置在 `production` 環境中（使用 `--environment production`）

### Q: 本地開發時需要設置 EAS Secrets 嗎？

**A:** 不需要。本地開發時，環境變數會從 `.env` 文件讀取。只需要確保：
1. 專案根目錄有 `.env` 文件
2. `.env` 文件中包含所有必要的環境變數

### Q: 如何更新已設置的環境變數？

**A:** 使用以下命令更新：

```bash
eas env:delete --name EXPO_PUBLIC_FIREBASE_API_KEY --environment production
eas env:create --name EXPO_PUBLIC_FIREBASE_API_KEY --value "new-value" --type string --environment production
```

或者直接通過 EAS Dashboard 更新。

## 📝 注意事項

1. **不要將 `.env` 文件提交到 Git**（已在 `.gitignore` 中排除）
2. **EAS Secrets 是專案級別的**，所有建置配置都會使用相同的 secrets
3. **環境變數名稱必須以 `EXPO_PUBLIC_` 開頭**，才能在客戶端代碼中訪問
4. **建置後環境變數會被編譯到 App 中**，所以請確保 API Key 有適當的限制

