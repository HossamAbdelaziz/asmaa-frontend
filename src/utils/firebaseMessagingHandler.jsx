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

    console.log(`🌍 Platform: ${platform}, isNative: ${isNative}`);

    let token;

    if (isNative) {
      console.log("📲 Native platform detected. Requesting permission...");
      const permStatus = await FirebaseMessaging.requestPermissions();
      console.log("🔐 Permission status:", permStatus);

      if (permStatus.receive !== 'granted') {
        console.warn('❌ Native permission NOT granted');
        return;
      }

      const tokenResult = await FirebaseMessaging.getToken();
      token = tokenResult?.token;
      console.log("✅ Native FCM Token received:", token);
    } else {
      console.log("🌐 Web platform. Requesting web permission...");
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('❌ Web permission denied');
        return;
      }

      const messaging = getMessaging(getApp());
      token = await getToken(messaging, { vapidKey });
      console.log("✅ Web FCM Token received:", token);
    }

    if (!token) {
      console.warn("⚠️ No token was returned!");
      return;
    }

    console.log("👤 Waiting for user to be authenticated...");
    onAuthStateChanged(getAuth(), async (user) => {
      if (!user) {
        console.warn("❌ No authenticated user!");
        return;
      }

      console.log(`👤 Authenticated user: ${user.uid}`);
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const existing = snap.exists() ? snap.data()?.messaging?.fcmTokens || [] : [];

      const alreadyExists = existing.includes(token);
      console.log("🔎 Token exists already?", alreadyExists);

      if (!alreadyExists) {
        await setDoc(userRef, {
          messaging: {
            fcmTokens: [...existing, token],
            updatedAt: new Date()
          }
        }, { merge: true });

        console.log("✅ FCM token saved to Firestore");
      } else {
        console.log("ℹ️ Token already exists in Firestore. Skipping save.");
      }
    });

  } catch (error) {
    console.error("🔥 FCM setup error:", error);
  }
};