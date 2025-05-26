// src/firebase/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';





// ✅ Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2vCVCmw6w0Mtd5A1Dlw6O_r7rvXxejp0",
    authDomain: "coachasmaa-17191.firebaseapp.com",
    projectId: "coachasmaa-17191",
    storageBucket: "coachasmaa-17191.firebasestorage.app",
    messagingSenderId: "687684731229",
    appId: "1:687684731229:web:0a7114080eae71a235e8b4",
    vapidKey: "BFmXUcLHuLyRYN6WtpnCRvREbYJ06rpPJJR7rugpVeOp8N-izcdh7LOq9hP-TeIYNlW7P4GsIpBYQp9v5kqZd-g"

};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Export services for use across app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
