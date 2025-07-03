import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupFirebaseMessaging } from '../utils/firebaseMessagingHandler';
import { getMessaging, onMessage } from 'firebase/messaging';
import { getApp } from 'firebase/app';

const FCMInitializer = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ Your custom logic (likely already initializes Firebase)
        setupFirebaseMessaging(navigate);

        // ✅ Use existing Firebase app instance
        const app = getApp();
        const messaging = getMessaging(app);

        // ✅ Register service worker for background notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/firebase-messaging-sw.js')
                .then((registration) => {
                    console.log('✅ FCM Service Worker registered:', registration);
                })
                .catch((error) => {
                    console.error('❌ FCM Service Worker registration failed:', error);
                });
        }

        // ✅ Handle foreground messages
        onMessage(messaging, (payload) => {
            console.log('📩 Foreground FCM message received:', payload);
        });
    }, [navigate]);

    return null;
};

export default FCMInitializer;
