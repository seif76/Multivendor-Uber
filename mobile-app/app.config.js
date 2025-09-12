import 'dotenv/config';
export default   {
  "expo": {
    "name": "mobile-app",
    "slug": "mobile-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/Elnaizak-logo.jpeg",
    "scheme": "mobileapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    android: {
      package: 'com.elnaizak.mobileapp' // <— add this line
    },
    "extra": {
      "GOOGLE_MAPS_API_KEY": process.env.GOOGLE_MAPS_API_KEY,
      "BACKEND_URL":process.env.BACKEND_URL,
      eas: {
        projectId: '861a2722-042e-4bb0-9d2e-54793f09a675'
      }
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": 'com.elnaizak.mobileapp',

      "adaptiveIcon": {
        "foregroundImage": "./assets/images/Elnaizak-logo.jpeg",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "config": {
            "googleMaps": {
              "apiKey": process.env.GOOGLE_MAPS_API_KEY
            }
          }
    },
    
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/Elnaizak-logo.jpeg",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
