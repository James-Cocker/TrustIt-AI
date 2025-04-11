import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
  // Use emulators only if they're running
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    connectAuthEmulator(auth, "http://localhost:9099")
    connectFirestoreEmulator(db, "localhost", 8080)
    console.log("Using Firebase emulators")
  }
}

export { app, auth, db }
