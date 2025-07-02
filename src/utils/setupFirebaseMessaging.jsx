import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// ✅ Web VAPID Key (safe to expose)
const webVapidKey = "BFmXUcLHuLyRYN6WtpnCRvREbYJ06rpPJJR7rugpVeOp8N-izcdh7LOq9hP-TeIYNlW7P4GsIpBYQp9v5kqZd-g";

export const setupFirebaseMessaging = async () => {
    console.log("📡 setupFirebaseMessaging() CALLED");

    try {
        const isNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();
        const auth = getAuth();

        if (isNative) {
            // ✅ Native FCM (iOS & Android)
            const permStatus = await FirebaseMessaging.requestPermissions();
            console.log("📲 Native FCM Permission:", permStatus);

            if (permStatus.receive !== 'granted') {
                console.warn("❌ Native FCM permission not granted");
                return;
            }

            const tokenResult = await FirebaseMessaging.getToken();
            const token = tokenResult?.token;
            console.log("🔐 Native FCM Token:", token);

            onAuthStateChanged(auth, async (user) => {
    console.log("🔄 setupFirebaseMessaging: onAuthStateChanged triggered", user ? user.uid : "no user");
    if (!user) return;

    let finalToken = token;

    // ✅ If token not ready, retry a few times
    if (!finalToken) {
        console.warn("⏳ Waiting for native token...");
        for (let i = 0; i < 5; i++) {
            const retry = await FirebaseMessaging.getToken();
            if (retry?.token) {
                finalToken = retry.token;
                console.log("🔁 Retried & got token:", finalToken);
                break;
            }
            await new Promise(r => setTimeout(r, 1000)); // wait 1 sec
        }
    }

    if (!finalToken) {
        console.warn("❌ Still no token after retrying");
        return;
    }

    console.log("💾 Attempting to save token to Firestore for user:", user.uid);
    // ✅ Save to Firestore if not already there
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const existing = userSnap.exists() ? userSnap.data()?.messaging?.fcmTokens || [] : [];
    console.log("📋 Existing tokens:", existing.length);

    const alreadyExists = existing.some(entry => entry.token === finalToken);
    console.log("🔍 Token already exists?", alreadyExists);

    if (!alreadyExists) {
        try {
            await setDoc(userRef, {
                messaging: {
                    fcmTokens: arrayUnion({
                        token: finalToken,
                        platform,
                        lastUsed: new Date(),
                        isActive: true
                    }),
                    updatedAt: new Date()
                }
            }, { merge: true });

            console.log("✅ Native token saved after retry");
        } catch (error) {
            console.error("❌ Failed to save token to Firestore:", error);
        }
    } else {
        console.log("ℹ️ Native token already exists");
    }
});

            FirebaseMessaging.addListener('notificationReceived', event => {
                console.log('📩 Native foreground notification:', event);
            });

            FirebaseMessaging.addListener('notificationActionPerformed', event => {
                console.log('👉 Native notification tapped:', event);
            });

        } else {
            // ✅ Web FCM
            console.log("🌐 Setting up FCM for web...");

            const permission = await Notification.requestPermission();
            console.log("🔐 Web Permission:", permission);

            if (permission !== 'granted') {
                console.warn("❌ Web notification permission denied");
                return;
            }

            const app = getApp();
            const messaging = getMessaging(app);
            const token = await getToken(messaging, { vapidKey: webVapidKey });
            console.log("🔐 Web FCM Token:", token || "⚠️ null");

            onAuthStateChanged(auth, async (user) => {
                if (user && token) {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    const existing = userSnap.exists() ? userSnap.data()?.messaging?.fcmTokens || [] : [];

                    const alreadyExists = existing.some(entry => entry.token === token);

                    if (!alreadyExists) {
                        await setDoc(userRef, {
                            messaging: {
                                fcmTokens: arrayUnion({
                                    token,
                                    platform: 'web',
                                    lastUsed: new Date(),
                                    isActive: true
                                }),
                                updatedAt: new Date()
                            }
                        }, { merge: true });

                        console.log("✅ Web token saved to Firestore");
                    } else {
                        console.log("ℹ️ Web token already exists");
                    }
                }
            });

            // Optional: Show system notification while app is open
            onMessage(messaging, (payload) => {
                console.log("📩 Web foreground message:", payload);
                const { title, body } = payload.notification || {};
                if (title && body && Notification.permission === 'granted') {
                    new Notification(title, { body, icon: '/logo192.png' });
                }
            });
        }

    } catch (err) {
        console.error("🔥 FCM setup error:", err.message || err);
    }
};