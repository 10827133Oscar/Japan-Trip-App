# 密碼認證系統 - 剩餘工作清單

## ✅ 已完成的工作

1. ✅ 創建本地用戶管理系統 (`services/localUser.ts`)
   - 裝置 ID 生成
   - 暱稱和顏色存儲
   - 8 種顏色選項

2. ✅ 修改歡迎/登入頁面 (`app/login.tsx`)
   - 暱稱輸入（最多 10 字）
   - 顏色選擇（8 種顏色）
   - 儲存到本地 AsyncStorage

3. ✅ 更新 Trip 資料結構 (`types/index.ts`)
   - 添加 `password` 欄位
   - 添加 `creatorDeviceId` 欄位
   - 添加 `participants: Participant[]` 欄位
   - 新增 `Participant` 介面

4. ✅ 實作密碼驗證功能 (`services/password.ts`)
   - 密碼哈希函數
   - 密碼驗證函數
   - 計畫 ID 生成函數

5. ✅ 修改 Root Layout (`app/_layout.tsx`)
   - 已修改為檢查本地用戶
   - 使用 useRef 避免無限循環
   - 正確導航到歡迎頁或主頁

6. ✅ 修改所有 Tab 頁面
   - `index.tsx` - 簡化版主頁
   - `profile.tsx` - 顯示本地用戶資料
   - `map.tsx` - 開發中提示
   - `places.tsx` - 開發中提示
   - `_layout.tsx` - 修正 span 錯誤

7. ✅ 創建 useLocalAuth Hook (`hooks/useLocalAuth.ts`)
   - 統一管理本地用戶狀態
   - 提供 updateUser 和 logout 方法
   - 自動載入用戶資料

8. ✅ 創建 tripService (`services/tripService.ts`)
   - createTripWithPassword - 創建帶密碼的計畫
   - joinTripWithPassword - 驗證密碼並加入計畫
   - getUserTripsNew - 獲取用戶參與的所有計畫
   - getTripById - 獲取單個計畫

9. ✅ 修改 useTrip Hook (`hooks/useTrip.ts`)
   - 使用新的 tripService
   - createTrip 函數支持密碼參數
   - joinTrip 函數驗證密碼
   - 自動載入用戶計畫（不需要 userId）

---

## 🔧 待完成的工作

### 1. ~~修改 Root Layout~~ ✅ 已完成

**目的：** 檢查本地用戶狀態，決定顯示歡迎頁還是主頁

**修改內容：**
```typescript
import { getLocalUser } from '../services/localUser';

// 在組件中添加
useEffect(() => {
  const checkUser = async () => {
    const localUser = await getLocalUser();
    if (!localUser) {
      // 導航到歡迎頁
      router.replace('/login');
    } else {
      // 導航到主頁
      router.replace('/(tabs)');
    }
  };
  checkUser();
}, []);
```

**檔案位置：** `app/_layout.tsx`

---

### 2. 創建新的 useLocalAuth Hook

**目的：** 替代原本的 useAuth，管理本地用戶狀態

**需要創建：** `hooks/useLocalAuth.ts`

**功能：**
- 獲取本地用戶
- 更新暱稱和顏色
- 清除用戶資料（登出）

**程式碼範例：**
```typescript
import { useState, useEffect } from 'react';
import { getLocalUser, updateLocalUser, clearLocalUser, LocalUser } from '../services/localUser';

export const useLocalAuth = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const localUser = await getLocalUser();
      setUser(localUser);
    } catch (error) {
      console.error('載入用戶失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (nickname: string, color: string) => {
    const updated = await updateLocalUser(nickname, color);
    setUser(updated);
  };

  const logout = async () => {
    await clearLocalUser();
    setUser(null);
  };

  return {
    user,
    loading,
    updateUser,
    logout,
    isAuthenticated: !!user,
  };
};
```

---

### 3. 修改 useTrip Hook (`hooks/useTrip.ts`)

**需要修改的功能：**

