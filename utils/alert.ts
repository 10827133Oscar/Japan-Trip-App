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
      // 網頁版使用瀏覽器原生 alert
      const fullMessage = message ? `${title}\n\n${message}` : title;
      window.alert(fullMessage);

      // 執行第一個按鈕的回調（通常是確認按鈕）
      if (buttons && buttons.length > 0) {
        const defaultButton = buttons.find(b => b.style !== 'cancel') || buttons[0];
        if (defaultButton.onPress) {
          defaultButton.onPress();
        }
      }
    } else {
      // 原生平台使用 React Native 的 Alert
      RNAlert.alert(title, message, buttons);
    }
  },
};
