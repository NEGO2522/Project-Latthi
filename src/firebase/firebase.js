// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
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
import { getDatabase, ref, set, push, onValue } from "firebase/database";

// Import environment variables
import env from '../env';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
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

// Action Code Settings for Email Link Authentication
const actionCodeSettings = {
  url: window.location.origin + '/login',
  handleCodeInApp: true,
};

// Auth state change handler
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user.uid);
  } else {
    // User is signed out
    console.log('User is signed out');
  }
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
  actionCodeSettings,
  ref, 
  set, 
  push, 
  onValue 
};