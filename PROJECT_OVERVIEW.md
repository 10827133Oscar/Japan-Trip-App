# 📱 日本旅遊助手 - 項目概覽

## 🎯 項目簡介

這是一個為家庭日本旅遊設計的跨平台移動應用程式，支持多人實時協作、地圖標記、智能路線規劃等功能。

## 📊 項目統計

- **總文件數**：30+ 個文件
- **代碼行數**：約 3000+ 行
- **開發時間**：可在 5 天內完成
- **成本**：完全免費（使用免費服務）

## 🏗️ 項目結構

```
japan-trip-app/
├── app/                          # Expo Router 頁面
│   ├── (tabs)/                   # Tab 導航頁面
│   │   ├── _layout.tsx          # Tab 佈局配置
│   │   ├── index.tsx            # 首頁（行程總覽）
│   │   ├── places.tsx           # 景點列表頁
│   │   ├── map.tsx              # 地圖查看頁
│   │   └── profile.tsx          # 個人設定頁
│   ├── place-detail/
│   │   └── [id].tsx             # 景點詳情/編輯頁（動態路由）
│   ├── _layout.tsx              # 根佈局（認證路由）
│   └── login.tsx                # 登入頁面
│
├── components/                   # React 組件
│   ├── PlaceCard.tsx            # 景點卡片組件
│   ├── MapView.tsx              # 地圖顯示組件
│   └── RouteView.tsx            # 路線顯示組件
│
├── services/                     # 服務層
│   ├── firebase.ts              # Firebase 初始化配置
│   ├── auth.ts                  # 認證服務（Google 登入）
│   ├── firestore.ts             # Firestore 資料庫操作
│   └── maps.ts                  # Google Maps API 服務
│
├── hooks/                        # 自定義 React Hooks
│   ├── useAuth.ts               # 認證狀態管理
│   ├── usePlaces.ts             # 景點資料管理
│   └── useTrip.ts               # 旅程資料管理
│
├── types/                        # TypeScript 類型定義
│   └── index.ts                 # 資料模型定義
│
├── config/                       # 配置文件目錄
│
├── assets/                       # 靜態資源（圖片、字體等）
│
├── .env.example                  # 環境變數範例
├── .env                          # 環境變數（需配置）
├── .gitignore                    # Git 忽略文件
├── app.json                      # Expo 配置
├── package.json                  # npm 依賴配置
├── tsconfig.json                 # TypeScript 配置
├── firestore.rules               # Firestore 安全規則
├── README.md                     # 詳細說明文檔
├── SETUP_GUIDE.md                # 快速設定指南
└── PROJECT_OVERVIEW.md           # 項目概覽（本文件）
```

## ✨ 核心功能

### 1. 用戶認證
- **Google 登入**：使用 Firebase Authentication
- **安全性**：OAuth 2.0 認證流程
- **自動狀態管理**：useAuth Hook 管理登入狀態

### 2. 旅程管理
- **創建旅程**：設定旅程名稱、目的地、日期
- **多旅程支持**：可以創建多個旅程
- **成員管理**：支持多人協作（共享帳號）

### 3. 景點管理
- **CRUD 操作**：新增、編輯、刪除景點
- **地理編碼**：自動將地址轉換為經緯度座標
- **分類標籤**：可為景點添加類型（寺廟、餐廳等）
- **行程規劃**：可指定景點在第幾天參觀
- **備註功能**：記錄景點的注意事項

### 4. 地圖功能
- **Google Maps 整合**：使用原生地圖組件
- **景點標記**：所有景點顯示在地圖上
- **自動縮放**：根據景點位置自動調整地圖範圍
- **當前位置**：顯示用戶當前位置
- **路線顯示**：在地圖上繪製規劃的路線

### 5. 路線規劃
- **智能規劃**：使用 Google Directions API
- **多景點支持**：支持多個途經點
- **距離和時間**：顯示總距離和預計時間
- **步行導航**：優化為步行模式
- **路線優化**：可重新規劃最佳路線

### 6. 多人協作
- **即時同步**：使用 Firestore 實時監聽
- **自動更新**：任何成員的修改立即同步到所有設備
- **無需額外配置**：Firestore 內建即時同步功能

## 🛠️ 技術棧詳解

### 前端框架
- **React Native 0.76.5**：跨平台移動開發
- **Expo SDK 54**：簡化開發流程
- **Expo Router**：基於文件系統的路由

### 狀態管理
- **React Hooks**：useState, useEffect, useContext
- **自定義 Hooks**：封裝業務邏輯
- **無需 Redux**：中小型 App 使用 Hooks 足夠

