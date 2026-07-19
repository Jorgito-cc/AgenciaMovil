import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { SPRING_BOOT_URL } from '../config/apollo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Configuración para usar un FCM token directo
    // Esto es vital para que Firebase Admin SDK en Spring Boot lo acepte
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.log("No EAS project ID found, getting raw device token.");
    }

    try {
      // Obtenemos el FCM Device token (requerido para Firebase nativo)
      const pushTokenString = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('Native Device Push Token (FCM):', pushTokenString);
      token = pushTokenString;
    } catch (e) {
      console.log('Error getting push token: ', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function sendTokenToBackend(userId: string | null, email: string, token: string) {
  try {
    // La URL base (sacando "/graphql")
    const baseUrl = SPRING_BOOT_URL.replace('/graphql', '');
    const endpoint = `${baseUrl}/api/dispositivos/registrar`;
    
    console.log(`Sending token to ${endpoint}...`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        userId: userId || "",
        fcmToken: token,
      }),
    });
    
    if (response.ok) {
      console.log('Token successfully registered in backend!');
      const data = await response.json();
      console.log(data);
    } else {
      console.error('Failed to register token in backend:', response.status);
    }
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
}
