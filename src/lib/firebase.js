import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBNerHOLwPams7fNNzdHp6uvdcgaHus_DQ",
  authDomain: "habitappvfinal.firebaseapp.com",
  projectId: "habitappvfinal",
  storageBucket: "habitappvfinal.firebasestorage.app",
  messagingSenderId: "242618508937",
  appId: "1:242618508937:web:450b8c1cb837d045a44858",
  measurementId: "G-P7YBQJ2WKY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only in production
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Enable offline persistence and better error handling
try {
  enableNetwork(db).catch(error => {
    console.warn('Firebase network enable failed:', error);
  });
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export default app;