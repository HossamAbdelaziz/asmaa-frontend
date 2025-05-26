import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getApp } from 'firebase/app';

// ✅ Web VAPID Key (safe to expose)
const webVapidKey = "BFmXUcLHuLyRYN6WtpnCRvREbYJ06rpPJJR7rugpVeOp8N-izcdh7LOq9hP-TeIYNlW7P4GsIpBYQp9v5kqZd-g";

export const setupFirebaseMessaging = async (navigate) => {
    try {
        console.log("🚀 useFCM: Starting FCM setup...");

        if (Capacitor.isNativePlatform()) {
            // ✅ Native app: Capacitor FCM
            const permStatus = await FirebaseMessaging.requestPermissions();
            console.log("📲 Native FCM Permission status:", permStatus);

            if (permStatus.receive !== 'granted') {
                console.warn('❌ Native FCM permission not granted');
                return;
            }

            const result = await FirebaseMessaging.getToken();
            const token = result?.token;
            console.log("🔐 Native FCM Token:", token || "⚠️ null");

            if (token) localStorage.setItem("fcmToken", token);

            // ✅ Native: Handle foreground notification (if needed)
            FirebaseMessaging.addListener('notificationReceived', (event) => {
                console.log('📩 Native foreground notification:', event);
                // You could later show a Toast, Alert, or Local Notification here if desired
            });

            FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
                console.log('👉 Native notification tapped:', event);
                const notifId = event.notification?.data?.notifId;
                if (notifId) navigate(`/notifications/${notifId}`);
            });

        } else {
            // ✅ Web browser
            console.log("🌐 Setting up FCM for web...");

            const permission = await Notification.requestPermission();
            console.log("🔐 Web Notification Permission:", permission);

            if (permission !== 'granted') {
                console.warn('❌ Web notifications not allowed');
                return;
            }

            const app = getApp();
            const messaging = getMessaging(app);

            const token = await getToken(messaging, {
                vapidKey: webVapidKey
            });

            console.log("🔐 Web FCM Token:", token || "⚠️ null");
            if (token) localStorage.setItem("fcmToken", token);

            // ✅ Web: Show system notification when app is open
            onMessage(messaging, (payload) => {
                console.log("📩 Web foreground message:", payload);

                const { title, body } = payload.notification || {};
                if (title && body && Notification.permission === 'granted') {
                    new Notification(title, {
                        body,
                        icon: '/logo192.png' // Optional: fallback icon
                    });
                }
            });
        }

    } catch (error) {
        console.error("🔥 FCM setup error:", error.message || error);
    }
};
