// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDjtxDuWZntWrgn14T7Y693t7Im8Z8HSRY",
  authDomain: "my-login-app-b768e.firebaseapp.com",
  projectId: "my-login-app-b768e",
  storageBucket: "my-login-app-b768e.firebasestorage.app",
  messagingSenderId: "105036235632",
  appId: "1:105036235632:web:fea963e0a97bafc35d05b5",
  measurementId: "G-EE6GLX9YPB"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);