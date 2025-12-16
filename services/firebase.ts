import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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

export default app;
