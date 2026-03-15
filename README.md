<h1>CinaMaxReview — Complete Tier Web Application</h1>

<p>
CinaMaxReview is a full-stack movie review platform that allows users to browse films,
read community reviews, and contribute their own reviews. The application supports
authenticated user accounts, persistent cloud-stored reviews, and a responsive interface
designed for both desktop and mobile users.
</p>

<p>
This project demonstrates a complete AI-assisted development workflow, including planning,
debugging, backend integration, and iterative refinement.
</p>

<hr>

<h2>Live Demo</h2>

<p><strong>Netlify Deployment</strong></p>

<p>
<a href="https://cinamaxreview.netlify.app/" target="_blank">
https://cinamaxreview.netlify.app/
</a>
</p>

<hr>

<h2>Features</h2>

<h3>Core Features</h3>

<ul>
<li>Browse a list of movies with posters and ratings</li>
<li>View detailed movie information</li>
<li>Submit reviews for any movie</li>
<li>Add custom movies not already in the list</li>
<li>View all user-submitted movies and reviews</li>
<li>Toggle between light and dark mode</li>
<li>Fully responsive user interface</li>
<li>AI-assisted review suggestions using Claude</li>
</ul>

<h3>Complete Tier Backend Features</h3>

<ul>
<li>Firebase Authentication (email and password login)</li>
<li>Firestore database for movies and reviews</li>
<li>User-specific data isolation</li>
<li>Secure CRUD operations tied to authenticated users</li>
<li>Firestore security rules enforcing ownership and read/write permissions</li>
</ul>

<hr>

<h2>Tech Stack</h2>

<h3>Frontend</h3>

<ul>
<li>React</li>
<li>Vite</li>
<li>React Router</li>
<li>Custom CSS / CSS Modules</li>
</ul>

<h3>Backend</h3>

<ul>
<li>Firebase Authentication</li>
<li>Firebase Firestore</li>
<li>Firestore Security Rules</li>
</ul>

<h3>Tooling</h3>

<ul>
<li>Git and GitHub</li>
<li>Netlify Deployment</li>
<li>Claude AI (planning, debugging, and code generation)</li>
</ul>

<hr>

<h2>Setup Instructions</h2>

<h3>1. Clone the Repository</h3>

<pre><code>
git clone https://github.com/Je9017962/CinaMaxReview-.git
cd CinaMaxReview-
</code></pre>

<h3>2. Install Dependencies</h3>

<pre><code>
npm install
</code></pre>

<h3>3. Add Firebase Configuration</h3>

<p>Create a file named <code>firebase.js</code> inside the <code>src/</code> directory and add your Firebase configuration:</p>

<pre><code>
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
</code></pre>

<h3>4. Start the Development Server</h3>

<pre><code>
npm run dev
</code></pre>

<hr>

<h2>Complete Tier Architecture Overview</h2>

<p>
CinaMaxReview is structured as a modern full-stack web application with a clear
separation between the frontend interface, authentication layer, and cloud database.
</p>

<h3>Frontend Architecture</h3>

<ul>
<li><strong>App.jsx</strong> — root layout, routing, and theme management</li>
<li><strong>MovieList.jsx</strong> — displays all movies</li>
<li><strong>MovieDetail.jsx</strong> — shows movie information and reviews</li>
<li><strong>ReviewForm.jsx</strong> — authenticated review submission</li>
<li><strong>UserSubmissions.jsx</strong> — user-specific reviews</li>
<li><strong>AuthModal.jsx</strong> — login and signup interface</li>
<li><strong>contexts/AuthContext.jsx</strong> — global authentication state</li>
<li><strong>firebase.js</strong> — Firebase initialization</li>
</ul>

<h3>Backend Architecture</h3>

<h4>Firebase Authentication</h4>

<ul>
<li>Handles sign-up, login, and logout</li>
<li>Provides currentUser to the application</li>
</ul>

<h4>Firestore Database</h4>

<ul>
<li>Stores movie data</li>
<li>Stores reviews tied to user IDs</li>
<li>Enforces security rules</li>
</ul>

<hr>

<h2>Database Schema (Firestore)</h2>

<h3>Collection: movies</h3>

<table>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>id</td>
<td>string</td>
<td>Movie ID</td>
</tr>

<tr>
<td>title</td>
<td>string</td>
<td>Movie title</td>
</tr>

<tr>
<td>posterUrl</td>
<td>string</td>
<td>Poster image</td>
</tr>

<tr>
<td>description</td>
<td>string</td>
<td>Movie summary</td>
</tr>

<tr>
<td>createdAt</td>
<td>timestamp</td>
<td>Date added</td>
</tr>
</table>

<h3>Collection: reviews</h3>

<table>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>id</td>
<td>string</td>
<td>Review ID</td>
</tr>

<tr>
<td>movieId</td>
<td>string</td>
<td>Associated movie</td>
</tr>

<tr>
<td>userId</td>
<td>string</td>
<td>Firebase Auth UID</td>
</tr>

<tr>
<td>rating</td>
<td>number</td>
<td>Rating from 1–5 stars</td>
</tr>

<tr>
<td>text</td>
<td>string</td>
<td>Review content</td>
</tr>

<tr>
<td>createdAt</td>
<td>timestamp</td>
<td>Submission date</td>
</tr>
</table>

<h3>Collection: users</h3>

<table>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
</tr>

<tr>
<td>uid</td>
<td>string</td>
<td>Firebase Auth UID</td>
</tr>

<tr>
<td>email</td>
<td>string</td>
<td>User email</td>
</tr>

<tr>
<td>createdAt</td>
<td>timestamp</td>
<td>Account creation date</td>
</tr>
</table>

<hr>

<h2>Authentication Flow</h2>

<ol>
<li>User opens the application</li>
<li>AuthContext checks Firebase for an active session</li>
</ol>

<p><strong>If the user is logged in:</strong></p>

<ul>
<li>The user can submit reviews</li>
<li>The user can view their submissions</li>
</ul>

<p><strong>If the user is logged out:</strong></p>

<ul>
<li>The review form is locked</li>
<li>The user is prompted to sign in</li>
</ul>

<p>Firebase manages session persistence automatically.</p>

<hr>

<h2>Data Flow Diagram (Text-Based)</h2>

<pre><code>
[User Action]
      |
      v
[React Component]
      |
      v
[AuthContext] ----> [Firebase Auth]
      |
      v
[Firestore CRUD Functions]
      |
      v
[Firestore Database]
      |
      v
[UI Updates with Live Data]
</code></pre>

<hr>

<h2>Known Bugs or Limitations</h2>

<ul>
<li>Reviews cannot currently be edited after submission</li>
<li>Movie search is limited to the static dataset and user submissions</li>
<li>Advanced filtering and sorting are not implemented</li>
<li>Poster images rely on external sources</li>
</ul>

<hr>

<h2>What I Learned</h2>

<p>
Building CinaMaxReview helped strengthen my understanding of full-stack web
development using React and Firebase. I learned how to structure a React
application with clear separation between components, authentication, and
database layers.
</p>

<p>
The project also provided experience integrating Firebase Authentication and
Firestore, writing secure database rules, and migrating data from local
storage to a cloud database.
</p>

<p>
Working with AI tools assisted in planning features, debugging issues, and
refining architectural decisions. At the same time, the development process
required evaluating suggestions and choosing appropriate implementations.
</p>

<p>
This project improved my understanding of iterative development, data
modeling, and scalable full-stack application design.
</p>
