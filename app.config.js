export default {
    expo: {
        name: "日本旅遊助手",
        slug: "japan-trip-app",
        owner: "oscar-teng",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        scheme: "japan-trip-app",
        description: "專為家庭旅遊設計的協作式旅程規劃App，支援多人即時同步、地圖標記、景點管理等功能。",
        primaryColor: "#007AFF",
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#007AFF"
        },
        assetBundlePatterns: ["**/*"],
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.oscarteng.japantripapp",
            buildNumber: "1",
            config: {
                googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDHkb76jce-ulZ1zWruhppb68vJzKm8UG8"
            },
            infoPlist: {
                NSLocationWhenInUseUsageDescription: "此App需要位置權限來顯示您的當前位置並規劃路線",
                NSLocationAlwaysUsageDescription: "此App需要位置權限來顯示您的當前位置",
                UIBackgroundModes: ["location"]
            },
            privacyManifests: {
                NSPrivacyAccessedAPITypes: [
                    {
                        "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
                        "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
                    }
                ]
            }
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#007AFF"
            },
            package: "com.oscarteng.japantripapp",
            versionCode: 1,
            edgeToEdgeEnabled: true,
            config: {
                googleMaps: {
                    apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDHkb76jce-ulZ1zWruhppb68vJzKm8UG8"
                }
            },
            permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION", "INTERNET"]
        },
        web: {
            favicon: "./assets/favicon.png",
            bundler: "metro"
        },
        plugins: [
            "expo-location",
            "expo-router",
            "expo-font"
        ],
        experiments: {
            typedRoutes: true
        },
        extra: {
            router: {
                origin: false
            },
            eas: {
                projectId: "4918720e-b0a2-4e5c-93dd-af31d332f984"
            }
        }
    }
};
