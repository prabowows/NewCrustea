'use client';

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://listriklistrik-44b64-default-rtdb.firebaseio.com/",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseConfigWater: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_WATER,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_WATER,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL_WATER,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_WATER,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_WATER,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_WATER,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WATER,
};

const firebaseConfigControl: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_CONTROL,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_CONTROL,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL_CONTROL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_CONTROL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_CONTROL,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_CONTROL,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_CONTROL,
};

function initializeFirebaseApp(config: FirebaseOptions, name: string): FirebaseApp {
    const apps = getApps();
    const existingApp = apps.find(app => app.name === name);
    if (existingApp) {
        return existingApp;
    }

    if (!config.databaseURL || !config.databaseURL.startsWith('https://')) {
        throw new Error(`Firebase FATAL ERROR: Invalid databaseURL for app "${name}". Check your .env file. It should be in the format https://<YOUR-PROJECT-ID>.firebaseio.com`);
    }
     if (!config.projectId) {
        throw new Error(`Firebase FATAL ERROR: Missing projectId for app "${name}". Check your .env file.`);
    }

    return initializeApp(config, name);
}


let app: FirebaseApp;
let appWater: FirebaseApp;
let appControl: FirebaseApp;

try {
    app = initializeFirebaseApp(firebaseConfig, '[DEFAULT]');
    appWater = initializeFirebaseApp(firebaseConfigWater, 'water');
    appControl = initializeFirebaseApp(firebaseConfigControl, 'control');
} catch (error) {
    console.error(error);
    // You can handle the error further here, maybe show a global error message to the user.
}


const database = getDatabase(app);
const databaseWater = getDatabase(appWater);
const databaseControl = getDatabase(appControl);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, database, auth, databaseWater, databaseControl, db };