#### 3.1 創建計畫功能
添加密碼參數：
```typescript
import { hashPassword, generateTripId } from '../services/password';
import { getLocalUser } from '../services/localUser';

const createTrip = async (
  name: string,
  destination: string,
  password: string  // 新增
) => {
  const localUser = await getLocalUser();
  if (!localUser) throw new Error('請先設定暱稱');

  const tripId = generateTripId();
  const hashedPassword = hashPassword(password);

  const newTrip: Trip = {
    id: tripId,
    name,
    destination,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    password: hashedPassword,
    creatorDeviceId: localUser.deviceId,
    participants: [{
      deviceId: localUser.deviceId,
      nickname: localUser.nickname,
      color: localUser.color,
      joinedAt: new Date(),
    }],
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'trips', tripId), newTrip);
  return newTrip;
};
```

#### 3.2 加入計畫功能
驗證密碼並加入參與者：
```typescript
const joinTrip = async (tripId: string, password: string) => {
  const localUser = await getLocalUser();
  if (!localUser) throw new Error('請先設定暱稱');

  // 獲取計畫
  const tripDoc = await getDoc(doc(db, 'trips', tripId));
  if (!tripDoc.exists()) {
    throw new Error('計畫不存在');
  }

  const trip = tripDoc.data() as Trip;

  // 驗證密碼
  if (!verifyPassword(password, trip.password)) {
    throw new Error('密碼錯誤');
  }

  // 檢查是否已加入
  const alreadyJoined = trip.participants.some(
    p => p.deviceId === localUser.deviceId
  );

  if (alreadyJoined) {
    throw new Error('您已經加入此計畫');
  }

  // 添加參與者
  const updatedParticipants = [
    ...trip.participants,
    {
      deviceId: localUser.deviceId,
      nickname: localUser.nickname,
      color: localUser.color,
      joinedAt: new Date(),
    }
  ];

  await updateDoc(doc(db, 'trips', tripId), {
    participants: updatedParticipants,
  });

  return { ...trip, participants: updatedParticipants };
};
```

#### 3.3 獲取用戶的計畫列表
只獲取用戶參與的計畫：
```typescript
const getUserTrips = async () => {
  const localUser = await getLocalUser();
  if (!localUser) return [];

  const tripsRef = collection(db, 'trips');
  const q = query(
    tripsRef,
    where('participants', 'array-contains', {
      deviceId: localUser.deviceId,
      nickname: localUser.nickname,
      color: localUser.color,
      joinedAt: localUser.createdAt,
    })
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Trip));
};
```

**⚠️ Firestore 限制：** `array-contains` 只能比對完整物件，可能需要改用其他查詢方式。

**建議改為：**
```typescript
// 改為在 Trip 中添加 participantDeviceIds: string[] 欄位
// 查詢時使用：
const q = query(
  tripsRef,
  where('participantDeviceIds', 'array-contains', localUser.deviceId)
);
```

**需要同時更新 types/index.ts：**
```typescript
export interface Trip {
  // ... 其他欄位
  participantDeviceIds: string[];  // 新增：用於查詢
  participants: Participant[];
}
```

---

### 4. 修改計畫列表頁面 (`app/(tabs)/index.tsx`)

**需要添加的 UI 元素：**

#### 4.1 添加「加入計畫」按鈕
```typescript
<TouchableOpacity
  style={styles.joinTripCard}
  onPress={() => setShowJoinModal(true)}
>
  <Text style={styles.joinTripText}>🔗 加入計畫</Text>
</TouchableOpacity>
```

