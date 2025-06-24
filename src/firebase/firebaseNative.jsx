// src/firebase/firebaseNative.jsx

import { FirebaseMessaging } from '@capacitor-firebase/messaging';

export const initNativeFCM = async () => {
  try {
    const perm = await FirebaseMessaging.requestPermissions();
    console.log("🔐 Permission:", perm.receive);

    const { token } = await FirebaseMessaging.getToken();
    console.log("🔥 Native FCM Token:", token);

    FirebaseMessaging.addListener('pushNotificationReceived', (event) => {
      console.log("📥 Push Received:", event);
    });

    FirebaseMessaging.addListener('pushNotificationActionPerformed', (event) => {
      console.log("➡️ Push Action:", event);
    });

  } catch (err) {
    console.error("❌ Native FCM error:", err);
  }
};