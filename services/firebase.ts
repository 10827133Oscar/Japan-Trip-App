import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, enableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase配置
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Firebase Config Loading...');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key present:', !!firebaseConfig.apiKey);

// 檢查配置是否完整
const checkConfig = () => {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value || value.includes('your_') || value.includes('YOUR_'))
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.error('❌ Firebase Configuration Error: Missing or invalid keys:', missingKeys);
    console.error('👉 Please check your .env file and ensure all values are set correctly.');
    return false;
  }
  return true;
};

if (!checkConfig()) {
  console.warn('⚠️ App running with invalid Firebase config. Some features may crash.');
}

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 只初始化 Firestore 和 Storage（不再使用 Firebase Auth）
export const db = getFirestore(app);
export const storage = getStorage(app);

// 啟用離線持久化（如果支援）
// 注意：在 React Native 中，這可能不支援，但不會報錯
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // 多個標籤頁同時開啟，忽略此錯誤
      console.warn('⚠️ Firestore persistence already enabled in another tab');
    } else if (err.code === 'unimplemented') {
      // 瀏覽器不支援，在 React Native 中這是正常的
      console.warn('⚠️ Firestore persistence not supported in this environment');
    } else {
      console.error('❌ Firestore persistence error:', err);
    }
  });
} catch (error) {
  console.warn('⚠️ Could not enable Firestore persistence:', error);
}

// 確保網路連接啟用
enableNetwork(db).catch((err) => {
  console.error('❌ Failed to enable Firestore network:', err);
});

export default app;
