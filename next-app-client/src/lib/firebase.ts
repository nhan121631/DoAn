// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAQlyKAIkkMoXN88jKwIFsjeWzNq4zowoY",
  authDomain: "chatweb-78d98.firebaseapp.com",
  projectId: "chatweb-78d98",
  storageBucket: "chatweb-78d98.firebasestorage.app",
  messagingSenderId: "604423699850",
  appId: "1:604423699850:web:225895d6000ae8e04b5c73",
  measurementId: "G-BQBB733K6T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);