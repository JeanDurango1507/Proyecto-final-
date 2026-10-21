// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA66RmaM9GpQcC4RIQ2G53FD9k1HZaMxGE",
  authDomain: "billsupb.firebaseapp.com",
  projectId: "billsupb",
  storageBucket: "billsupb.firebasestorage.app",
  messagingSenderId: "382672485506",
  appId: "1:382672485506:web:7a5a3d12d36fd0e8e2089b",
  measurementId: "G-SFSR63B5NY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);



