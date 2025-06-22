import { initializeApp } from 'firebase/app';
import { initializeAuth, indexedDBLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: "AIzaSyC2vCVCmw6w0Mtd5A1Dlw6O_r7rvXxejp0",
  authDomain: "coachasmaa-17191.firebaseapp.com",
  projectId: "coachasmaa-17191",
  storageBucket: "coachasmaa-17191.appspot.com",
  messagingSenderId: "687684731229",
  appId: "1:687684731229:web:0a7114080eae71a235e8b4"
};

const app = initializeApp(firebaseConfig);

// ✅ Fix for iOS WebView: force auth persistence manually
let auth;
if (Capacitor.isNativePlatform()) {
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  });
} else {
  auth = getAuth(app); // default persistence (web session/local)
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };