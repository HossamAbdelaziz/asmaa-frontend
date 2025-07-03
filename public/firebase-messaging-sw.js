// public/firebase-messaging-sw.js

// ✅ Import Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

// ✅ Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyC2vCVCmw6w0Mtd5A1Dlw6O_r7rvXxejp0",
    authDomain: "coachasmaa-17191.firebaseapp.com",
    projectId: "coachasmaa-17191",
    storageBucket: "coachasmaa-17191.firebasestorage.app",
    messagingSenderId: "687684731229",
    appId: "1:687684731229:web:0a7114080eae71a235e8b4"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// ✅ Background Push Handler (displays popup when browser is closed/inactive)
messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Background message:', payload);

    const notificationTitle = payload.notification?.title || "New Notification";
    const notifId = payload.data?.notifId || null;

    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/logo192.png',
        badge: '/logo192.png',
        image: payload.notification?.image || undefined,
        vibrate: [200, 100, 200],
        sound: 'default',
        data: {
            notifId: notifId,
            click_action: `/notifications/${notifId}`
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Notification Click Handler (deep links to /notifications/:id)
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const notifId = event.notification?.data?.notifId;
    const targetUrl = notifId ? `/notifications/${notifId}` : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                // If already open, navigate and focus
                if ('focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            // Otherwise open new tab
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
