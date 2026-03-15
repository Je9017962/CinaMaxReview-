// firestoreService.js — All Firestore CRUD operations for CinaMax Review.
// Drop-in replacement for localStorage.js — import from here in all components.
//
// Collections:
//   /movies   — film catalogue (seeded + user-added)
//   /reviews  — all reviews; each doc stores uid of the author
//   /users    — profile data keyed by Firebase Auth uid

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

// ── Collection refs ───────────────────────────────────────────────────────────
const moviesCol  = collection(db, 'movies')
const reviewsCol = collection(db, 'reviews')
const usersCol   = collection(db, 'users')

// ── Seed data (run once when the movies collection is empty) ──────────────────
const SEED_MOVIES = [
  {
    title: 'Dune: Part Two', year: 2024,
    director: 'Denis Villeneuve', genre: ['Sci-Fi', 'Adventure'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen to seek revenge against the conspirators who destroyed his family.',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    userAdded: false,
  },
  {
    title: 'Oppenheimer', year: 2023,
    director: 'Christopher Nolan', genre: ['Drama', 'Thriller'],
    synopsis: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    userAdded: false,
  },
  {
    title: 'Poor Things', year: 2023,
    director: 'Yorgos Lanthimos', genre: ['Drama', 'Romance'],
    synopsis: 'The incredible tale of Bella Baxter, a young woman brought back to life by an eccentric scientist.',
    poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXExtvSD0ogg4QV.jpg',
    userAdded: false,
  },
  {
    title: 'Past Lives', year: 2023,
    director: 'Celine Song', genre: ['Drama', 'Romance'],
    synopsis: 'Two childhood friends reunite in New York City after 20 years apart, examining destiny, choice, and love.',
    poster: 'https://image.tmdb.org/t/p/w500/k3waqVXsnaHb02LT7RIkaODLKDjp.jpg',
    userAdded: false,
  },
  {
    title: 'Killers of the Flower Moon', year: 2023,
    director: 'Martin Scorsese', genre: ['Drama', 'Thriller'],
    synopsis: 'Members of the Osage Nation are murdered under mysterious circumstances, sparking the birth of the FBI.',
    poster: 'https://image.tmdb.org/t/p/w500/dB6J5zsSXPmMEHLKAkjV3bFSSgB.jpg',
    userAdded: false,
  },
  {
    title: 'The Holdovers', year: 2023,
    director: 'Alexander Payne', genre: ['Drama', 'Comedy'],
    synopsis: 'A curmudgeonly instructor is forced to stay on campus over the holidays with a troublemaker student and a grieving cook.',
    poster: 'https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdgbA.jpg',
    userAdded: false,
  },
  {
    title: 'Saltburn', year: 2023,
    director: 'Emerald Fennell', genre: ['Drama', 'Thriller'],
    synopsis: 'A student at Oxford University finds himself drawn into the world of a charming and aristocratic classmate.',
    poster: 'https://image.tmdb.org/t/p/w500/qjhahNLSZ705B5JP92YMEYPocPz.jpg',
    userAdded: false,
  },
  {
    title: 'The Zone of Interest', year: 2023,
    director: 'Jonathan Glazer', genre: ['Drama'],
    synopsis: 'The commandant of Auschwitz and his wife attempt to build a dream life next to the camp.',
    poster: 'https://image.tmdb.org/t/p/w500/hUe8p3s8P7oKULHBYKORDGFpxqb.jpg',
    userAdded: false,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// MOVIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all movies. Seeds the collection on first run if empty.
 * Returns array of { id, ...fields }
 */
export async function getMovies() {
  const snap = await getDocs(moviesCol)

  // Seed once when collection is empty.
  // FIX: Build the return value directly from SEED_MOVIES + generated IDs
  // rather than issuing a second getDocs() — avoids a race where the
  // re-fetch runs before Firestore propagates the batch write.
  if (snap.empty) {
    const batch = writeBatch(db)
    const seeded = SEED_MOVIES.map((m) => {
      const ref = doc(moviesCol)          // generate ID client-side
      batch.set(ref, { ...m, createdAt: serverTimestamp() })
      return { id: ref.id, ...m }         // return without sentinel timestamp
    })
    await batch.commit()
    return seeded
  }

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Add a user-submitted movie.
 * @param {object} movie  — { title, year, director, genre[], synopsis, poster? }
 * @param {object} user   — { uid, username, displayName }
 * @returns {object}      — saved movie with Firestore id
 */
export async function addMovie(movie, user) {
  const payload = {
    title:       movie.title,
    year:        Number(movie.year),
    director:    movie.director,
    genre:       movie.genre,
    synopsis:    movie.synopsis,
    poster:      movie.poster || '',
    userAdded:   true,
    addedByUid:  user.uid,
    addedBy:     user.username,
    createdAt:   serverTimestamp(),
  }
  const ref = await addDoc(moviesCol, payload)
  // FIX: serverTimestamp() returns a sentinel object that is NOT serialisable
  // and crashes if stored in React state. Return null for createdAt; the real
  // Timestamp will be present when the document is next fetched from Firestore.
  return { id: ref.id, ...payload, createdAt: null }
}

/**
 * Fetch a single movie by its Firestore document ID.
 * FIX: MovieDetailPage previously called getMovies() (fetches ALL movies) just
 * to find one. This replaces that with a direct document read — much cheaper.
 * @param {string} movieId
 * @returns {object|null}
 */
export async function getMovieById(movieId) {
  const snap = await getDoc(doc(moviesCol, movieId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all reviews for a given movieId.
 * @param {string} movieId — Firestore movie document ID
 * @returns {array}        — reviews sorted newest-first
 */
export async function getReviewsByMovie(movieId) {
  const q = query(
    reviewsCol,
    where('movieId', '==', movieId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Fetch all reviews written by a specific user (by uid).
 * @param {string} uid — Firebase Auth UID
 * @returns {array}
 */
export async function getUserReviews(uid) {
  const q = query(
    reviewsCol,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * Create a new review.
 * @param {object} review — { movieId, stars, text, guestName? }
 * @param {object} user   — { uid, username, displayName, avatarEmoji } | null for guests
 * @returns {object}      — saved review with Firestore id
 *
 * NOTE: Guest reviews (user = null) will be REJECTED by Firestore security
 * rules in production because isReviewAuthor() requires uid == request.auth.uid
 * and uid:null fails that check. Guest writes only work in test/open rules mode.
 * The UI shows a sign-in nudge to guests but does not hard-block during dev.
 */
export async function createReview(review, user) {
  const isGuest = !user
  const payload = {
    movieId:     review.movieId,
    stars:       review.stars,
    text:        review.text.trim(),
    uid:         user?.uid ?? null,    // FIX: use ?? not || so a falsy uid stays null
    username:    user?.username || (review.guestName?.trim() || 'Guest'),
    displayName: user?.displayName || (review.guestName?.trim() || 'Guest'),
    avatarEmoji: user?.avatarEmoji || null,
    isGuest,
    createdAt:   serverTimestamp(),
    date:        new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  }
  const ref = await addDoc(reviewsCol, payload)
  // FIX: strip the serverTimestamp sentinel before returning to React state
  return { id: ref.id, ...payload, createdAt: null }
}

/**
 * Update stars and/or text of an existing review.
 * Only the owner (matched by uid) should call this — enforce in Firestore rules too.
 * @param {string} reviewId      — Firestore review doc ID
 * @param {object} updatedFields — { stars?, text? }
 */
export async function updateReview(reviewId, updatedFields) {
  const ref = doc(db, 'reviews', reviewId)
  await updateDoc(ref, {
    ...updatedFields,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a review by its Firestore ID.
 * @param {string} reviewId
 */
export async function deleteReview(reviewId) {
  await deleteDoc(doc(db, 'reviews', reviewId))
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILES  (stored in /users/{uid})
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create or overwrite a user profile document.
 * Called after sign-up to persist the initial profile.
 * @param {string} uid
 * @param {object} profile — { username, email, displayName, bio, avatarEmoji, joinedAt }
 */
export async function setUserProfile(uid, profile) {
  await setDoc(doc(usersCol, uid), profile, { merge: true })
}

/**
 * Fetch a user profile document.
 * @param {string} uid
 * @returns {object|null}
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(usersCol, uid))
  return snap.exists() ? { uid, ...snap.data() } : null
}

/**
 * Update specific profile fields.
 * @param {string} uid
 * @param {object} fields — { displayName?, bio?, avatarEmoji? }
 */
export async function updateUserProfile(uid, fields) {
  await updateDoc(doc(usersCol, uid), fields)
}
