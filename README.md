# CinaMaxReview — Complete Tier Web Application

CinaMaxReview is a full-stack movie review platform that allows users to browse films, read community reviews, and contribute their own reviews. The application supports authenticated user accounts, persistent cloud-stored reviews, and a responsive interface designed for both desktop and mobile users.

This project demonstrates a complete AI-assisted development workflow, including planning, debugging, backend integration, and iterative refinement.

---

## Live Demo

**[https://cinamaxreview.netlify.app/](https://cinamaxreview.netlify.app/)**

---

## Screenshots

> Add screenshots here before submitting — replace these placeholders with real images.
> Tip: Take a screenshot of the movie list, the detail page, and the dark/light mode toggle.
> Drag images into the GitHub README editor or use: `![Alt text](./screenshots/home.png)`

| Home — Movie Grid | Movie Detail | Dark Mode |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## Features

### Core Features
- Browse a list of movies with posters and ratings
- View detailed movie information and community reviews
- Submit star-rated reviews for any movie (authenticated or guest)
- Add custom movies not already in the catalogue
- View, edit, and delete your own submitted reviews (My Submissions)
- Edit your profile, display name, bio, and avatar emoji
- Toggle between light and dark mode (persisted across sessions)
- Fully responsive user interface for desktop and mobile
- AI-assisted review suggestions powered by the Claude API

### Complete Tier Backend Features
- Firebase Authentication (email and password sign-up, sign-in, sign-out)
- Firestore database for movies, reviews, and user profiles
- User-specific data isolation — each user sees and manages only their own reviews
- Secure CRUD operations tied to authenticated Firebase UIDs
- Firestore security rules enforcing ownership on create, update, and delete
- Field-level update whitelist preventing uid or movieId spoofing on edits
- Graceful guest path, unauthenticated users can browse and submit guest reviews

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Custom CSS / CSS Modules

### Backend
- Firebase Authentication
- Firebase Firestore
- Firestore Security Rules

### Tooling
- Git and GitHub
- Netlify (deployment)
- Claude AI (planning, debugging, and code generation)

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Je9017962/CinaMaxReview-.git
cd CinaMaxReview-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add Firebase configuration

Open `src/firebase.js` and replace the placeholder values with your project credentials:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

> The app will throw an "invalid API key" error on first load if placeholders are left in place.

### 4. Enable Firebase services

In the [Firebase console](https://console.firebase.google.com):
- **Firestore Database** → Create database
- **Authentication** → Sign-in method → Enable **Email/Password**
- **Firestore Rules** → Paste the security rules from the comment block in `firebase.js`

> Two composite indexes are required for compound queries. When `getReviewsByMovie()` and `getUserReviews()` run for the first time, Firestore will log a link to create each index. Click the link, wait ~60 seconds, and the queries will work.

### 5. Start the development server
```bash
npm run dev
```

On first load, `getMovies()` will detect an empty `/movies` collection and batch-write 8 seed films automatically.

---

## Architecture Overview

CinaMaxReview is structured as a modern full-stack web application with a clear separation between the frontend interface, authentication layer, and cloud database.

### Frontend file structure

| File | Role |
|------|------|
| `App.jsx` | Root layout, routing, and theme management |
| `MovieListPage.jsx` | Displays all movies; header with dynamic auth UI |
| `MovieDetailPage.jsx` | Movie info + reviews, parallel Firestore fetches |
| `ReviewFormPage.jsx` | Review submission; authenticated and guest paths |
| `UserSubmissionsPage.jsx` | User's own reviews with edit/delete |
| `AddMoviePage.jsx` | Auth-gated movie submission form |
| `ProfilePage.jsx` | Editable profile — display name, bio, avatar emoji |
| `AuthModal.jsx` | Sign-in and sign-up modal |
| `UserContext.jsx` | Global auth state via Firebase `onAuthStateChanged` |
| `firebase.js` | Firebase app initialisation; exports `db` and `auth` |
| `firestoreService.js` | All async CRUD: movies, reviews, user profiles |

### Authentication flow

1. User opens the application
2. `UserContext` sets up a single `onAuthStateChanged` listener
3. On session detected → fetches Firestore profile → sets `currentUser` in React state
4. `loading` gate (`{!loading && children}`) prevents a flash of the signed-out state on refresh
5. Auth-gated routes (`/add-movie`, `/profile`, `/my-submissions`) use an early-return pattern — no separate `PrivateRoute` wrapper needed

### Data flow

```
[User Action]
      |
      v
[React Component]
      |
      v
[UserContext] ──────────────────> [Firebase Auth]
      |
      v
[firestoreService.js]
      |
      v
[Firestore Database: /movies · /reviews · /users]
      |
      v
[UI updates with live data]
```

---

## Database Schema (Firestore)

### `/movies`

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Movie title |
| `year` | number | Release year |
| `director` | string | Director name |
| `genre` | string[] | Genre tags |
| `synopsis` | string | Plot summary |
| `poster` | string | Poster image URL |
| `userAdded` | boolean | True for user-submitted films |
| `addedByUid` | string \| null | Firebase UID of submitter |
| `addedBy` | string | Display username of submitter |
| `createdAt` | Timestamp | Firestore server timestamp |

### `/reviews`

| Field | Type | Description |
|-------|------|-------------|
| `movieId` | string | Firestore movie document ID |
| `stars` | number | Rating 1–5 |
| `text` | string | Review content |
| `uid` | string \| null | Firebase UID — null for guest reviews |
| `username` | string | Stored at write time for display (denormalised) |
| `displayName` | string | Display name at time of review |
| `avatarEmoji` | string \| null | Avatar emoji at time of review |
| `isGuest` | boolean | True for unauthenticated submissions |
| `date` | string | Human-readable date (e.g. "Mar 15, 2026") |
| `createdAt` | Timestamp | Firestore server timestamp |
| `updatedAt` | Timestamp? | Set on edit |

### `/users/{uid}`

| Field | Type | Description |
|-------|------|-------------|
| `username` | string | Chosen username |
| `email` | string | Account email address |
| `displayName` | string | Display name (editable) |
| `bio` | string | Profile bio |
| `avatarEmoji` | string | Avatar emoji |
| `joinedAt` | string | ISO date string of account creation |

### Key design decisions

- **UID as the ownership key** — reviews store `uid`, not `username`, so display name changes never orphan reviews
- **Denormalised display fields** — `username` and `displayName` stored on each review at write time to avoid a second Firestore read per render; trade-off: old reviews show the name used at the time of writing
- **Guest path** — reviews with `uid: null` preserve the experience for unauthenticated visitors; `isGuest` flag renders a "GUEST" badge in the UI
- **Atomic seeding** — `writeBatch()` writes all 8 seed films in one atomic operation; prevents a half-seeded catalogue on slow connections
- **`serverTimestamp()` handled safely** — both `addMovie()` and `createReview()` return `createdAt: null`; the Firebase sentinel object cannot be stored in React state, so the real `Timestamp` is read on the next Firestore fetch

---

## Known Bugs or Limitations

- Movie search is limited to the seeded dataset and user-submitted films; no external search API integration
- Advanced filtering and sorting (e.g. by year or rating) are not implemented
- Poster images rely on external URLs and may break if the source removes the image
- Display name changes do not retroactively update the `displayName` field on old reviews

---

## What I Learned

Building CinaMaxReview strengthened my understanding of full-stack web development using React and Firebase. I learned how to structure a React application with clear separation between components, authentication context, and database service layers.

The project required migrating a working localStorage prototype to a cloud-backed Firebase architecture, including rewriting the auth system from a hand-rolled SHA-256 hash to Firebase Authentication, replacing synchronous localStorage helpers with async Firestore operations across 11 files, and writing Firestore security rules that enforce ownership at the database level.

Working iteratively with AI tools improved my ability to plan features before writing code, diagnose bugs systematically, and evaluate architectural suggestions critically. Key decisions, such as choosing an early-return auth gating pattern over a `PrivateRoute` abstraction, and designing the Firestore schema to use UID as the ownership key rather than username, came from evaluating trade-offs rather than accepting the first suggestion.

This project improved my understanding of async data fetching, data modelling for cloud databases, security rule design, and the full arc of iterative AI-assisted development.
