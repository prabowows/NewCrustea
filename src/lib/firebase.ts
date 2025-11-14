// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// TODO: Add your own Firebase configuration from your Firebase project settings
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://listriklistrik-44b64-default-rtdb.firebaseio.com/",
  projectId: "esp32water-monitor",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfigWater = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_WATER,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_WATER,
  databaseURL: "https://esp32water-monitor-default-rtdb.firebaseio.com/",
  projectId: "esp32water-monitor",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_WATER,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_WATER,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WATER,
  appName: "water"
};

const firebaseConfigControl = {
  databaseURL: "https://smartcontroltrial-default-rtdb.firebaseio.com/",
};


// Initialize Firebase
// A bit of a hack to avoid re-initializing apps, Next.js hot-reloading can cause issues.
const app = getApps().find(app => app.name === '[DEFAULT]') || initializeApp(firebaseConfig, '[DEFAULT]');
const appWater = getApps().find(app => app.name === 'water') || initializeApp(firebaseConfigWater, 'water');
const appControl = getApps().find(app => app.name === 'control') || initializeApp(firebaseConfigControl, 'control');


const database = getDatabase(app);
const databaseWater = getDatabase(appWater);
const databaseControl = getDatabase(appControl);
const auth = getAuth(app);

export { app, database, auth, databaseWater, databaseControl };