#### 4.2 創建「加入計畫」Modal
```typescript
const [showJoinModal, setShowJoinModal] = useState(false);
const [joinTripId, setJoinTripId] = useState('');
const [joinPassword, setJoinPassword] = useState('');

const handleJoinTrip = async () => {
  if (!joinTripId.trim() || !joinPassword.trim()) {
    Alert.alert('提示', '請輸入計畫 ID 和密碼');
    return;
  }

  try {
    await joinTrip(joinTripId, joinPassword);
    setJoinTripId('');
    setJoinPassword('');
    setShowJoinModal(false);
    Alert.alert('成功', '已加入計畫！');
  } catch (error: any) {
    Alert.alert('錯誤', error.message || '加入失敗');
  }
};

// Modal JSX
<Modal visible={showJoinModal} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>加入計畫</Text>

      <TextInput
        style={styles.input}
        placeholder="計畫 ID"
        value={joinTripId}
        onChangeText={setJoinTripId}
      />

      <TextInput
        style={styles.input}
        placeholder="計畫密碼"
        value={joinPassword}
        onChangeText={setJoinPassword}
        secureTextEntry
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => setShowJoinModal(false)}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, styles.confirmButton]}
          onPress={handleJoinTrip}
        >
          <Text style={styles.confirmButtonText}>加入</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

#### 4.3 修改「創建計畫」Modal
添加密碼輸入欄位：
```typescript
const [newTripPassword, setNewTripPassword] = useState('');

// 在創建計畫 Modal 中添加
<TextInput
  style={styles.input}
  placeholder="設定計畫密碼（分享給家人朋友）"
  value={newTripPassword}
  onChangeText={setNewTripPassword}
  secureTextEntry
/>

// 修改 handleCreateTrip
const handleCreateTrip = async () => {
  if (!newTripName.trim()) {
    Alert.alert('錯誤', '請輸入計畫名稱');
    return;
  }

  if (!newTripPassword.trim()) {
    Alert.alert('錯誤', '請設定計畫密碼');
    return;
  }

  try {
    const trip = await createTrip(
      newTripName,
      newTripDestination,
      newTripPassword
    );

    // 顯示計畫 ID
    Alert.alert(
      '計畫已創建！',
      `計畫 ID: ${trip.id}\n\n請將此 ID 和密碼分享給家人朋友，他們就能加入計畫。`,
      [
        { text: '複製 ID', onPress: () => Clipboard.setString(trip.id) },
        { text: '確定' }
      ]
    );

    setNewTripName('');
    setNewTripDestination('東京');
    setNewTripPassword('');
    setShowCreateModal(false);
  } catch (error) {
    Alert.alert('錯誤', '創建計畫失敗');
  }
};
```

#### 4.4 顯示計畫資訊（ID、參與者）
在計畫概覽中添加：
```typescript
<View style={styles.summaryCard}>
  <Text style={styles.summaryTitle}>計畫概覽</Text>

  {/* 計畫 ID */}
  <TouchableOpacity
    style={styles.tripIdContainer}
    onPress={() => {
      Clipboard.setString(currentTrip.id);
      Alert.alert('已複製', '計畫 ID 已複製到剪貼簿');
    }}
  >
    <Text style={styles.tripIdLabel}>計畫 ID:</Text>
    <Text style={styles.tripId}>{currentTrip.id}</Text>
    <Text style={styles.copyHint}>（點擊複製）</Text>
  </TouchableOpacity>

  {/* 參與者列表 */}
  <View style={styles.participantsContainer}>
    <Text style={styles.participantsTitle}>參與者:</Text>
    {currentTrip.participants.map((participant) => (
      <View key={participant.deviceId} style={styles.participantItem}>
        <View
          style={[
            styles.participantColor,
            { backgroundColor: participant.color }
          ]}
        />
        <Text style={styles.participantName}>{participant.nickname}</Text>
      </View>
    ))}
  </View>

  {/* ... 其他內容 */}
</View>
```

**需要導入 Clipboard：**
```typescript
import * as Clipboard from 'expo-clipboard';
```

**如果沒有安裝，需要執行：**
```bash
npx expo install expo-clipboard
```

---

### 5. 修改個人資料頁面 (`app/(tabs)/profile.tsx`)

**需要修改的內容：**

#### 5.1 使用 useLocalAuth 替代 useAuth
```typescript
import { useLocalAuth } from '../../hooks/useLocalAuth';

