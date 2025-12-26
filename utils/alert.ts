import { Alert as RNAlert, Platform } from 'react-native';

// 跨平台 Alert 工具
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    if (Platform.OS === 'web') {
      // 網頁版處理
      const fullMessage = message ? `${title}\n\n${message}` : title;

      if (buttons && buttons.length > 1) {
        // 有多個按鈕，使用 confirm 對話框
        const confirmed = window.confirm(fullMessage);

        if (confirmed) {
          // 用戶點擊確認，執行非 cancel 按鈕的回調
          const confirmButton = buttons.find(b => b.style !== 'cancel');
          if (confirmButton?.onPress) {
            confirmButton.onPress();
          }
        } else {
          // 用戶點擊取消，執行 cancel 按鈕的回調
          const cancelButton = buttons.find(b => b.style === 'cancel');
          if (cancelButton?.onPress) {
            cancelButton.onPress();
          }
        }
      } else {
        // 只有一個按鈕或沒有按鈕，使用 alert 對話框
        window.alert(fullMessage);

        if (buttons && buttons.length > 0 && buttons[0].onPress) {
          buttons[0].onPress();
        }
      }
    } else {
      // 原生平台使用 React Native 的 Alert
      RNAlert.alert(title, message, buttons);
    }
  },
};
