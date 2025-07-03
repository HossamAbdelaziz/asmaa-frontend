import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { doc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

export const testSaveFcmToFirestore = async () => {
  if (!Capacitor.isNativePlatform()) return console.log("Not native platform.");

  const platform = Capacitor.getPlatform();

  try {
    const perm = await FirebaseMessaging.requestPermissions();
    if (perm.receive !== "granted") {
      console.warn("Permission denied.");
      return;
    }

    const { token } = await FirebaseMessaging.getToken();
    console.log("✅ Test FCM token:", token);

    const user = auth.currentUser;
    if (!user || !token) {
      console.warn("No user or token.");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const existing = snap.exists() ? snap.data()?.messaging?.fcmTokens || [] : [];

    const already = existing.some(t => t.token === token);
    if (already) {
      console.log("ℹ️ Token already exists.");
      return;
    }

    await setDoc(userRef, {
      messaging: {
        fcmTokens: arrayUnion({
          token,
          platform,
          lastUsed: new Date(),
          isActive: true
        }),
        updatedAt: new Date()
      }
    }, { merge: true });

    console.log("✅ Token saved manually to Firestore!");
  } catch (err) {
    console.error("🔥 Manual FCM save error:", err);
  }
};