const { user, updateUser, logout } = useLocalAuth();
```

#### 5.2 顯示本地用戶資訊
```typescript
{user && (
  <View style={styles.userInfo}>
    <View style={styles.colorIndicator}>
      <View
        style={[
          styles.colorCircle,
          { backgroundColor: user.color }
        ]}
      />
    </View>
    <Text style={styles.nickname}>{user.nickname}</Text>
    <Text style={styles.deviceId}>裝置 ID: {user.deviceId.slice(0, 12)}...</Text>
  </View>
)}
```

#### 5.3 添加編輯暱稱和顏色功能
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editNickname, setEditNickname] = useState(user?.nickname || '');
const [editColor, setEditColor] = useState(user?.color || '');

const handleSaveProfile = async () => {
  if (!editNickname.trim()) {
    Alert.alert('提示', '請輸入暱稱');
    return;
  }

  try {
    await updateUser(editNickname, editColor);
    setIsEditing(false);
    Alert.alert('成功', '資料已更新');
  } catch (error) {
    Alert.alert('錯誤', '更新失敗');
  }
};
```

#### 5.4 移除 Google 相關內容
刪除所有提到 Google 登入的文字和功能。

---

### 6. 移除 Google Auth 相關代碼

#### 6.1 刪除或重構 `hooks/useAuth.ts`
**選項 1：** 完全刪除，用 `useLocalAuth` 替代

**選項 2：** 保留檔案但移除所有 Google OAuth 代碼

#### 6.2 刪除或重構 `services/auth.ts`
保留 Firestore 相關功能，移除 Firebase Auth：
```typescript
// 移除
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

// 移除
export const signInWithGoogle = async (idToken: string) => { ... };
export const signOut = async () => { ... };
export const onAuthChange = (callback) => { ... };
```

#### 6.3 移除依賴（可選）
如果不再使用 Firebase Auth，可以移除：
```bash
npm uninstall expo-auth-session expo-web-browser
```

保留 Firebase Firestore：
```bash
# 保留這些
firebase
@firebase/firestore
```

---

### 7. 更新 Firestore 規則

由於不再使用 Firebase Auth，需要修改 Firestore 規則：

**檔案：** `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 所有人都可以讀取
    match /trips/{tripId} {
      allow read: if true;
      allow write: if true;  // 暫時開放，後續可以加強
    }

    match /places/{placeId} {
      allow read: if true;
      allow write: if true;
    }

    match /itineraries/{itineraryId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**⚠️ 安全性注意：**
這樣的規則允許任何人讀寫資料。如果需要更強的安全性，可以：
1. 只允許有密碼的計畫被訪問（但 Firestore 規則無法驗證加密的密碼）
2. 使用 Firebase Cloud Functions 來驗證密碼
3. 或者接受這個風險（反正計畫 ID 很難猜到）

---

### 8. 測試流程

完成所有修改後，按以下流程測試：

#### 8.1 首次使用
1. 啟動 App
2. 應該顯示歡迎頁面
3. 輸入暱稱和選擇顏色
4. 點擊「開始使用」
5. 應該進入計畫列表頁面

#### 8.2 創建計畫
1. 點擊「+ 新增行程」
2. 輸入計畫名稱、目的地、密碼
3. 創建成功後，應該顯示計畫 ID
4. 複製計畫 ID

#### 8.3 加入計畫（使用另一台手機或清除 App 資料）
1. 在另一台手機上安裝 App
2. 輸入暱稱和顏色
3. 點擊「🔗 加入計畫」
4. 輸入計畫 ID 和密碼
5. 應該成功加入計畫

#### 8.4 協作編輯
1. 兩台手機都應該能看到同一個計畫
2. 在地圖上添加景點
3. 另一台手機應該即時看到更新
4. 在參與者列表中，應該能看到不同顏色區分

#### 8.5 編輯個人資料
1. 進入個人資料頁面
2. 點擊編輯
3. 修改暱稱和顏色
4. 儲存後應該更新

---

## 📦 需要安裝的套件

```bash
# AsyncStorage（可能已安裝）
npx expo install @react-native-async-storage/async-storage

