'use client';

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


function initializeFirebaseApp(config: FirebaseOptions, name: string): FirebaseApp {
    const apps = getApps();
    const existingApp = apps.find(app => app.name === name);
    if (existingApp) {
        return existingApp;
    }

    if (!config.projectId) {
        throw new Error(`Firebase FATAL ERROR: Missing projectId for app "${name}". Check your .env file.`);
    }

    return initializeApp(config, name);
}


let app: FirebaseApp;
let database: any, databaseWater: any, databaseControl: any;

try {
    app = initializeFirebaseApp(firebaseConfig, '[DEFAULT]');
    database = getDatabase(app);
    databaseWater = getDatabase(app);
    databaseControl = getDatabase(app);
} catch (error) {
    console.error(error);
}


const auth = getAuth(app);
const db = getFirestore(app);

export { app, database, auth, databaseWater, databaseControl, db };
