import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Test function to verify Firestore write permissions
export const testFirestoreWrite = async (userId) => {
  console.log("🧪 Testing Firestore write permissions for user:", userId);
  
  try {
    const userRef = doc(db, 'users', userId);
    
    // Try to write a test field new
    await setDoc(userRef, {
      fcmTest: {
        timestamp: new Date(),
        message: "FCM test write successful"
      }
    }, { merge: true });
    
    console.log("✅ Firestore write test successful!");
    return true;
  } catch (error) {
    console.error("❌ Firestore write test failed:", error);
    return false;
  }
}; 

export const saveFCMTokenForUser = async (userId) => {
  console.log("🚀 saveFCMTokenForUser called for:", userId);
  
  try {
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    
    console.log("📱 Platform:", platform, "Is Native:", isNative);
    
    // Only proceed for native platforms (iOS/Android)
    if (!isNative) {
      console.log("🌐 Not native platform, skipping FCM token save");
      return;
    }
    
    // Request permissions
    console.log("🔐 Requesting FCM permissions...");
    const permission = await FirebaseMessaging.requestPermissions();
    console.log("🔐 Permission result:", permission);
    
    if (permission.receive !== 'granted') {
      console.warn("❌ FCM permission not granted");
      return;
    }
    
    // Get FCM token
    console.log("🎫 Getting FCM token...");
    const tokenResult = await FirebaseMessaging.getToken();
    const token = tokenResult?.token;
    
    console.log("🎫 FCM Token received:", token ? "YES" : "NO");
    
    if (!token) {
      console.warn("❌ No FCM token received");
      return;
    }
    
    // Save to Firestore
    console.log("💾 Saving token to Firestore...");
    const userRef = doc(db, 'users', userId);
    
    // Get existing tokens
    const userSnap = await getDoc(userRef);
    const existingData = userSnap.exists() ? userSnap.data() : {};
    const existingTokens = existingData.messaging?.fcmTokens || [];
    
    console.log("📋 Existing tokens count:", existingTokens.length);
    
    // Check if token already exists
    const tokenExists = existingTokens.some(entry => entry.token === token);
    
    if (tokenExists) {
      console.log("ℹ️ Token already exists in Firestore");
      return;
    }
    
    // Create new token entry
    const newTokenEntry = {
      token: token,
      platform: platform,
      lastUsed: new Date(),
      isActive: true
    };
    
    // Save to Firestore
    await setDoc(userRef, {
      messaging: {
        fcmTokens: arrayUnion(newTokenEntry),
        updatedAt: new Date()
      }
    }, { merge: true });
    
    console.log("✅ FCM token successfully saved to Firestore!");
    
  } catch (error) {
    console.error("❌ Error saving FCM token:", error);
    throw error;
  }
}; 