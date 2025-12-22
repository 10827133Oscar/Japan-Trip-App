#!/bin/bash

# EAS Secrets 設置腳本
# 使用前請先準備好所有環境變數的值

echo "🚀 開始設置 EAS Secrets..."
echo ""

# Firebase 配置
echo "設置 Firebase 環境變數..."
read -p "請輸入 EXPO_PUBLIC_FIREBASE_API_KEY: " FIREBASE_API_KEY
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_API_KEY --value "$FIREBASE_API_KEY"

read -p "請輸入 EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: " FIREBASE_AUTH_DOMAIN
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "$FIREBASE_AUTH_DOMAIN"

read -p "請輸入 EXPO_PUBLIC_FIREBASE_PROJECT_ID: " FIREBASE_PROJECT_ID
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "$FIREBASE_PROJECT_ID"

read -p "請輸入 EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: " FIREBASE_STORAGE_BUCKET
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "$FIREBASE_STORAGE_BUCKET"

read -p "請輸入 EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: " FIREBASE_MESSAGING_SENDER_ID
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "$FIREBASE_MESSAGING_SENDER_ID"

read -p "請輸入 EXPO_PUBLIC_FIREBASE_APP_ID: " FIREBASE_APP_ID
eas secret:create --scope project --name EXPO_PUBLIC_FIREBASE_APP_ID --value "$FIREBASE_APP_ID"

# Google Maps API Key
echo ""
echo "設置 Google Maps API Key..."
read -p "請輸入 EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: " GOOGLE_MAPS_API_KEY
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value "$GOOGLE_MAPS_API_KEY"

echo ""
echo "✅ 所有環境變數設置完成！"
echo ""
echo "驗證設置："
eas secret:list

