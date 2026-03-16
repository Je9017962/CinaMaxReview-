# Transcript Highlights — CinaMaxReview

This file documents five key moments from my AI-assisted development process, demonstrating planning, debugging, iteration, and human judgment throughout the build.

---

### 1. Iterative Feature Planning — Breaking the Project into Steps

Rather than asking for a finished app in one prompt, I built CinaMaxReview incrementally. I first asked for a basic movie review site, then separately requested authentication ("create a sign in option to allow people to sign in and leave reviews"), then the rebrand, then poster images, and finally real 2026 movie data. A second major milestone followed: migrating the entire app from a localStorage prototype to a cloud-backed production app using Firebase Authentication and Firestore. Each step was its own focused prompt with a clear goal.

**Why it matters:** This demonstrates intentional, step-by-step development. I stayed in control of the project direction at every stage rather than accepting one large AI-generated output.

---

### 2. Debugging — Identifying and Fixing Multiple Bugs Across Two Phases

Bug-fixing was treated as a deliberate, separate pass in both the localStorage phase and the Firebase migration phase. In the original build, Claude identified issues like an unused `useCallback` import, a broken shimmer animation caused by a missing `background-repeat` property, a race condition in the auth handler, and duplicate SVG gradient IDs.

During the Firebase migration (Entries 14 & 16 of the transcript), a full static audit of the migrated files uncovered **9 additional bugs**, including:

- A seed race condition in `getMovies()` that could trigger a second `getDocs()` after `batch.commit()` and re-seed Firestore if propagation was slow
- `addMovie()` and `createReview()` both returning `serverTimestamp()` sentinel objects into React state, causing runtime crashes
- Deprecated Firebase SDK v9+ error codes (`auth/user-not-found`, `auth/wrong-password`) not handled, causing raw Firebase errors to surface
- `signOut()` calling both `firebaseSignOut(auth)` and `setCurrentUser(null)`, creating a double state update and potential race with `onAuthStateChanged`
- An uncleared `setTimeout` in `ReviewFormPage` causing a setState-after-unmount warning
- Stale edit state in `UserSubmissionsPage` after a review was saved

**Why it matters:** I didn't assume the generated code was correct. I treated bug-fixing as a separate, deliberate pass — sharing the code, getting a diagnosis, and verifying the fixes. This back-and-forth is exactly what collaborative debugging looks like.

---

### 3. Problem-Solving — Iterating Through Three Poster Image Approaches

When movie posters weren't displaying, I didn't accept the first fix. The debugging went through three distinct attempts:
- **Attempt 1:** Unsplash URLs — blocked by CORS/hotlink protection
- **Attempt 2:** TMDB API — I asked Claude "Can you update this to pull the movie image?" and we set up a TMDB integration, but it returned no results for fictional movies
- **Attempt 3:** I pushed back — "No image is shown, can we pull the movie poster from the web?" — leading to a Claude web-search approach that dynamically finds real poster URLs

**Why it matters:** This shows genuine problem-solving iteration. I didn't accept broken behavior. I described the symptom, tried a fix, observed the result, and redirected — three times — until it worked.

---

### 4. Human Judgment — Choosing the Right Architecture at Each Stage

When building the initial authentication system, Claude's suggestion involved a full state management pattern. I evaluated it and chose to keep auth as a simple React Context with localStorage persistence — appropriate for the prototype phase. Later, when scoping the Firebase migration, I made the deliberate decision to replace the hand-rolled SHA-256 hash + localStorage session with Firebase Authentication (Email/Password provider), and to replace the localStorage CRUD helpers with Firestore async operations.

I also exercised judgment on implementation details. I rejected a poster-loading approach that required users to paste a TMDB API key ("too much friction for a demo app") and opted for an automated web-search approach instead. On the Firestore migration, I chose an early-return pattern for sign-in gating (co-locating auth checks in each page component) over introducing a separate `PrivateRoute` abstraction, keeping the logic simple and readable.

**Why it matters:** These decisions show I was evaluating AI output critically — weighing complexity against project scope — rather than blindly accepting whatever was generated. The progression from localStorage to Firebase also reflects deliberate architectural growth, not accidental drift.

---

### 5. Data Architecture Decision — Designing the Firestore Schema

Before writing any CRUD code for the Firebase migration, I worked with Claude to define the Firestore data model. We landed on three collections: `/movies`, `/reviews`, and `/users`. Key design decisions included:

- **UID as the ownership key** — every review stores the author's Firebase UID (not username), so renaming a display name never orphans reviews. Firestore security rules enforce that only the matching UID can mutate a document.
- **Denormalised display fields** — reviews also store `username` and `displayName` at write time to avoid a second Firestore read on every review render. The accepted trade-off: old reviews display the name used at the time of writing.
- **Graceful guest path** — rather than hard-blocking unauthenticated users, the review form accepts guest reviews with `uid: null`, preserving the experience for casual visitors while enabling edit/delete for signed-in users.
- **Atomic seeding** — `getMovies()` checks whether the `/movies` collection is empty on first call and batch-writes 8 seed films using `writeBatch()` if so. Batches are atomic, preventing a half-seeded catalogue.
- **serverTimestamp() handled safely** — both `addMovie()` and `createReview()` return `createdAt: null` rather than the Firebase sentinel object, since it cannot be stored in React state. The real `Timestamp` is available on subsequent Firestore reads.

**Why it matters:** Thinking through data structure before writing code prevented major refactoring later. It also demonstrates that I understood the tradeoffs — ownership, denormalisation, guest access, and async boundaries — not just the implementation.

---

## Feature Summary

| # | Feature | Description |
|---|---------|-------------|
| 1 | Movie browsing | Grid view with search and genre filtering |
| 2 | Movie detail page | Full synopsis, stats, reviews list |
| 3 | User authentication | Firebase Auth (Email/Password); sign up, sign in, sign out with persistent sessions via `onAuthStateChanged` |
| 4 | Review submission | Star rating + text review, validated form; reviews tied to Firebase UID |
| 5 | My Submissions page | View, edit, and delete your own reviews |
| 6 | Dark / Light mode | Theme toggle with localStorage persistence and CSS variables |
| 7 | React Router | Multi-page SPA with auth-gated routes (Add Movie, Profile, My Submissions) |
| 8 | AI review helper | Claude API generates review suggestions in-app |
| 9 | Firestore data layer | Full replacement of localStorage CRUD with async Firestore operations across 11 files |
| 10 | Firestore security rules | Server-side ownership rules for `/reviews`, `/movies`, and `/users` collections |
| 11 | Add Movie page | Authenticated users can submit new movies; stored with `addedByUid` |
| 12 | Profile page | View and edit display name, bio, and avatar emoji; stats loaded by UID |
