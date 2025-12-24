
'use client';

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


function initializeFirebaseApp(config: FirebaseOptions): FirebaseApp {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0];
    }
    
    if (!config.projectId) {
        throw new Error("Firebase FATAL ERROR: Missing projectId. Check your .env.local file.");
    }

    return initializeApp(config);
}


let app: FirebaseApp;
let database: any;
let storage: any;

try {
    app = initializeFirebaseApp(firebaseConfig);
    database = getDatabase(app);
    storage = getStorage(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}


// @ts-ignore
const auth = getAuth(app);
// @ts-ignore
const db = getFirestore(app);

export { app, database, auth, db, storage };