### 後端服務（BaaS）
- **Firebase Authentication**：用戶認證
- **Cloud Firestore**：NoSQL 資料庫
- **Firebase Storage**：文件存儲（可選）

### 地圖服務
- **react-native-maps**：地圖組件
- **Google Maps SDK**：iOS 和 Android 原生地圖
- **Google Directions API**：路線規劃
- **Google Geocoding API**：地址轉座標

### 開發工具
- **TypeScript**：類型安全
- **ESLint**：代碼規範
- **Prettier**：代碼格式化（可選）

## 📦 依賴套件

### 核心依賴
```json
{
  "expo": "^54.0.0",
  "react": "18.3.1",
  "react-native": "0.76.5",
  "firebase": "^11.1.0",
  "react-native-maps": "^1.18.0",
  "expo-router": "^4.0.0",
  "expo-location": "^18.0.4",
  "expo-auth-session": "^6.0.3",
  "expo-web-browser": "^14.0.1",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

## 🔐 安全性

### Firestore 安全規則
- **用戶隔離**：每個用戶只能訪問自己的資料
- **旅程權限**：只有成員可以查看和編輯旅程
- **景點權限**：創建者和旅程成員可以編輯
- **防止未授權訪問**：所有操作都需要認證

### API 金鑰保護
- **環境變數**：敏感資訊存儲在 .env 文件
- **.gitignore**：防止提交到版本控制
- **API 限制**：在 Google Cloud 設定金鑰限制
- **bundle ID 限制**：僅允許特定 App 使用

## 💰 成本分析

| 服務 | 免費額度 | 預期使用量 | 費用 |
|------|----------|------------|------|
| Firebase Auth | 無限次 | ~100 次/月 | $0 |
| Firestore 讀取 | 50,000/天 | ~500/天 | $0 |
| Firestore 寫入 | 20,000/天 | ~100/天 | $0 |
| Firestore 儲存 | 1GB | ~10MB | $0 |
| Google Maps | $200/月 | ~$20/月 | $0 |
| Directions API | $200/月 | ~$10/月 | $0 |
| Geocoding API | $200/月 | ~$5/月 | $0 |
| **總計** | | | **$0** |

> **結論**：對於家庭使用（5-10 人），完全在免費額度內。

## 🚀 部署選項

### 開發測試
- **Expo Go**：最快速，掃碼即用
- **Development Build**：更接近正式 App

### 測試分發
- **iOS TestFlight**：免費，需 Apple ID
- **Android Internal Testing**：免費，通過 Google Play

### 正式發布
- **Apple App Store**：需 $99/年開發者帳號
- **Google Play Store**：需 $25 一次性費用

## 📈 功能擴展建議

### 短期（1-2 週）
- [ ] 照片上傳功能
- [ ] 景點搜尋和建議
- [ ] 拖拉排序景點順序
- [ ] 行程匯出為 PDF

### 中期（1 個月）
- [ ] 離線模式
- [ ] 預算追蹤功能
- [ ] 天氣預報整合
- [ ] 景點評分和評論

### 長期（3 個月）
- [ ] AI 景點推薦
- [ ] 社群分享功能
- [ ] 多語言支持
- [ ] 景點打卡功能
- [ ] AR 導航

## 🐛 已知限制

1. **Google 登入**：
   - 需要網路連接
   - OAuth 配置稍微複雜

2. **地圖功能**：
   - Google Maps API 有配額限制
   - 中國大陸地區可能無法使用

3. **多人協作**：
   - 目前使用共享帳號方式
   - 未來可改為邀請連結方式

4. **離線功能**：
   - 目前不支持離線使用
   - 需要持續網路連接

## 📚 相關文檔

- [README.md](./README.md) - 詳細使用說明
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - 30 分鐘快速設定
- [firestore.rules](./firestore.rules) - 資料庫安全規則
- [Expo 官方文檔](https://docs.expo.dev/)
- [Firebase 官方文檔](https://firebase.google.com/docs)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

## 🤝 貢獻指南

歡迎貢獻代碼和提出建議！

1. Fork 專案
2. 創建功能分支
3. 提交更改
4. 推送到分支
5. 創建 Pull Request

## 📞 技術支援

如有問題，請查看：
1. README.md 中的故障排除章節
2. SETUP_GUIDE.md 中的常見問題
3. 提交 Issue 到 GitHub

## 🎊 致謝

感謝以下開源項目和服務：
- Expo 團隊
- React Native 社群
- Firebase / Google Cloud
- react-native-maps 維護者

---

**祝您開發順利，旅途愉快！🎌**

*最後更新：2025-12-10*
