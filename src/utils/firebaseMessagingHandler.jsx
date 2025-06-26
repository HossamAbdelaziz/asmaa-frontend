import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { Capacitor } from '@capacitor/core';
import { getMessaging, getToken } from 'firebase/messaging';
import { getApp } from 'firebase/app';

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const setupFirebaseMessaging = async () => {
  console.log("📡 setupFirebaseMessaging() CALLED");

  try {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();

    let token;

    if (isNative && platform !== 'ios') {
      const permStatus = await FirebaseMessaging.requestPermissions();
      console.log("📲 Native FCM Permission status:", permStatus);

      if (permStatus.receive !== 'granted') {
        console.warn('❌ Native permission not granted');
        return;
      }

      const tokenResult = await FirebaseMessaging.getToken();
      token = tokenResult?.token;
      console.log("🔐 Native FCM Token:", token);
    } else {
      console.log("🌐 Web platform detected. Setting up FCM...");
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('❌ Web permission denied');
        return;
      }

      const messaging = getMessaging(getApp());
      token = await getToken(messaging, { vapidKey });
      console.log("🔐 Web FCM Token:", token);
    }

    if (!token) return;

    // Save to Firestore
    onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const existing = snap.exists() ? snap.data()?.messaging?.fcmTokens || [] : [];

      if (!existing.includes(token)) {
        await setDoc(userRef, {
          messaging: {
            fcmTokens: [...existing, token],
            updatedAt: new Date()
          }
        }, { merge: true });

        console.log("✅ FCM token saved to Firestore");
      } else {
        console.log("ℹ️ Token already exists");
      }
    });

  } catch (error) {
    console.error("🔥 FCM setup error:", error);
  }
};