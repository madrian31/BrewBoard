import { getApp, getApps, initializeApp } from 'firebase/app'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// getApps() check para hindi mag-error sa hot reload ng Vite
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

function createDb() {
  try {
    // Offline cache: bumubukas agad ang app at gumagana kahit walang internet
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  } catch {
    // Naka-initialize na (hot reload) o walang IndexedDB
    return getFirestore(app)
  }
}

export const db = createDb()
export const auth = getAuth(app)
