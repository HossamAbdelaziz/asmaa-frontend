// src/utils/firebaseMessagingHandler.jsx
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const setupFirebaseMessaging = async () => {
    try {
        const permStatus = await FirebaseMessaging.requestPermissions();
        console.log("📲 Hossa FCM Permission status:", permStatus);

        if (permStatus.receive !== 'granted') {
            console.warn('❌ Notification permission not granted');
            return;
        }

        const tokenResult = await FirebaseMessaging.getToken();
        const token = tokenResult.token;
        console.log("🔐 Hossa FCM Token:", token);

        onAuthStateChanged(getAuth(), async (user) => {
            if (user && token) {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    messaging: {
                        fcmToken: token,
                        updatedAt: new Date()
                    }
                }, { merge: true });

                console.log("✅ FCM token saved under 'messaging.fcmToken'");
            }
        });

        FirebaseMessaging.addListener('notificationReceived', (event) => {
            console.log('📩 Foreground Notification:', event);
        });

        FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
            console.log('👉 Notification tapped:', event);
        });

    } catch (error) {
        console.error("⚠️ Firebase Messaging setup error:", error);
    }
};
