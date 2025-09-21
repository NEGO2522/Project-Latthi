// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { getDatabase, ref, set, push, onValue, remove, get } from "firebase/database";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  // Realtime Database URL - Using default region
  databaseURL: "https://e-commerce-9ddae-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If the app is already initialized, use that instance
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
}
}

const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);

const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account', // Forces account selection even when one account is available
});

export { 
  app,
  auth, 
  database,
  googleProvider, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signInWithPopup, 
  onAuthStateChanged,
  ref, 
  set, 
  push, 
  onValue,
  remove,
  get
};