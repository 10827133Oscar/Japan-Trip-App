# 🌐 網頁版部署指南

**專案：** 日本旅遊助手
**目標：** 部署網頁版到 Vercel（完全免費）

---

## 🎉 準備工作（已完成）

- ✅ 網頁版地圖功能已實作
- ✅ 生產檔案已建構（`dist` 目錄）
- ✅ Vercel 配置檔案已創建（`vercel.json`）
- ✅ Vercel CLI 已安裝

---

## 🚀 部署步驟

### 步驟 1: 註冊 Vercel 帳號

1. 前往 [https://vercel.com](https://vercel.com)
2. 點擊「Sign Up」註冊
3. 推薦使用 **GitHub 帳號** 登入（最簡單）

### 步驟 2: 在命令列登入 Vercel

打開命令列（CMD或PowerShell），輸入：

```bash
cd "C:\Users\TEST1\Desktop\日本App Claude\japan-trip-app"
vercel login
```

按照提示完成登入（會在瀏覽器中打開）

### 步驟 3: 部署到 Vercel

登入後，執行：

```bash
vercel
```

**按照提示回答以下問題：**

1. **Set up and deploy "..."?** → 按 `Y`（是）
2. **Which scope?** → 選擇你的帳號（按 Enter）
3. **Link to existing project?** → 按 `N`（否，這是新專案）
4. **What's your project's name?** → 輸入 `japan-trip-app` 或按 Enter 使用預設名稱
5. **In which directory is your code located?** → 按 Enter（使用當前目錄）
6. **Want to modify these settings?** → 按 `N`（否）

**完成！** Vercel 會自動：
- 上傳你的檔案
- 部署網頁版
- 給你一個網址（例如：`https://japan-trip-app.vercel.app`）

---

## 🌐 部署後的網址

部署完成後，你會看到類似這樣的訊息：

```
✅ Production: https://japan-trip-app-xxx.vercel.app [copied to clipboard]
```

**這就是你的網頁版連結！** 可以分享給所有人使用。

---

## 📱 如何使用網頁版

### 在手機上使用

1. **iPhone 用戶：**
   - 打開 Safari 瀏覽器
   - 輸入網址（例如：`japan-trip-app.vercel.app`）
   - 點擊「分享」按鈕
   - 選擇「加入主畫面」
   - 現在可以像 App 一樣使用！

2. **Android 用戶：**
   - 打開 Chrome 瀏覽器
   - 輸入網址
   - 點擊右上角「...」選單
   - 選擇「新增至主畫面」
   - 完成！

### 在電腦上使用

1. 打開瀏覽器
2. 輸入網址
3. 可以將網址加入書籤

---

## 🔄 如何更新網頁版

當你修改代碼後，想要更新網頁版：

```bash
# 1. 重新建構
npm run build

# 2. 重新部署
vercel --prod
```

Vercel 會自動更新你的網站，所有用戶立即看到新版本！

---

## ⚙️ 環境變數設定

**重要：** 你的 Firebase 和 Google Maps API Key 需要在 Vercel 設定環境變數。

### 方法 1: 在 Vercel 網站設定

1. 登入 [https://vercel.com](https://vercel.com)
2. 進入你的專案
3. 點擊「Settings」→「Environment Variables」
4. 添加以下變數：

```
EXPO_PUBLIC_FIREBASE_API_KEY = (你的 Firebase API Key)
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = (你的 Firebase Auth Domain)
EXPO_PUBLIC_FIREBASE_PROJECT_ID = (你的 Firebase Project ID)
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = (你的 Storage Bucket)
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (你的 Sender ID)
EXPO_PUBLIC_FIREBASE_APP_ID = (你的 App ID)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = (你的 Google Maps API Key)
```

5. 點擊「Save」
6. 重新部署（`vercel --prod`）

### 方法 2: 使用命令列設定

```bash
vercel env add EXPO_PUBLIC_FIREBASE_API_KEY
# 貼上你的 API Key
# 選擇 Production
# 重複上述步驟設定所有變數
```

---

## 🔍 檢查部署狀態

1. 前往 [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. 查看你的專案
3. 可以看到：
   - 部署歷史
   - 訪問量
   - 效能數據

---

## 💰 成本

- **Vercel Hobby 方案：完全免費**
  - ✅ 無限網站
  - ✅ 自動 HTTPS
  - ✅ 100 GB 流量/月（足夠使用）
  - ✅ 自動 CDN 加速

---

## 🐛 常見問題

### Q1: 部署後看不到地圖？

**A:** 檢查 Google Maps API Key 的設定：
1. 確認環境變數已設定
2. 確認 API Key 已啟用「Maps JavaScript API」
3. 確認 API Key 沒有網域限制，或已加入 Vercel 網域

### Q2: 部署失敗怎麼辦？

**A:** 檢查以下幾點：
1. 確認 `dist` 目錄存在且有檔案
2. 執行 `npm run build` 重新建構
3. 查看 Vercel 的錯誤訊息

### Q3: 如何使用自訂網域？

**A:**
1. 在 Vercel Dashboard 進入專案
2. 點擊「Settings」→「Domains」
3. 輸入你的網域（例如：`trip.example.com`）
4. 按照指示設定 DNS

### Q4: 網頁版和 APK 版本資料會同步嗎？

**A:** 會！因為都使用相同的 Firebase 資料庫，所以：
- ✅ Android APK 添加的景點，網頁版能看到
- ✅ 網頁版添加的景點，APK 也能看到
- ✅ 所有平台即時同步

---

## 📊 分發策略

現在你有三種分發方式：

| 平台 | 方式 | 成本 | 適合 |
|------|------|------|------|
| **Android** | APK 直接分發 | 免費 | 家人朋友 |
| **iOS** | 網頁版 | 免費 | iPhone 用戶 |
| **電腦** | 網頁版 | 免費 | 在家規劃 |

**總成本：$0** 🎉

---

## 🎯 快速開始

```bash
# 1. 登入 Vercel
vercel login

# 2. 部署
vercel

# 3. 完成！複製網址分享給大家
```

---

## 📝 分享給家人的訊息範本

```
🌐 日本旅遊助手 - 網頁版上線了！

iPhone 用戶請用這個網址：
https://japan-trip-app-xxx.vercel.app

使用方式：
1. 用 Safari 打開上面的網址
2. 點擊「分享」→「加入主畫面」
3. 就可以像 App 一樣使用了！

功能：
✅ 創建/加入旅遊計畫
✅ 添加/編輯景點
✅ 查看地圖
✅ 多人即時同步

Android 用戶繼續使用 APK 版本就好！
```

---

**準備好部署了嗎？** 🚀

執行 `vercel login` 開始吧！

有任何問題隨時問我。