# Clipboard（用於複製計畫 ID）
npx expo install expo-clipboard
```

---

## ⚠️ 已知問題和限制

1. **Firestore 查詢限制**
   - `array-contains` 只能查詢簡單值，不能查詢物件
   - 需要添加 `participantDeviceIds: string[]` 欄位輔助查詢

2. **密碼安全性**
   - 目前使用簡單的哈希函數
   - 不是加密安全的，只能防止直接查看
   - 如需更強安全性，建議使用 crypto 庫

3. **暱稱衝突**
   - 可能有多個人使用相同暱稱
   - 使用裝置 ID 區分，但 UI 上可能混淆

4. **離線支援**
   - 需要網路連接才能同步
   - 可以考慮添加 Firestore 離線持久化

5. **裝置 ID 變更**
   - 刪除 App 後會生成新的裝置 ID
   - 用戶需要重新加入計畫

---

## 🎯 優先順序

### 高優先級（必須完成）
1. ✅ Root Layout 修改
2. ✅ useLocalAuth Hook
3. ✅ useTrip Hook 修改
4. ✅ index.tsx 修改（創建+加入計畫）

### 中優先級（影響用戶體驗）
5. ✅ profile.tsx 修改
6. ✅ 移除 Google Auth 代碼

### 低優先級（可以稍後）
7. 📋 Firestore 規則更新
8. 📋 移除未使用的依賴

---

## 💡 建議的實作順序

1. **先測試歡迎頁面**（目前階段）
2. **創建 useLocalAuth**
3. **修改 _layout.tsx**
4. **修改 useTrip（創建計畫部分）**
5. **修改 index.tsx（創建計畫 UI）**
6. **測試創建計畫流程**
7. **修改 useTrip（加入計畫部分）**
8. **修改 index.tsx（加入計畫 UI）**
9. **測試加入計畫流程**
10. **修改 profile.tsx**
11. **完整測試**
12. **清理代碼**

---

## 📝 開發提示

- 每完成一個功能就測試一次
- 檢查控制台錯誤
- 使用 `console.log` 調試
- Firebase Firestore 數據可以在 Firebase Console 查看
- 使用 React DevTools 檢查狀態

---

## 🆘 可能遇到的錯誤

### 錯誤 1：AsyncStorage 未安裝
```bash
npx expo install @react-native-async-storage/async-storage
```

### 錯誤 2：Firestore 查詢失敗
檢查是否正確設定 `participantDeviceIds` 欄位

### 錯誤 3：App 重啟後還是顯示歡迎頁
檢查 AsyncStorage 是否正確儲存資料：
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// 調試用
const checkStorage = async () => {
  const data = await AsyncStorage.getItem('@japan_trip_app:local_user');
  console.log('Stored user:', data);
};
```

### 錯誤 4：無法加入計畫
- 檢查密碼是否正確
- 檢查計畫 ID 是否正確
- 查看控制台錯誤訊息

---

## ✨ 未來可能的改進

1. **QR Code 分享**
   - 生成包含計畫 ID 和密碼的 QR Code
   - 掃描 QR Code 直接加入

2. **計畫權限管理**
   - 建立者可以移除參與者
   - 設定唯讀參與者

3. **暱稱後綴**
   - 自動為重複暱稱添加數字後綴
   - 例如：小明、小明(2)、小明(3)

4. **離線支援**
   - 啟用 Firestore 離線持久化
   - 顯示同步狀態

5. **更安全的密碼**
   - 使用 bcrypt 或類似加密庫
   - 密碼長度限制

6. **計畫歸檔**
   - 結束的計畫可以歸檔
   - 不刪除但不顯示在列表中

---

**文件創建日期：** 2025-12-15
**當前狀態：** 已完成歡迎頁面，準備測試
**下一步：** 測試歡迎頁面 → 創建 useLocalAuth → 修改 _layout.tsx
