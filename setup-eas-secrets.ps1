# EAS Secrets 設置腳本 (PowerShell)
# 使用前請先準備好所有環境變數的值
# 注意：使用新的 eas env:create 命令（eas secret:create 已棄用）

Write-Host "🚀 開始設置 EAS Secrets..." -ForegroundColor Green
Write-Host ""

# Firebase 配置
Write-Host "設置 Firebase 環境變數..." -ForegroundColor Yellow
$FIREBASE_API_KEY = Read-Host "請輸入 EXPO_PUBLIC_FIREBASE_API_KEY"
eas env:create production --name EXPO_PUBLIC_FIREBASE_API_KEY --value $FIREBASE_API_KEY --type string --visibility secret --non-interactive

$FIREBASE_AUTH_DOMAIN = Read-Host "請輸入 EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
eas env:create production --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value $FIREBASE_AUTH_DOMAIN --type string --visibility secret --non-interactive

$FIREBASE_PROJECT_ID = Read-Host "請輸入 EXPO_PUBLIC_FIREBASE_PROJECT_ID"
eas env:create production --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value $FIREBASE_PROJECT_ID --type string --visibility secret --non-interactive

$FIREBASE_STORAGE_BUCKET = Read-Host "請輸入 EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
eas env:create production --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value $FIREBASE_STORAGE_BUCKET --type string --visibility secret --non-interactive

$FIREBASE_MESSAGING_SENDER_ID = Read-Host "請輸入 EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
eas env:create production --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value $FIREBASE_MESSAGING_SENDER_ID --type string --visibility secret --non-interactive

$FIREBASE_APP_ID = Read-Host "請輸入 EXPO_PUBLIC_FIREBASE_APP_ID"
eas env:create production --name EXPO_PUBLIC_FIREBASE_APP_ID --value $FIREBASE_APP_ID --type string --visibility secret --non-interactive

# Google Maps API Key
Write-Host ""
Write-Host "設置 Google Maps API Key..." -ForegroundColor Yellow
$GOOGLE_MAPS_API_KEY = Read-Host "請輸入 EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
eas env:create production --name EXPO_PUBLIC_GOOGLE_MAPS_API_KEY --value $GOOGLE_MAPS_API_KEY --type string --visibility secret --non-interactive

Write-Host ""
Write-Host "✅ 所有環境變數設置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "驗證設置：" -ForegroundColor Yellow
eas env:list --environment production

