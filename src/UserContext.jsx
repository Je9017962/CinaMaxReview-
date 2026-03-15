// UserContext.jsx — Auth state via Firebase Authentication.
// Replaces the old SHA-256 + localStorage approach.
//
// Provides: { currentUser, signIn, signUp, signOut, updateProfile, loading }

import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase.js'
import {
  setUserProfile,
  getUserProfile,
  updateUserProfile as firestoreUpdateProfile,
} from './firestoreService.js'

const UserContext = createContext(null)

// ── Helper: build a username from email (fallback) ────────────────────────────
const emailToUsername = (email) => email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')

// ─────────────────────────────────────────────────────────────────────────────
export function UserProvider({ children }) {
  // currentUser shape: { uid, username, email, displayName, bio, avatarEmoji, joinedAt }
  const [currentUser, setCurrentUser] = useState(null)
  const [loading,     setLoading]     = useState(true)

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid)
        if (profile) {
          setCurrentUser({ uid: firebaseUser.uid, ...profile })
        } else {
          // Fallback: build a minimal session from Auth data only
          setCurrentUser({
            uid:         firebaseUser.uid,
            email:       firebaseUser.email,
            username:    emailToUsername(firebaseUser.email),
            displayName: emailToUsername(firebaseUser.email),
            bio:         '',
            avatarEmoji: '🎬',
            joinedAt:    new Date().toISOString(),
          })
        }
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // ── Sign Up ────────────────────────────────────────────────────────────────
  const signUp = async (username, email, password) => {
    // Client-side validation
    if (/\s/.test(username))      return 'Username cannot contain spaces.'
    if (username.length < 3)      return 'Username must be at least 3 characters.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address.'
    if (password.length < 6)      return 'Password must be at least 6 characters.'

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const uid  = cred.user.uid

      const profile = {
        username,
        email,
        displayName: username,
        bio:         '',
        avatarEmoji: '🎬',
        joinedAt:    new Date().toISOString(),
      }

      // Persist profile to Firestore /users/{uid}
      await setUserProfile(uid, profile)
      setCurrentUser({ uid, ...profile })
      return null
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') return 'Email already in use.'
      if (err.code === 'auth/invalid-email')        return 'Invalid email address.'
      if (err.code === 'auth/weak-password')        return 'Password must be at least 6 characters.'
      return err.message || 'Sign up failed.'
    }
  }

  // ── Sign In ────────────────────────────────────────────────────────────────
  // NOTE: Firebase Auth uses email, not username, for sign-in.
  const signIn = async (emailOrUsername, password) => {
    try {
      await signInWithEmailAndPassword(auth, emailOrUsername, password)
      // onAuthStateChanged listener above will update currentUser
      return null
    } catch (err) {
      // FIX: 'auth/user-not-found' and 'auth/wrong-password' were deprecated
      // in Firebase JS SDK v9.0+ and replaced with 'auth/invalid-credential'.
      // Handle both so the app works regardless of SDK patch version.
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password'
      ) return 'Incorrect email or password.'
      if (err.code === 'auth/invalid-email')     return 'Enter a valid email address.'
      if (err.code === 'auth/too-many-requests') return 'Too many attempts. Try again later.'
      if (err.code === 'auth/user-disabled')     return 'This account has been disabled.'
      return err.message || 'Sign in failed.'
    }
  }

  // ── Sign Out ───────────────────────────────────────────────────────────────
  const signOut = async () => {
    await firebaseSignOut(auth)
    // FIX: don't call setCurrentUser(null) manually here.
    // onAuthStateChanged fires synchronously after firebaseSignOut resolves
    // and sets currentUser to null via the listener. Calling setCurrentUser(null)
    // here as well causes a double state update and a potential race condition
    // if any component reads currentUser between the two calls.
  }

  // ── Update Profile ────────────────────────────────────────────────────────
  const updateProfile = async (fields) => {
    if (!currentUser) return
    await firestoreUpdateProfile(currentUser.uid, fields)
    setCurrentUser((prev) => ({ ...prev, ...fields }))
  }

  return (
    <UserContext.Provider value={{ currentUser, signIn, signUp, signOut, updateProfile, loading }}>
      {/* Don't render children until auth state is known */}
      {!loading && children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}
