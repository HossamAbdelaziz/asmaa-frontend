// src/firebase/firebaseNative.js
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const initNativeFCM = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log("📱 Not a native platform, skipping FCM init");
    return;
  }

  try {
    const permission = await FirebaseMessaging.requestPermissions();
    console.log("🔐 Notification permission:", permission.receive);

    if (permission.receive !== 'granted') {
      console.warn("❌ Notification permission not granted.");
      return;
    }

    const { token } = await FirebaseMessaging.getToken();
    console.log("🔥 iOS FCM Token:", token);

    if (!token) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // 👇 fallback in case currentUser is not ready yet
    if (!currentUser) {
      console.warn("⚠️ No user at init time, waiting for auth state change...");

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("✅ User detected after auth change:", user.uid);
          await saveTokenToFirestore(user.uid, token);
        } else {
          console.warn("⛔ Still no user after waiting.");
        }
      });

      return;
    }

    await saveTokenToFirestore(currentUser.uid, token);

  } catch (err) {
    console.error("🔥 FCM Init Error:", err);
  }
};

// 🔧 Save token to Firestore
const saveTokenToFirestore = async (uid, token) => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);

    const existing = snap.exists() ? snap.data()?.messaging?.fcmTokens || [] : [];

    if (existing.includes(token)) {
      console.log("ℹ️ Token already saved in Firestore.");
      return;
    }

    const newTokens = [...existing, token];

    await setDoc(userRef, {
      messaging: {
        fcmTokens: newTokens,
        updatedAt: new Date()
      }
    }, { merge: true });

    console.log("✅ Token saved to Firestore.");
  } catch (error) {
    console.error("🔥 Firestore Save Error:", error);
  }
};