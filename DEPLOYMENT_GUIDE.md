# 📦 應用部署指南

**最後更新:** 2025-12-19
**狀態:** 準備上架

---

## 📋 目錄

1. [EAS CLI 安裝](#1-eas-cli-安裝)
2. [應用圖示準備](#2-應用圖示準備)
3. [建構應用](#3-建構應用)
4. [提交到商店](#4-提交到商店)
5. [常見問題](#5-常見問題)

---

## 1. EAS CLI 安裝

### 安裝 EAS CLI

```bash
# 全域安裝 EAS CLI
npm install -g eas-cli

# 檢查安裝
eas --version
```

### 登入 Expo 帳號

```bash
# 登入（如果還沒有帳號，會引導你註冊）
eas login

# 檢查登入狀態
eas whoami
```

### 配置專案

```bash
# 在專案目錄中
cd japan-trip-app

# 配置 EAS（如果還沒配置）
eas build:configure
```

---

## 2. 應用圖示準備

### 需要的圖示檔案

你需要準備以下圖示（目前 app.json 中已經配置）：

```
assets/
  ├── icon.png              (1024x1024) - 主要圖示
  ├── adaptive-icon.png     (1024x1024) - Android 自適應圖示
  ├── splash-icon.png       (1284x2778) - 啟動畫面
  └── favicon.png          (48x48)     - Web 圖示
```

### 圖示設計建議

**主題顏色:** `#007AFF` (已在 app.json 設定)

**設計建議:**
- 使用日本相關元素（如：富士山、櫻花、地圖標記等）
- 保持簡潔，容易辨識
- 避免太多文字
- 確保在小尺寸下仍清晰可見

**推薦工具:**
- [Canva](https://www.canva.com/) - 線上設計工具
- [Figma](https://www.figma.com/) - 專業設計工具
- [App Icon Generator](https://www.appicon.co/) - 自動生成各種尺寸

### 快速生成圖示

如果你有一個 1024x1024 的 PNG 圖示：

```bash
# 使用 Expo 工具生成所有需要的尺寸
npx expo-splash-screen --background-color "#007AFF"
```

---

## 3. 建構應用

### 3.1 開發版本（測試用）

```bash
# iOS 開發版本（在模擬器上運行）
eas build --profile development --platform ios

# Android 開發版本（生成 APK）
eas build --profile development --platform android
```

### 3.2 預覽版本（內部測試）

```bash
# iOS 預覽版本
eas build --profile preview --platform ios

# Android 預覽版本（APK 檔案）
eas build --profile preview --platform android

# 同時建構兩個平台
eas build --profile preview --platform all
```

### 3.3 正式版本（上架用）

```bash
# iOS 正式版本
eas build --profile production --platform ios

# Android 正式版本（AAB 檔案）
eas build --profile production --platform android

# 同時建構兩個平台
eas build --profile production --platform all
```

**建構說明:**
- 第一次建構會比較久（10-20分鐘）
- 建構在雲端進行，不佔用本機資源
- 建構完成後會收到通知，可以下載檔案

---

## 4. 提交到商店

### 4.1 iOS App Store

#### 前置準備

1. **註冊 Apple Developer 帳號** ($99/年)
   - 前往 [Apple Developer](https://developer.apple.com/)
   - 註冊並付費

2. **創建 App 記錄**
   - 登入 [App Store Connect](https://appstoreconnect.apple.com/)
   - 點擊「我的 App」→「+」→「新增 App」
   - 填寫基本資訊：
     - 平台：iOS
     - 名稱：日本旅遊助手
     - 主要語言：繁體中文
     - Bundle ID：`com.oscarteng.japantripapp`
     - SKU：`japan-trip-app-001`

3. **更新 eas.json**

   編輯 `eas.json` 中的 iOS 提交設定：
   ```json
   "ios": {
     "appleId": "你的Apple ID",
     "ascAppId": "從App Store Connect複製的App ID",
     "appleTeamId": "從Apple Developer複製的Team ID"
   }
   ```

#### 提交到 App Store

```bash
# 方法 1: 使用 EAS Submit（推薦）
eas submit --platform ios --profile production

# 方法 2: 手動上傳
# 建構完成後，從 EAS 下載 .ipa 檔案
# 使用 Transporter App 上傳到 App Store Connect
```

#### 填寫 App Store 資訊

在 App Store Connect 填寫：

1. **App 資訊**
   - 名稱：日本旅遊助手
   - 副標題：家庭協作旅程規劃
   - 類別：旅遊、工具程式

2. **定價與供應狀況**
   - 價格：免費

3. **App 隱私**
   - 位置：用於顯示地圖和導航
   - 資料不會分享給第三方

4. **版本資訊**
   - 版本：1.0.0
   - 版權：© 2025 Oscar Teng
   - 截圖：準備 5-8 張不同場景的截圖
   - 描述：（見下方範例）

5. **提交審核**
   - 填寫聯絡資訊
   - 提交審核（通常 1-3 天）

---

### 4.2 Android Google Play

#### 前置準備

1. **註冊 Google Play Console 帳號** ($25 一次性)
   - 前往 [Google Play Console](https://play.google.com/console/)
   - 註冊並付費

2. **創建應用**
   - 點擊「建立應用程式」
   - 填寫基本資訊：
     - 應用程式名稱：日本旅遊助手
     - 預設語言：繁體中文
     - 應用程式類型：應用程式
     - 免費或付費：免費

3. **設定 Google Service Account**（用於自動上傳）

   a. 在 Google Cloud Console：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/)
   - 選擇你的專案
   - 左側選單：「IAM 與管理」→「服務帳戶」
   - 建立服務帳戶
   - 下載 JSON 金鑰，重新命名為 `google-services-key.json`
   - 放在專案根目錄

   b. 在 Google Play Console：
   - 「設定」→「API 存取權」
   - 關聯剛建立的服務帳戶
   - 授予「管理員（所有權限）」權限

#### 提交到 Google Play

```bash
# 使用 EAS Submit
eas submit --platform android --profile production
```

**或手動上傳：**
1. 建構完成後下載 `.aab` 檔案
2. 在 Google Play Console 上傳到「內部測試」軌道
3. 測試通過後，提升到「正式版」

#### 填寫 Google Play 資訊

在 Google Play Console 填寫：

1. **商店資訊**
   - 應用程式名稱：日本旅遊助手
   - 簡短說明：（50 字）
   - 完整說明：（見下方範例）
   - 應用程式圖示：1024x1024
   - 精選圖片：1024x500

2. **分類**
   - 應用程式類別：旅遊與當地資訊
   - 標記：家庭、旅遊規劃、協作

3. **定價與發布**
   - 國家/地區：選擇要發布的地區
   - 價格：免費

4. **內容分級**
   - 填寫問卷（通常為「所有人」）

5. **發布軌道**
   - 內部測試 → 公開測試 → 正式版
   - 建議先從內部測試開始

---

## 5. 應用商店文案範例

### App 名稱
**中文：** 日本旅遊助手
**英文：** Japan Trip Planner

### 副標題（iOS）
家庭協作式旅程規劃工具

### 簡短描述（Google Play，80字）
專為家庭旅遊設計的協作式規劃App。無需註冊，即可與家人即時同步景點、查看地圖、規劃路線。支援密碼保護計畫，輕鬆管理日本旅遊行程。

### 完整描述

```
🗾 日本旅遊助手 - 讓家庭旅遊規劃更簡單

專為家庭旅遊設計的協作式旅程規劃App，讓你和家人一起規劃完美的日本之旅！

✨ 主要功能

📱 無需註冊
• 無需 Google 帳號
• 設定暱稱和代表色即可開始
• 資料安全存儲在手機本地

👨‍👩‍👧‍👦 多人協作
• 創建計畫並分享 ID 和密碼給家人
• 所有成員即時同步編輯
• 參與者顏色區分，清楚知道誰添加了哪個景點

🗺️ 地圖標記
• Google Maps 整合
• 在地圖上標記所有景點
• 不同類型景點使用不同顏色
• 點擊地圖直接添加景點

📅 景點管理
• 按天數規劃行程
• 按類型篩選景點（寺廟、餐廳、購物等）
• 完整的景點資訊（名稱、地址、類型、備註）
• 拖曳排序，輕鬆調整順序

🌤️ 天氣資訊
• 顯示目的地即時天氣
• 幫助你做好旅行準備

🔐 隱私安全
• 計畫密碼保護
• 只有知道 ID 和密碼的人才能加入
• 資料加密儲存
• 不收集個人資訊

💡 適合誰使用？

• 計畫日本家庭旅遊的家庭
• 需要多人協作規劃的團體
• 想要有條理管理景點的旅行者
• 重視隱私的用戶

📊 完全免費

本 App 完全免費，無廣告，無內購。
使用 Firebase 免費額度，一般家庭使用完全足夠。

🎯 開始使用

1. 下載 App 並設定暱稱和顏色
2. 創建計畫（輸入名稱、目的地、密碼）
3. 分享計畫 ID 和密碼給家人
4. 開始添加景點，規劃你的日本之旅！

🌟 我們的承諾

• 持續更新和改進
• 用戶隱私第一
• 快速回應用戶反饋

準備好規劃你的日本之旅了嗎？立即下載開始吧！🗼
```

### 關鍵字（iOS App Store）

```
日本旅遊, 旅遊規劃, 行程規劃, 景點管理, 家庭旅遊,
協作工具, 地圖標記, 路線規劃, 旅行助手, 日本自由行
```

### 關鍵字（Google Play）

```
日本, 旅遊, 規劃, 行程, 景點, 地圖, 協作, 家庭, 自由行, 東京
```

---

## 6. 截圖準備

### 需要的截圖尺寸

**iOS:**
- 6.7" (iPhone 14 Pro Max): 1290 x 2796
- 6.5" (iPhone 11 Pro Max): 1242 x 2688
- 5.5" (iPhone 8 Plus): 1242 x 2208
- iPad Pro (12.9"): 2048 x 2732

**Android:**
- 16:9 比例
- 最小 320px
- 最大 3840px
- 建議 1080 x 1920

### 截圖內容建議

準備 5-8 張截圖，展示：

1. **歡迎頁面** - 首次使用設定暱稱和顏色
2. **主頁** - 計畫列表和創建計畫
3. **景點列表** - 展示多個景點，篩選功能
4. **地圖視圖** - 地圖上的景點標記
5. **景點詳情** - 編輯景點的介面
6. **多人協作** - 顯示多個參與者的顏色
7. **計畫詳情** - 查看計畫 ID 和成員
8. **天氣組件** - 顯示天氣資訊

**截圖技巧:**
- 使用真實的日本景點資料（如：淺草寺、晴空塔等）
- 在模擬器或實機上截圖
- 使用 [Screenshot Generator](https://www.screely.com/) 美化截圖
- 添加簡短的文字說明

---

## 7. 常見問題

### Q1: 建構失敗怎麼辦？

**A:** 檢查以下項目：
- `.env` 檔案配置正確
- `app.json` 中的 bundle identifier 和 package 沒有語法錯誤
- 所有依賴都已安裝（`npm install`）
- 查看 EAS 建構日誌找出錯誤原因

```bash
# 清除快取重新建構
eas build --clear-cache --platform all
```

### Q2: 如何測試建構的 App？

**iOS:**
```bash
# 使用 TestFlight
eas submit --platform ios --profile preview

# 或下載 .ipa 並使用 Apple Configurator 安裝
```

**Android:**
```bash
# 下載 APK 直接安裝到設備
# 或提交到內部測試軌道
eas submit --platform android --profile preview
```

### Q3: 更新版本號

更新 `app.json`：
```json
{
  "expo": {
    "version": "1.0.1",  // 更新版本號
    "ios": {
      "buildNumber": "2"  // iOS build 號碼
    },
    "android": {
      "versionCode": 2    // Android version code
    }
  }
}
```

然後重新建構：
```bash
eas build --profile production --platform all
```

### Q4: 如何處理 API Key 安全？

**不要將 API Key 提交到 Git！**

在 `.gitignore` 中添加：
```
.env
.env.local
google-services-key.json
```

使用 EAS Secrets 管理敏感資訊：
```bash
# 設定 secret
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "your-key"

# 在 eas.json 中引用
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY": "@GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### Q5: 建構需要多久時間？

- **第一次建構:** 10-20 分鐘
- **後續建構:** 5-10 分鐘
- **同時建構兩個平台:** 15-30 分鐘

建構是在雲端進行，你可以關閉終端繼續工作。

---

## 8. 檢查清單

### 建構前檢查

- [ ] `app.json` 配置正確
- [ ] `eas.json` 配置完成
- [ ] 應用圖示已準備
- [ ] `.env` 檔案配置正確
- [ ] 所有功能測試通過
- [ ] 移除 console.log 和調試代碼
- [ ] 版本號正確

### 提交前檢查

- [ ] 商店截圖已準備（5-8張）
- [ ] 應用描述已撰寫
- [ ] 隱私政策已準備
- [ ] 聯絡資訊正確
- [ ] 定價設定正確（免費）
- [ ] 年齡分級正確

### 發布後

- [ ] 在實際設備測試下載的 App
- [ ] 回應用戶評論
- [ ] 監控崩潰報告
- [ ] 準備更新計劃

---

## 9. 有用的連結

- [Expo Application Services](https://docs.expo.dev/eas/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [EAS Build 文檔](https://docs.expo.dev/build/introduction/)
- [EAS Submit 文檔](https://docs.expo.dev/submit/introduction/)

---

**準備好了嗎？開始建構你的 App 吧！** 🚀

如有問題，請查看 [Expo 官方文檔](https://docs.expo.dev/) 或在專案 Issues 中提問。
