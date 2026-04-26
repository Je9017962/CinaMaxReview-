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

// ── Seed data — 100 best films 1960–2025 ─────────────────────────────────────
const SEED_MOVIES = [
  // ── 1960s ────────────────────────────────────────────────────────────────
  {
    title: 'Psycho', year: 1960,
    director: 'Alfred Hitchcock', genre: ['Horror', 'Thriller'],
    synopsis: 'A secretary embezzles money and checks into a remote motel run by the disturbed Norman Bates, with terrifying consequences.',
    poster: 'https://image.tmdb.org/t/p/w500/yz4QVqPx3h1hD1DfqqQkCq3rmxW.jpg',
    userAdded: false,
  },
  {
    title: 'La Dolce Vita', year: 1960,
    director: 'Federico Fellini', genre: ['Drama', 'Romance'],
    synopsis: 'A journalist navigates the hedonistic high society of Rome, searching for love and meaning amid glamour and moral emptiness.',
    poster: 'https://image.tmdb.org/t/p/w500/mFMNIoGAGCXcRqV7FYLo7fhqSTM.jpg',
    userAdded: false,
  },
  {
    title: '8½', year: 1963,
    director: 'Federico Fellini', genre: ['Drama', 'Fantasy'],
    synopsis: 'A famous film director retreats into his memories and fantasies while struggling to make his next film.',
    poster: 'https://image.tmdb.org/t/p/w500/6pTqSq0zYLKoL5MoHMqPkSHB1X0.jpg',
    userAdded: false,
  },
  {
    title: 'Dr. Strangelove', year: 1964,
    director: 'Stanley Kubrick', genre: ['Comedy', 'Drama'],
    synopsis: 'A deranged general triggers a nuclear alert and various American and Soviet leaders scramble to prevent a global catastrophe.',
    poster: 'https://image.tmdb.org/t/p/w500/6BHbqKDRgdovMXEsSId0Mv8aYqL.jpg',
    userAdded: false,
  },
  {
    title: 'The Good, the Bad and the Ugly', year: 1966,
    director: 'Sergio Leone', genre: ['Action', 'Adventure'],
    synopsis: 'Three gunslingers compete to find a fortune in buried Confederate gold during the American Civil War.',
    poster: 'https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg',
    userAdded: false,
  },
  {
    title: 'Persona', year: 1966,
    director: 'Ingmar Bergman', genre: ['Drama', 'Mystery'],
    synopsis: 'A nurse is put in charge of an actress who has suddenly gone mute, and the two women begin to merge identities.',
    poster: 'https://image.tmdb.org/t/p/w500/wFovgHkCBr0XdRSZC5K19DpDBoK.jpg',
    userAdded: false,
  },
  {
    title: '2001: A Space Odyssey', year: 1968,
    director: 'Stanley Kubrick', genre: ['Sci-Fi', 'Adventure'],
    synopsis: 'After discovering a mysterious monolith, humanity embarks on a space journey that probes the boundaries of human evolution.',
    poster: 'https://image.tmdb.org/t/p/w500/ve72VxNqsuDnjKFkfnxyCkgMUOA.jpg',
    userAdded: false,
  },
  {
    title: 'Once Upon a Time in the West', year: 1968,
    director: 'Sergio Leone', genre: ['Action', 'Drama'],
    synopsis: 'A mysterious stranger joins forces with a notorious outlaw to protect a widow from a ruthless assassin in the American frontier.',
    poster: 'https://image.tmdb.org/t/p/w500/qbYgqOczabBLZOEtAGNkVGSbvMk.jpg',
    userAdded: false,
  },
  {
    title: 'Midnight Cowboy', year: 1969,
    director: 'John Schlesinger', genre: ['Drama'],
    synopsis: 'A naive Texas hustler and a consumptive con man form an unlikely friendship while struggling to survive on the streets of New York.',
    poster: 'https://image.tmdb.org/t/p/w500/6rqCVFSCAFJNZdNzYxwAVFUFD17.jpg',
    userAdded: false,
  },
  {
    title: 'Butch Cassidy and the Sundance Kid', year: 1969,
    director: 'George Roy Hill', genre: ['Action', 'Comedy', 'Adventure'],
    synopsis: 'Two Western outlaws on the run from a tireless posse flee to Bolivia, where their luck finally runs out.',
    poster: 'https://image.tmdb.org/t/p/w500/oKIbhTMrFHOBs7qLRrwgFbIbeF.jpg',
    userAdded: false,
  },

  // ── 1970s ────────────────────────────────────────────────────────────────
  {
    title: 'The Godfather', year: 1972,
    director: 'Francis Ford Coppola', genre: ['Drama', 'Thriller'],
    synopsis: 'The aging patriarch of an organised crime dynasty transfers control of his empire to his reluctant son.',
    poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLeMMovrI6xv.jpg',
    userAdded: false,
  },
  {
    title: 'Chinatown', year: 1974,
    director: 'Roman Polanski', genre: ['Drama', 'Mystery', 'Thriller'],
    synopsis: 'A private detective hired to expose an adulterer finds himself entangled in a web of murder and corruption in 1930s Los Angeles.',
    poster: 'https://image.tmdb.org/t/p/w500/mVlMgqbKkdjb0OzFxJCkH6SHzmA.jpg',
    userAdded: false,
  },
  {
    title: 'The Godfather Part II', year: 1974,
    director: 'Francis Ford Coppola', genre: ['Drama', 'Thriller'],
    synopsis: 'The early life and career of Vito Corleone in 1920s New York is told in parallel with his son Michael\'s expansion of the family crime empire.',
    poster: 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg',
    userAdded: false,
  },
  {
    title: 'Taxi Driver', year: 1976,
    director: 'Martin Scorsese', genre: ['Drama', 'Thriller'],
    synopsis: 'A mentally unstable Vietnam War veteran works as a nighttime taxi driver in New York, becoming obsessed with cleaning up the city.',
    poster: 'https://image.tmdb.org/t/p/w500/ekstpH614fwDX8DUln1a2Opz0N8.jpg',
    userAdded: false,
  },
  {
    title: 'Annie Hall', year: 1977,
    director: 'Woody Allen', genre: ['Comedy', 'Romance', 'Drama'],
    synopsis: 'Neurotic New York comedian Alvy Singer recounts his romance with the free-spirited Annie Hall in a non-linear, self-referential love story.',
    poster: 'https://image.tmdb.org/t/p/w500/h4r3ljFWXniLj0l7JObFBOQMm6E.jpg',
    userAdded: false,
  },
  {
    title: 'Star Wars', year: 1977,
    director: 'George Lucas', genre: ['Sci-Fi', 'Action', 'Adventure'],
    synopsis: 'A farm boy from a remote planet joins a rebellion against a galactic empire with the help of a princess, a smuggler, and an ancient order of knights.',
    poster: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
    userAdded: false,
  },
  {
    title: 'Apocalypse Now', year: 1979,
    director: 'Francis Ford Coppola', genre: ['Drama', 'Thriller'],
    synopsis: 'A U.S. Army officer is sent on a secret mission into Cambodia to assassinate a renegade Special Forces colonel who has gone insane.',
    poster: 'https://image.tmdb.org/t/p/w500/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg',
    userAdded: false,
  },
  {
    title: 'Kramer vs. Kramer', year: 1979,
    director: 'Robert Benton', genre: ['Drama'],
    synopsis: 'A career-focused man is forced to learn how to be a father when his wife leaves. A year later she returns, wanting custody of their son.',
    poster: 'https://image.tmdb.org/t/p/w500/eFRuAhXiXnHAKYTr8c3MZJXz01S.jpg',
    userAdded: false,
  },

  // ── 1980s ────────────────────────────────────────────────────────────────
  {
    title: 'Raging Bull', year: 1980,
    director: 'Martin Scorsese', genre: ['Drama'],
    synopsis: 'The story of middleweight boxing champion Jake LaMotta, whose violence and self-destructive tendencies both inside and outside the ring lead to his downfall.',
    poster: 'https://image.tmdb.org/t/p/w500/5MRZhOBiRiiwJeAbKJwvVFjOvXV.jpg',
    userAdded: false,
  },
  {
    title: 'E.T. the Extra-Terrestrial', year: 1982,
    director: 'Steven Spielberg', genre: ['Adventure', 'Sci-Fi', 'Drama'],
    synopsis: 'A troubled child summons the courage to help a friendly alien escape Earth and return to his home world.',
    poster: 'https://image.tmdb.org/t/p/w500/an0nD6uq6byfxXCfk6lQBzdPqhp.jpg',
    userAdded: false,
  },
  {
    title: 'Blade Runner', year: 1982,
    director: 'Ridley Scott', genre: ['Sci-Fi', 'Thriller', 'Drama'],
    synopsis: 'A blade runner must pursue and terminate four replicants who stole a ship in space and have returned to Earth to find their creator.',
    poster: 'https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg',
    userAdded: false,
  },
  {
    title: 'Scarface', year: 1983,
    director: 'Brian De Palma', genre: ['Action', 'Thriller', 'Drama'],
    synopsis: 'A Cuban refugee rises through the Miami drug trade in the 1980s, building an empire while his paranoia and violent ambition destroy everything around him.',
    poster: 'https://image.tmdb.org/t/p/w500/iQ5T5HPltFO9OGrhbJSItFbMnQG.jpg',
    userAdded: false,
  },
  {
    title: 'Amadeus', year: 1984,
    director: 'Miloš Forman', genre: ['Drama', 'Mystery'],
    synopsis: 'The life of Mozart is told through the memoir of his rival, who is driven to obsession and madness by Mozart\'s transcendent genius.',
    poster: 'https://image.tmdb.org/t/p/w500/6nJyBaVY1OoMuJiKJNDp6MBFoRp.jpg',
    userAdded: false,
  },
  {
    title: 'Back to the Future', year: 1985,
    director: 'Robert Zemeckis', genre: ['Sci-Fi', 'Comedy', 'Adventure'],
    synopsis: 'A teenager is accidentally sent thirty years into the past in a time-travelling DeLorean and must ensure his parents fall in love.',
    poster: 'https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg',
    userAdded: false,
  },
  {
    title: 'Platoon', year: 1986,
    director: 'Oliver Stone', genre: ['Drama', 'Action'],
    synopsis: 'A young soldier in Vietnam faces a moral crisis when confronted with the corruption and violence of the war, torn between two sergeants.',
    poster: 'https://image.tmdb.org/t/p/w500/tCUNRamLy8HFT7oqCyBfFLf0kQs.jpg',
    userAdded: false,
  },
  {
    title: 'Full Metal Jacket', year: 1987,
    director: 'Stanley Kubrick', genre: ['Drama', 'Action'],
    synopsis: 'A two-part portrait of the Vietnam War: the dehumanising training of Marine recruits, and one soldier\'s harrowing experience in the Tet Offensive.',
    poster: 'https://image.tmdb.org/t/p/w500/bfJlBQF8Ci3XvHnWa6N1N50FQNV.jpg',
    userAdded: false,
  },
  {
    title: 'Die Hard', year: 1988,
    director: 'John McTiernan', genre: ['Action', 'Thriller'],
    synopsis: 'New York cop John McClane is caught in a Los Angeles skyscraper taken over by terrorists on Christmas Eve.',
    poster: 'https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg',
    userAdded: false,
  },
  {
    title: 'Rain Man', year: 1988,
    director: 'Barry Levinson', genre: ['Drama'],
    synopsis: 'When a young man learns his estranged father left his fortune to an autistic savant brother he never knew existed, he kidnaps him to gain the inheritance.',
    poster: 'https://image.tmdb.org/t/p/w500/t1MIBJIExFIAKIIFGBGEkMjwAd4.jpg',
    userAdded: false,
  },
  {
    title: 'Do the Right Thing', year: 1989,
    director: 'Spike Lee', genre: ['Drama', 'Comedy'],
    synopsis: 'Racial tensions in a Brooklyn neighbourhood escalate over the course of a swelteringly hot day, culminating in violence.',
    poster: 'https://image.tmdb.org/t/p/w500/fmn6CJzuLF9JXzVKFsxWZbBXRdT.jpg',
    userAdded: false,
  },

  // ── 1990s ────────────────────────────────────────────────────────────────
  {
    title: 'Goodfellas', year: 1990,
    director: 'Martin Scorsese', genre: ['Drama', 'Thriller'],
    synopsis: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife and his partners in the Lucchese crime family.',
    poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    userAdded: false,
  },
  {
    title: 'The Silence of the Lambs', year: 1991,
    director: 'Jonathan Demme', genre: ['Thriller', 'Horror', 'Drama'],
    synopsis: 'A young FBI cadet must receive the help of an imprisoned and manipulative cannibal killer to help catch another serial killer.',
    poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg',
    userAdded: false,
  },
  {
    title: 'Unforgiven', year: 1992,
    director: 'Clint Eastwood', genre: ['Drama', 'Action'],
    synopsis: 'Retired outlaw William Munny reluctantly takes on one more job to collect a bounty on two men who cut up a prostitute in Big Whiskey.',
    poster: 'https://image.tmdb.org/t/p/w500/owNEiHKHJMlp2FGMcqS62sqaetV.jpg',
    userAdded: false,
  },
  {
    title: 'Schindler\'s List', year: 1993,
    director: 'Steven Spielberg', genre: ['Drama', 'Thriller'],
    synopsis: 'In German-occupied Poland during World War II, industrialist Oskar Schindler comes to care for his Jewish workforce after witnessing their persecution.',
    poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    userAdded: false,
  },
  {
    title: 'Jurassic Park', year: 1993,
    director: 'Steven Spielberg', genre: ['Action', 'Adventure', 'Sci-Fi'],
    synopsis: 'During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.',
    poster: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg',
    userAdded: false,
  },
  {
    title: 'Pulp Fiction', year: 1994,
    director: 'Quentin Tarantino', genre: ['Thriller', 'Drama'],
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    userAdded: false,
  },
  {
    title: 'The Shawshank Redemption', year: 1994,
    director: 'Frank Darabont', genre: ['Drama'],
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster: 'https://image.tmdb.org/t/p/w500/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg',
    userAdded: false,
  },
  {
    title: 'Forrest Gump', year: 1994,
    director: 'Robert Zemeckis', genre: ['Drama', 'Romance', 'Comedy'],
    synopsis: 'The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of a man from Alabama.',
    poster: 'https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
    userAdded: false,
  },
  {
    title: 'Heat', year: 1995,
    director: 'Michael Mann', genre: ['Action', 'Drama', 'Thriller'],
    synopsis: 'A group of professional bank robbers start to feel the heat from the LAPD when they unknowingly leave a witness alive at a blunder-filled heist.',
    poster: 'https://image.tmdb.org/t/p/w500/zMyfPUelumio3tiDKPffaUpsQTD.jpg',
    userAdded: false,
  },
  {
    title: 'Se7en', year: 1995,
    director: 'David Fincher', genre: ['Drama', 'Mystery', 'Thriller'],
    synopsis: 'Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.',
    poster: 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg',
    userAdded: false,
  },
  {
    title: 'Toy Story', year: 1995,
    director: 'John Lasseter', genre: ['Animation', 'Comedy', 'Adventure'],
    synopsis: 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy\'s room.',
    poster: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPl9KaI5J.jpg',
    userAdded: false,
  },
  {
    title: 'Fargo', year: 1996,
    director: 'Joel Coen', genre: ['Drama', 'Thriller', 'Comedy'],
    synopsis: 'A hapless car salesman hires two criminals to kidnap his wife to extort money from his wealthy father-in-law, but the scheme spirals out of control.',
    poster: 'https://image.tmdb.org/t/p/w500/ikzRKbEhDm7HN6CFJq8q2lYmkHQ.jpg',
    userAdded: false,
  },
  {
    title: 'L.A. Confidential', year: 1997,
    director: 'Curtis Hanson', genre: ['Mystery', 'Thriller', 'Drama'],
    synopsis: 'As corruption grows in 1950s Los Angeles, three policemen with very different characters investigate a series of murders.',
    poster: 'https://image.tmdb.org/t/p/w500/8BPZO0Bf8TeAy8znF43z8soK3ys.jpg',
    userAdded: false,
  },
  {
    title: 'Titanic', year: 1997,
    director: 'James Cameron', genre: ['Drama', 'Romance'],
    synopsis: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the ill-fated RMS Titanic.',
    poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
    userAdded: false,
  },
  {
    title: 'The Truman Show', year: 1998,
    director: 'Peter Weir', genre: ['Comedy', 'Drama', 'Sci-Fi'],
    synopsis: 'An insurance salesman discovers his whole life is actually a reality TV show.',
    poster: 'https://image.tmdb.org/t/p/w500/vue4kwAEutNFnQFuMiXZEoXSRRv.jpg',
    userAdded: false,
  },
  {
    title: 'Saving Private Ryan', year: 1998,
    director: 'Steven Spielberg', genre: ['Drama', 'Action'],
    synopsis: 'Following the Normandy landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.',
    poster: 'https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg',
    userAdded: false,
  },
  {
    title: 'The Matrix', year: 1999,
    director: 'The Wachowskis', genre: ['Sci-Fi', 'Action'],
    synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    userAdded: false,
  },
  {
    title: 'Fight Club', year: 1999,
    director: 'David Fincher', genre: ['Drama', 'Thriller'],
    synopsis: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    userAdded: false,
  },
  {
    title: 'American Beauty', year: 1999,
    director: 'Sam Mendes', genre: ['Drama', 'Romance'],
    synopsis: 'A sexually frustrated suburban father has a mid-life crisis after becoming infatuated with his daughter\'s best friend.',
    poster: 'https://image.tmdb.org/t/p/w500/wby9315QzVKwKFHFRX4IIRJ7pnf.jpg',
    userAdded: false,
  },
  {
    title: 'The Sixth Sense', year: 1999,
    director: 'M. Night Shyamalan', genre: ['Drama', 'Mystery', 'Thriller'],
    synopsis: 'A child psychologist tries to help a young boy who claims he can see and communicate with the dead.',
    poster: 'https://image.tmdb.org/t/p/w500/bq6EQxOJlGjSIQn7gYhGLmWhiLc.jpg',
    userAdded: false,
  },

  // ── 2000s ────────────────────────────────────────────────────────────────
  {
    title: 'Gladiator', year: 2000,
    director: 'Ridley Scott', genre: ['Action', 'Adventure', 'Drama'],
    synopsis: 'A Roman general is betrayed and his family murdered by a corrupt prince, and is reduced to slavery. He rises through the gladiatorial ranks to exact his revenge.',
    poster: 'https://image.tmdb.org/t/p/w500/ehGpAcauchmXLQ1zx3J5BFkUBBfV.jpg',
    userAdded: false,
  },
  {
    title: 'Memento', year: 2000,
    director: 'Christopher Nolan', genre: ['Mystery', 'Thriller'],
    synopsis: 'A man with short-term memory loss attempts to track down his wife\'s murderer using an elaborate system of notes and polaroid photographs.',
    poster: 'https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cBTCAk9zxsL2oW.jpg',
    userAdded: false,
  },
  {
    title: 'Crouching Tiger, Hidden Dragon', year: 2000,
    director: 'Ang Lee', genre: ['Action', 'Adventure', 'Drama'],
    synopsis: 'A young Chinese noblewoman steals a legendary sword and a veteran warrior and his female companion must retrieve it.',
    poster: 'https://image.tmdb.org/t/p/w500/bRm2DEgUiYciDw3myHuYFInD7la.jpg',
    userAdded: false,
  },
  {
    title: 'Mulholland Drive', year: 2001,
    director: 'David Lynch', genre: ['Drama', 'Mystery', 'Thriller'],
    synopsis: 'An aspiring actress arrives in Los Angeles and befriends a mysterious amnesiac woman, setting off a surreal journey into Hollywood\'s dark side.',
    poster: 'https://image.tmdb.org/t/p/w500/oFbNpPLPVKeYhMFGfH8mBOyuPWA.jpg',
    userAdded: false,
  },
  {
    title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001,
    director: 'Peter Jackson', genre: ['Adventure', 'Fantasy', 'Action'],
    synopsis: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
    userAdded: false,
  },
  {
    title: 'Spirited Away', year: 2001,
    director: 'Hayao Miyazaki', genre: ['Animation', 'Adventure', 'Fantasy'],
    synopsis: 'During her family\'s move to the suburbs, a sullen ten-year-old girl wanders into a world ruled by gods and witches and must find a way to free herself.',
    poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    userAdded: false,
  },
  {
    title: 'City of God', year: 2002,
    director: 'Fernando Meirelles', genre: ['Drama', 'Thriller'],
    synopsis: 'Two boys growing up in a violent neighbourhood in Rio de Janeiro take different paths — one becomes a photographer, the other a drug dealer.',
    poster: 'https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2grZ.jpg',
    userAdded: false,
  },
  {
    title: 'Catch Me If You Can', year: 2002,
    director: 'Steven Spielberg', genre: ['Drama', 'Thriller'],
    synopsis: 'A true story about a brilliant con man who successfully performs cons worth millions of dollars, while the FBI agent trying to catch him is always one step behind.',
    poster: 'https://image.tmdb.org/t/p/w500/bc5bLf5FvlhcGJTZFjPf7Bp7i0K.jpg',
    userAdded: false,
  },
  {
    title: 'Lost in Translation', year: 2003,
    director: 'Sofia Coppola', genre: ['Drama', 'Romance', 'Comedy'],
    synopsis: 'A faded movie star and a neglected young woman form an unlikely bond after crossing paths in Tokyo.',
    poster: 'https://image.tmdb.org/t/p/w500/wT9aM8tLF9ChkFMFpql6BMY5ggx.jpg',
    userAdded: false,
  },
  {
    title: 'Eternal Sunshine of the Spotless Mind', year: 2004,
    director: 'Michel Gondry', genre: ['Sci-Fi', 'Drama', 'Romance'],
    synopsis: 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories — but finds love harder to kill than expected.',
    poster: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OdYTMR5qreIz.jpg',
    userAdded: false,
  },
  {
    title: 'Million Dollar Baby', year: 2004,
    director: 'Clint Eastwood', genre: ['Drama', 'Action'],
    synopsis: 'A hardened boxing trainer reluctantly takes on an underdog female fighter and gets much more than he bargained for.',
    poster: 'https://image.tmdb.org/t/p/w500/2rv3ckBVFmiqNhRBrKXhFiLBvhj.jpg',
    userAdded: false,
  },
  {
    title: 'Brokeback Mountain', year: 2005,
    director: 'Ang Lee', genre: ['Drama', 'Romance'],
    synopsis: 'The story of a forbidden and secretive relationship between two cowboys and their lives over the years.',
    poster: 'https://image.tmdb.org/t/p/w500/9Y2pGEsqLQoJMhqEfQmhwIlSKVk.jpg',
    userAdded: false,
  },
  {
    title: 'Crash', year: 2005,
    director: 'Paul Haggis', genre: ['Drama', 'Thriller'],
    synopsis: 'Los Angeles citizens with vastly separate lives collide in unexpected ways over the course of two days.',
    poster: 'https://image.tmdb.org/t/p/w500/aHzKfOMCHvPRKLmXWgMfK3lDpf0.jpg',
    userAdded: false,
  },
  {
    title: 'The Departed', year: 2006,
    director: 'Martin Scorsese', genre: ['Drama', 'Thriller'],
    synopsis: 'An undercover cop and a mole in the police try to identify each other while infiltrating an Irish gang in South Boston.',
    poster: 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
    userAdded: false,
  },
  {
    title: 'Pan\'s Labyrinth', year: 2006,
    director: 'Guillermo del Toro', genre: ['Fantasy', 'Drama', 'Thriller'],
    synopsis: 'In post-Civil War Spain, a bookish young stepdaughter of a fascist captain escapes into a dark, enchanted labyrinth through a series of dangerous tasks.',
    poster: 'https://image.tmdb.org/t/p/w500/htM7PsmDXDvqECNQNHbsFCgMzJ.jpg',
    userAdded: false,
  },
  {
    title: 'No Country for Old Men', year: 2007,
    director: 'Joel Coen', genre: ['Drama', 'Thriller'],
    synopsis: 'Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and takes the cash, finding himself hunted by a merciless killer.',
    poster: 'https://image.tmdb.org/t/p/w500/6d5XOczc0hOqgVnZTRLHJmbTBMt.jpg',
    userAdded: false,
  },
  {
    title: 'There Will Be Blood', year: 2007,
    director: 'Paul Thomas Anderson', genre: ['Drama'],
    synopsis: 'A story of family, religion, hatred, oil, and madness, following the rise of a charismatic oilman in early twentieth-century California.',
    poster: 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6h.jpg',
    userAdded: false,
  },
  {
    title: 'The Dark Knight', year: 2008,
    director: 'Christopher Nolan', genre: ['Action', 'Drama', 'Thriller'],
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    userAdded: false,
  },
  {
    title: 'Slumdog Millionaire', year: 2008,
    director: 'Danny Boyle', genre: ['Drama', 'Romance'],
    synopsis: 'A teenager from the slums of Mumbai is about to win the top prize on India\'s Who Wants to Be a Millionaire?, but is suspected of cheating.',
    poster: 'https://image.tmdb.org/t/p/w500/ALSGnzlFKWFJ6ZfDMnOvwEPKZt4.jpg',
    userAdded: false,
  },
  {
    title: 'Up', year: 2009,
    director: 'Pete Docter', genre: ['Animation', 'Adventure', 'Comedy'],
    synopsis: '78-year-old Carl Fredricksen ties thousands of balloons to his house and embarks on a wild adventure to honour his late wife\'s dream.',
    poster: 'https://image.tmdb.org/t/p/w500/khCA7JuSoWbuPYJcBKRIQMsMfr.jpg',
    userAdded: false,
  },
  {
    title: 'Inglourious Basterds', year: 2009,
    director: 'Quentin Tarantino', genre: ['Drama', 'Thriller'],
    synopsis: 'In Nazi-occupied France, a group of Jewish U.S. soldiers plan to assassinate Nazi leaders along with a young French woman out for revenge.',
    poster: 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg',
    userAdded: false,
  },

  // ── 2010s ────────────────────────────────────────────────────────────────
  {
    title: 'Inception', year: 2010,
    director: 'Christopher Nolan', genre: ['Action', 'Adventure', 'Sci-Fi'],
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    userAdded: false,
  },
  {
    title: 'The Social Network', year: 2010,
    director: 'David Fincher', genre: ['Drama'],
    synopsis: 'As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by two brothers and a co-founder.',
    poster: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg',
    userAdded: false,
  },
  {
    title: 'Black Swan', year: 2010,
    director: 'Darren Aronofsky', genre: ['Drama', 'Thriller', 'Mystery'],
    synopsis: 'A committed dancer wins the lead role in a production of Swan Lake only to find herself struggling to maintain her sanity.',
    poster: 'https://image.tmdb.org/t/p/w500/wedFpDKCEWQB4HhKlxwJHIobGwn.jpg',
    userAdded: false,
  },
  {
    title: 'The Artist', year: 2011,
    director: 'Michel Hazanavicius', genre: ['Comedy', 'Drama', 'Romance'],
    synopsis: 'An egomaniacal silent film star and a rising young actress meet and fall in love as the film industry transitions to sound.',
    poster: 'https://image.tmdb.org/t/p/w500/nOLKjAkmk4atW3jjwbHLgjxUDPF.jpg',
    userAdded: false,
  },
  {
    title: 'Drive', year: 2011,
    director: 'Nicolas Winding Refn', genre: ['Action', 'Drama', 'Thriller'],
    synopsis: 'A mysterious Hollywood stunt performer moonlights as a getaway driver who falls for his neighbour\'s wife and is dragged into a world of violence.',
    poster: 'https://image.tmdb.org/t/p/w500/602vevIURmpzkQxrFVJKlXlEBJT.jpg',
    userAdded: false,
  },
  {
    title: 'Argo', year: 2012,
    director: 'Ben Affleck', genre: ['Drama', 'Thriller'],
    synopsis: 'Acting under the cover of a Hollywood producer scouting a location for a science fiction film, a CIA agent launches a daring rescue mission in Tehran.',
    poster: 'https://image.tmdb.org/t/p/w500/eTZABNjGVHMYLYBVjSYzfm3VqU4.jpg',
    userAdded: false,
  },
  {
    title: 'Django Unchained', year: 2012,
    director: 'Quentin Tarantino', genre: ['Drama', 'Action', 'Western'],
    synopsis: 'With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.',
    poster: 'https://image.tmdb.org/t/p/w500/5Tst6FQmqVFXl3RaULQ5RxTDVTB.jpg',
    userAdded: false,
  },
  {
    title: 'Gravity', year: 2013,
    director: 'Alfonso Cuarón', genre: ['Sci-Fi', 'Drama', 'Thriller'],
    synopsis: 'Two astronauts work together to survive after an accident leaves them stranded in space.',
    poster: 'https://image.tmdb.org/t/p/w500/mNOe9z89hSAFaXnK5hHp4HkMHRD.jpg',
    userAdded: false,
  },
  {
    title: '12 Years a Slave', year: 2013,
    director: 'Steve McQueen', genre: ['Drama', 'Thriller'],
    synopsis: 'In the antebellum United States, Solomon Northup is kidnapped and sold into slavery. Twelve years later, he encounters a Canadian abolitionist who changes his life.',
    poster: 'https://image.tmdb.org/t/p/w500/kb3X943WMIJYVg4SOAyK0pmWL5D.jpg',
    userAdded: false,
  },
  {
    title: 'Whiplash', year: 2014,
    director: 'Damien Chazelle', genre: ['Drama', 'Music'],
    synopsis: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored but also threatened by an uncompromising instructor.',
    poster: 'https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    userAdded: false,
  },
  {
    title: 'Birdman', year: 2014,
    director: 'Alejandro González Iñárritu', genre: ['Drama', 'Comedy'],
    synopsis: 'A faded superhero actor attempts to revive his former glory by writing and starring in a Broadway play as his ego threatens to derail everything.',
    poster: 'https://image.tmdb.org/t/p/w500/pTc0AQjvuheaB1i0MOVC2ROjpA7.jpg',
    userAdded: false,
  },
  {
    title: 'Mad Max: Fury Road', year: 2015,
    director: 'George Miller', genre: ['Action', 'Adventure', 'Sci-Fi'],
    synopsis: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland with the aid of a group of female prisoners and a drifter named Max.',
    poster: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
    userAdded: false,
  },
  {
    title: 'The Revenant', year: 2015,
    director: 'Alejandro González Iñárritu', genre: ['Drama', 'Adventure', 'Thriller'],
    synopsis: 'A frontiersman on a fur trading expedition in the 1820s fights for survival after being mauled by a bear and left for dead by members of his own hunting team.',
    poster: 'https://image.tmdb.org/t/p/w500/ji3ecJphATlVgWNY0B0RVXZizR2.jpg',
    userAdded: false,
  },
  {
    title: 'Spotlight', year: 2015,
    director: 'Tom McCarthy', genre: ['Drama', 'Thriller'],
    synopsis: 'The true story of how the Boston Globe uncovered the massive scandal of child molestation and cover-up within the local Catholic Archdiocese.',
    poster: 'https://image.tmdb.org/t/p/w500/oRt3nFdSsxOBfS6D5MHOQEwpHsH.jpg',
    userAdded: false,
  },
  {
    title: 'La La Land', year: 2016,
    director: 'Damien Chazelle', genre: ['Drama', 'Music', 'Romance', 'Comedy'],
    synopsis: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg',
    userAdded: false,
  },
  {
    title: 'Moonlight', year: 2016,
    director: 'Barry Jenkins', genre: ['Drama'],
    synopsis: 'A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence and burgeoning adulthood.',
    poster: 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eAlnIHNm0TPWGFFvR.jpg',
    userAdded: false,
  },
  {
    title: 'Get Out', year: 2017,
    director: 'Jordan Peele', genre: ['Horror', 'Mystery', 'Thriller'],
    synopsis: 'A young African-American visits his white girlfriend\'s parents\' estate and discovers a disturbing secret.',
    poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg',
    userAdded: false,
  },
  {
    title: 'Dunkirk', year: 2017,
    director: 'Christopher Nolan', genre: ['Action', 'Drama', 'Thriller'],
    synopsis: 'Allied soldiers from Belgium, the British Commonwealth and France are surrounded by the German Army during the Dunkirk evacuation.',
    poster: 'https://image.tmdb.org/t/p/w500/ebSnODDg9lbsMIaWg2uAbjn7TO5.jpg',
    userAdded: false,
  },
  {
    title: 'The Shape of Water', year: 2017,
    director: 'Guillermo del Toro', genre: ['Fantasy', 'Drama', 'Romance'],
    synopsis: 'At a secret government laboratory, a mute cleaning woman develops a unique relationship with an amphibious creature being held captive.',
    poster: 'https://image.tmdb.org/t/p/w500/k4FwHlMhuRR5BISY2Gm2QZHlH5Q.jpg',
    userAdded: false,
  },
  {
    title: 'Roma', year: 2018,
    director: 'Alfonso Cuarón', genre: ['Drama'],
    synopsis: 'A year in the life of a middle-class family\'s live-in housekeeper in Mexico City in the early 1970s.',
    poster: 'https://image.tmdb.org/t/p/w500/dtqfBv4JZ5KJfCCNy4EPKJZ6OAe.jpg',
    userAdded: false,
  },
  {
    title: 'A Star Is Born', year: 2018,
    director: 'Bradley Cooper', genre: ['Drama', 'Music', 'Romance'],
    synopsis: 'A musician helps a young singer find fame as his own alcoholism and self-destructive tendencies send his career into freefall.',
    poster: 'https://image.tmdb.org/t/p/w500/wrFpXMNBRj2PBiN4Z5kix51XaIZ.jpg',
    userAdded: false,
  },
  {
    title: 'Parasite', year: 2019,
    director: 'Bong Joon-ho', genre: ['Comedy', 'Drama', 'Thriller'],
    synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    userAdded: false,
  },
  {
    title: 'Once Upon a Time in Hollywood', year: 2019,
    director: 'Quentin Tarantino', genre: ['Comedy', 'Drama', 'Thriller'],
    synopsis: 'A faded television actor and his stunt double strive to achieve fame and success in the final years of Hollywood\'s Golden Age, 1969.',
    poster: 'https://image.tmdb.org/t/p/w500/8j58iEBw9pOXFD2L0nt0ZXeHviB.jpg',
    userAdded: false,
  },
  {
    title: 'The Irishman', year: 2019,
    director: 'Martin Scorsese', genre: ['Drama', 'Thriller'],
    synopsis: 'Hitman Frank Sheeran looks back at the secrets he kept as a loyal member of the Bufalino crime family.',
    poster: 'https://image.tmdb.org/t/p/w500/mbm8k3GFhXS0Rock492JNtTiIpK.jpg',
    userAdded: false,
  },
  {
    title: 'Joker', year: 2019,
    director: 'Todd Phillips', genre: ['Drama', 'Thriller'],
    synopsis: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.',
    poster: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',
    userAdded: false,
  },

  // ── 2020s ────────────────────────────────────────────────────────────────
  {
    title: 'Nomadland', year: 2020,
    director: 'Chloé Zhao', genre: ['Drama'],
    synopsis: 'Following the economic collapse of a company town in rural Nevada, a woman embarks on a journey through the American West, living as a van-dwelling modern-day nomad.',
    poster: 'https://image.tmdb.org/t/p/w500/66dOn1Y3EiuXAp9TQFe1DQEOTDH.jpg',
    userAdded: false,
  },
  {
    title: 'Promising Young Woman', year: 2020,
    director: 'Emerald Fennell', genre: ['Drama', 'Thriller'],
    synopsis: 'A young woman, traumatised by a tragic event in her past, seeks out vengeance against those who crossed her path.',
    poster: 'https://image.tmdb.org/t/p/w500/7atFmyVSmRLBRMOdtqNJ8KS4WjN.jpg',
    userAdded: false,
  },
  {
    title: 'The Power of the Dog', year: 2021,
    director: 'Jane Campion', genre: ['Drama', 'Thriller', 'Western'],
    synopsis: 'A domineering rancher conspires against his brother\'s new wife and her son until the younger man\'s unexpected talents threaten his plans.',
    poster: 'https://image.tmdb.org/t/p/w500/kEy8MHKe2PakKRKMVPFOpzqntdm.jpg',
    userAdded: false,
  },
  {
    title: 'CODA', year: 2021,
    director: 'Siân Heder', genre: ['Drama', 'Comedy', 'Music'],
    synopsis: 'As a CODA (Child of Deaf Adults), Ruby is the only hearing person in her deaf family. Caught between the world she was born into and the world she aspires to, she faces a life-changing decision.',
    poster: 'https://image.tmdb.org/t/p/w500/BzVjmm8l23rPeriiqEQnEtTCrSq.jpg',
    userAdded: false,
  },
  {
    title: 'The Banshees of Inisherin', year: 2022,
    director: 'Martin McDonagh', genre: ['Drama', 'Comedy'],
    synopsis: 'Two lifelong friends find themselves at an impasse when one abruptly ends their friendship, leading to dramatic consequences for both.',
    poster: 'https://image.tmdb.org/t/p/w500/4yFG6cSPaCaPhyJ1vtGOiMV8qvL.jpg',
    userAdded: false,
  },
  {
    title: 'Everything Everywhere All at Once', year: 2022,
    director: 'Daniel Kwan', genre: ['Action', 'Adventure', 'Comedy', 'Sci-Fi'],
    synopsis: 'A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes connecting with lives she could have led.',
    poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    userAdded: false,
  },
  {
    title: 'Tár', year: 2022,
    director: 'Todd Field', genre: ['Drama', 'Music'],
    synopsis: 'Set in the international world of classical music, the film centers on Lydia Tár, widely considered one of the greatest living composers and conductors, whose career implodes.',
    poster: 'https://image.tmdb.org/t/p/w500/k5EMpM8PgjEwAI0xBq5OFbAqNSD.jpg',
    userAdded: false,
  },
  {
    title: 'Oppenheimer', year: 2023,
    director: 'Christopher Nolan', genre: ['Drama', 'Thriller'],
    synopsis: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II.',
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    userAdded: false,
  },
  {
    title: 'Poor Things', year: 2023,
    director: 'Yorgos Lanthimos', genre: ['Drama', 'Romance'],
    synopsis: 'The incredible tale of Bella Baxter, a young woman brought back to life by an eccentric scientist and who flees with a debauched lawyer on a grand adventure across Europe.',
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
    synopsis: 'Members of the Osage Nation are murdered under mysterious circumstances in 1920s Oklahoma, sparking a major FBI investigation.',
    poster: 'https://image.tmdb.org/t/p/w500/dB6J5zsSXPmMEHLKAkjV3bFSSgB.jpg',
    userAdded: false,
  },
  {
    title: 'Dune: Part Two', year: 2024,
    director: 'Denis Villeneuve', genre: ['Sci-Fi', 'Adventure'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen to seek revenge against the conspirators who destroyed his family.',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    userAdded: false,
  },
  {
    title: 'Conclave', year: 2024,
    director: 'Edward Berger', genre: ['Drama', 'Mystery', 'Thriller'],
    synopsis: 'A cardinal tasked with running the election of a new Pope faces a difficult decision that threatens to shake the foundation of the Catholic Church.',
    poster: 'https://image.tmdb.org/t/p/w500/m5x8D0bPEAiCZeHmgFVhHzGridc.jpg',
    userAdded: false,
  },
  {
    title: 'Anora', year: 2024,
    director: 'Sean Baker', genre: ['Drama', 'Comedy', 'Romance'],
    synopsis: 'A young New York City sex worker impulsively marries the son of a Russian oligarch. When his parents find out, they fly to New York to have the marriage annulled.',
    poster: 'https://image.tmdb.org/t/p/w500/IF2tMSIbCYFaCJEQtOA6dRwGLOQ.jpg',
    userAdded: false,
  },
  {
    title: 'The Brutalist', year: 2024,
    director: 'Brady Corbet', genre: ['Drama'],
    synopsis: 'A Hungarian-Jewish architect flees Europe after WWII and arrives in America, where his singular vision conflicts with his wealthy patron\'s ambitions over the following decades.',
    poster: 'https://image.tmdb.org/t/p/w500/9n12pMCwRlRs8qe2cXLJE5KnXTv.jpg',
    userAdded: false,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// MOVIES
// ─────────────────────────────────────────────────────────────────────────────

// Synthesize a deterministic ID for a seed movie so list/detail navigation
// works without writing the seed catalogue to Firestore. The catalogue
// cannot be written from the client because Firestore rules require
// authentication on /movies create.
const seedId = (i) => `seed-${i}`
const seedMoviesWithIds = () =>
  SEED_MOVIES.map((m, i) => ({ id: seedId(i), ...m }))

/**
 * Fetch all movies.
 * If Firestore is empty or unreachable, fall back to the in-memory seed
 * catalogue so the page is never blank for visitors.
 * Returns array of { id, ...fields }
 */
export async function getMovies() {
  try {
    const snap = await getDocs(moviesCol)
    if (snap.empty) return seedMoviesWithIds()
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('getMovies: falling back to seed catalogue', err)
    return seedMoviesWithIds()
  }
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
  if (typeof movieId === 'string' && movieId.startsWith('seed-')) {
    const idx = Number(movieId.slice(5))
    const m = SEED_MOVIES[idx]
    return m ? { id: movieId, ...m } : null
  }
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
