// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBgKDoYll9PH74eLlimwOBZuZqZUaumV4",
  authDomain: "laathi-a3be7.firebaseapp.com",
  projectId: "laathi-a3be7",
  storageBucket: "laathi-a3be7.firebasestorage.app",
  messagingSenderId: "800332723604",
  appId: "1:800332723604:web:831ee959461cc83a108b81",
  measurementId: "G-1Y44B5HM6K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Action Code Settings for Email Link Authentication
const actionCodeSettings = {
  url: window.location.origin + '/login',
  handleCodeInApp: true,
};

export { auth, googleProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signInWithPopup, actionCodeSettings };