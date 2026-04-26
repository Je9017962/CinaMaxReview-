// firebase.js — Initialize Firebase app and export Firestore + Auth instances.

import { initializeApp } from 'firebase/app'
import { getFirestore }   from 'firebase/firestore'
import { getAuth }        from 'firebase/auth'

// ── Firebase project config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig)

export const db   = getFirestore(app)
export const auth = getAuth(app)

/*
  ── Recommended Firestore Security Rules ──────────────────────────────────────

  Paste these into Firebase Console → Firestore → Rules:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {

      // Movies: anyone can read; only authenticated users can create
      match /movies/{movieId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null
          && request.auth.uid == resource.data.addedByUid;
      }

      // Reviews: anyone can read; owner can create/edit/delete
      match /reviews/{reviewId} {
        allow read: if true;
        allow create: if request.auth != null
          && request.auth.uid == request.resource.data.uid;
        allow update, delete: if request.auth != null
          && request.auth.uid == resource.data.uid;
      }

      // Users: owner can read/write their own profile doc
      match /users/{uid} {
        allow read:  if request.auth != null && request.auth.uid == uid;
        allow write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
*/
