import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
export const analytics = getAnalytics(app);

export default app;