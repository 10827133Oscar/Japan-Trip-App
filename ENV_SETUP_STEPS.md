# 環境變數設置步驟（手動配置）

## 📋 需要設置的環境變數（共 7 個）

### Firebase 配置（6個）
1. `EXPO_PUBLIC_FIREBASE_API_KEY`
2. `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
3. `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
4. `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
5. `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
6. `EXPO_PUBLIC_FIREBASE_APP_ID`

### Google Maps API（1個）
7. `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 🚀 方法 1：使用命令設置（推薦，最穩定）

### 步驟 1：準備環境變數值

從您的 `.env` 文件或 Firebase Console 獲取所有值。

### 步驟 2：執行設置命令

在 PowerShell 中，**一次執行一個命令**（複製貼上，替換 "您的值"）：

**重要：** 以 `EXPO_PUBLIC_` 開頭的變數必須使用 `--visibility sensitive`（不能使用 `secret`）

```powershell
cd "C:\Users\TEST1\Desktop\日本App Claude\japan-trip-app"

# Firebase 配置（使用 sensitive，因為 EXPO_PUBLIC_ 變數不能使用 secret）
eas env:create production --name EXPO_PUBLIC_FIREBASE_API_KEY --value "您的FIREBASE_API_KEY" --type string --visibility sensitive --non-interactive

eas env:create production --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "您的FIREBASE_AUTH_DOMAIN" --type string --visibility sensitive --non-interactive

eas env:create production --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "您的FIREBASE_PROJECT_ID" --type string --visibility sensitive --non-interactive

eas env:create production --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "您的FIREBASE_STORAGE_BUCKET" --type string --visibility sensitive --non-interactive

eas env:create production --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "您的FIREBASE_MESSAGING_SENDER_ID" --type string --visibility sensitive --non-interactive

eas env:create production --name EXPO_PUBLIC_FIREBASE_APP_ID --value "您的FIREBASE_APP_ID" --type string --visibility sensitive --non-interactive

# Google Maps API Key
eas env:create production --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "您的GOOGLE_MAPS_API_KEY" --type string --visibility sensitive --non-interactive
```

### 步驟 3：驗證設置

```powershell
eas env:list --environment production
```

應該看到所有 7 個環境變數。

---

## 🌐 方法 2：通過 Expo Dashboard（圖形界面，更直觀）

### 步驟 1：登入 Expo Dashboard

1. 前往 https://expo.dev
2. 登入您的帳號
3. 選擇專案：`japan-trip-app`

### 步驟 2：進入 Secrets 設置

1. 點擊左側選單的 **Settings**
2. 點擊 **Secrets** 或 **Environment Variables**
3. 選擇 **production** 環境

### 步驟 3：添加環境變數

對每個環境變數：
1. 點擊 **Create Secret** 或 **Add Variable**
2. 輸入名稱（例如：`EXPO_PUBLIC_FIREBASE_API_KEY`）
3. 輸入值（從您的 `.env` 文件複製）
4. 選擇類型：**String**
5. 選擇可見性：**Sensitive**（⚠️ 重要：以 `EXPO_PUBLIC_` 開頭的變數不能使用 `Secret`，必須使用 `Sensitive`）
6. 點擊 **Create** 或 **Save**

重複步驟 1-6，設置所有 7 個環境變數。

### 步驟 4：驗證

在 Dashboard 中應該看到所有 7 個環境變數都已設置。

---

## ✅ 驗證檢查清單

設置完成後，確認：

- [ ] 所有 7 個環境變數都已設置
- [ ] 環境變數名稱正確（必須以 `EXPO_PUBLIC_` 開頭）
- [ ] 環境變數值正確（沒有多餘的空格或引號）
- [ ] 設置在 `production` 環境中
- [ ] 通過 `eas env:list` 或 Dashboard 驗證成功

---

## 🔍 如何獲取環境變數值

### Firebase 配置值

1. 前往 [Firebase Console](https://console.firebase.google.com)
2. 選擇您的專案
3. 點擊專案設定（齒輪圖示）
4. 在「一般」標籤中，向下滾動到「您的應用程式」
5. 找到 Web 應用程式配置
6. 複製 `firebaseConfig` 中的值

### Google Maps API Key

1. 前往 [Google Cloud Console](https://console.cloud.google.com)
2. 選擇您的專案
3. 左側選單：「API和服務」→「憑證」
4. 找到您的 API 金鑰
5. 複製 API 金鑰值

---

## ⚠️ 常見錯誤

### 錯誤 1：環境變數名稱錯誤

**錯誤：** 使用 `GOOGLE_MAPS_API_KEY` 而不是 `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`

**解決：** 所有環境變數必須以 `EXPO_PUBLIC_` 開頭才能在客戶端代碼中訪問

### 錯誤 2：值中包含引號

**錯誤：** `--value "your-value"` 中的值本身包含引號

**解決：** 確保值本身不包含引號，只有命令參數需要引號

### 錯誤 3：設置在錯誤的環境

**錯誤：** 設置在 `development` 而不是 `production`

**解決：** 確保使用 `production` 環境（建置 APK 時使用）

### 錯誤 4：EXPO_PUBLIC_ 變數使用 Secret 可見性

**錯誤：** `Variables prefixed with "EXPO_PUBLIC_" can't have "Secret" visibility.`

**原因：** Expo 不允許以 `EXPO_PUBLIC_` 開頭的變數使用 `Secret` 可見性，因為這些變數會被編譯到客戶端代碼中

**解決：** 使用 `Sensitive` 可見性（在 Dashboard 中選擇 `Sensitive`，在命令中使用 `--visibility sensitive`）

---

## 📝 注意事項

1. **不要將 `.env` 文件提交到 Git**（已在 `.gitignore` 中排除）
2. **EAS Secrets 是專案級別的**，所有建置配置都會使用相同的 secrets
3. **環境變數值會編譯到 App 中**，所以請確保 API Key 有適當的限制
4. **設置後立即驗證**，避免建置時才發現問題

---

## 🎯 推薦方法

**建議使用方法 1（命令）**，因為：
- 更快速（可以複製貼上）
- 更準確（不會有輸入錯誤）
- 可以批量執行
- 有明確的成功/失敗訊息

但如果您更喜歡圖形界面，方法 2 也很穩定。

