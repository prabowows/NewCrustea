
'use client';

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is now the single source of truth for the dashboard connection.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAaGuVS3qpfBJisbxbTvTTo9rEpHxH3qLw",
  authDomain: "crustea-iot-dashboard.firebaseapp.com",
  databaseURL: "https://crustea-iot-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "crustea-iot-dashboard",
  storageBucket: "crustea-iot-dashboard.appspot.com",
  messagingSenderId: "769130524805",
  appId: "1:769130524805:web:4bd799c00c9921c2a1f9ec",
  measurementId: "G-87YJDYNM9T"
};


// A single app initialization is cleaner.
function initializeFirebaseApp(config: FirebaseOptions, name?: string): FirebaseApp {
    const apps = getApps();
    const appName = name || '[DEFAULT]';
    const existingApp = apps.find(app => app.name === appName);
    if (existingApp) {
        return existingApp;
    }

    if (!config.databaseURL || !config.databaseURL.startsWith('https://')) {
        throw new Error(`Firebase FATAL ERROR: Invalid databaseURL for app "${name}". Check your .env file or config. It should be in the format https://<YOUR-PROJECT-ID>.firebasedatabase.app`);
    }
     if (!config.projectId) {
        throw new Error(`Firebase FATAL ERROR: Missing projectId for app "${name}". Check your .env file.`);
    }

    return initializeApp(config, appName);
}


let app: FirebaseApp;

try {
    // Initialize one single app connection
    app = initializeFirebaseApp(firebaseConfig);
} catch (error) {
    console.error(error);
    // You can handle the error further here, maybe show a global error message to the user.
}


// All database instances now point to the same app and thus the same database URL.
const database = getDatabase(app);
const databaseWater = getDatabase(app); // Points to the same database
const databaseControl = getDatabase(app); // Points to the same database
const auth = getAuth(app);
const db = getFirestore(app);

export { app, database, auth, databaseWater, databaseControl, db };
