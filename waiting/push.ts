// app/_utils/push.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { postJSON } from '@app/_utils/api';
import { getUserId } from '@app/_utils/auth';

// 알림 표시 정책(포그라운드에서도 배너/사운드)
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowBanner: true,   // 🔁 was shouldShowAlert
    shouldShowList: true,     // 🔁 새 키
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TOKEN_KEY = 'expo_push_token_v1';

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }
}

async function getExpoPushToken(): Promise<string> {
  // SDK 51+에서 projectId 지정이 필요한 경우가 있음
  const projectId =
    (Constants?.expoConfig as any)?.extra?.eas?.projectId ||
    (Constants as any)?.easConfig?.projectId;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    throw new Error('푸시 알림 권한이 허용되지 않았습니다.');
  }

  const token = projectId
    ? (await Notifications.getExpoPushTokenAsync({ projectId })).data
    : (await Notifications.getExpoPushTokenAsync()).data;

  return token;
}

async function registerTokenToServer(token: string) {
  const user_id = await getUserId();
  if (!user_id) return;

  try {
    await postJSON('/register-token', { user_id, token });
  } catch (e) {
    console.warn('[Push] token register failed:', (e as any)?.message || e);
    // 등록 실패해도 앱은 계속 사용 가능.
  }
}

/** 앱 시작 시 1회 호출하면 됨. 반환값은 클린업 함수 */
export async function initPushNotifications(): Promise<() => void> {
  if (!Device.isDevice) {
    console.log('[Push] 실제 기기에서만 작동합니다.');
    return () => {};
  }

  await ensureAndroidChannel();

  // 토큰 발급 + 서버 등록 (변경시에만)
  try {
    const token = await getExpoPushToken();
    const prev = (await SecureStore.getItemAsync(TOKEN_KEY)) || '';
    if (prev !== token) {
      await registerTokenToServer(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    console.log('[Push] Expo token:', token);
  } catch (e: any) {
    console.warn('[Push] init error:', e?.message || e);
  }

  // 포그라운드 수신
  const receivedSub = Notifications.addNotificationReceivedListener((n) => {
    const { title, body } = n.request.content;
    console.log('[Push] received:', title, body);
    // 필요한 경우 Toast/Alert로 보여줄 수 있음
  });

  // 사용자가 알림 탭했을 때
  const responseSub = Notifications.addNotificationResponseReceivedListener((resp) => {
    const data = resp.notification.request.content.data || {};
    console.log('[Push] tap:', data);
    // data.screen 같은 커스텀 딥링크 처리 가능
  });

  // 언마운트 시 정리
  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

/** 로컬 테스트용: 즉시 알림 */
export async function fireLocalNotificationNow(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: null,
  });
}
