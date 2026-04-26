// firebase.js — Initialize Firebase app and export Firestore + Auth instances.

import { initializeApp } from 'firebase/app'
import { getFirestore }   from 'firebase/firestore'
import { getAuth }        from 'firebase/auth'

// ── Firebase project config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyBeJ5MViR0-zvD2qZRPiiBwhCZj23a5P6Q',
  authDomain:        'cinamaxreview.firebaseapp.com',
  projectId:         'cinamaxreview',
  storageBucket:     'cinamaxreview.firebasestorage.app',
  messagingSenderId: '651036595708',
  appId:             '1:651036595708:web:76773a3625b6b947c70e79',
  measurementId:     'G-RYN1FNQ0PN',
}
// ─────────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig)

export const db   = getFirestore(app)
export const auth = getAuth(app)
