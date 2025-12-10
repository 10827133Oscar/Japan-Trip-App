import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

// Google登入
export const signInWithGoogle = async (idToken: string): Promise<User> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);

    // 創建或更新用戶資料
    const user: User = {
      id: result.user.uid,
      email: result.user.email || '',
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      createdAt: new Date(),
    };

    // 保存到Firestore
    await setDoc(doc(db, 'users', user.id), user, { merge: true });

    return user;
  } catch (error) {
    console.error('Google登入錯誤:', error);
    throw error;
  }
};

// 登出
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('登出錯誤:', error);
    throw error;
  }
};

// 獲取當前用戶資料
export const getCurrentUser = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error);
    return null;
  }
};

// 監聽認證狀態變化
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
