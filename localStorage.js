// Keys
const MOVIES_KEY  = 'cinamax_movies'
const REVIEWS_KEY = 'cinamax_reviews'
const USERS_KEY   = 'cinamax_users'

const load = (key, fallback = []) => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
const loadObj = (key) => load(key, {})
const save = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)) }
  catch (e) { console.error(`Failed to save ${key}:`, e) }
}

export const SEED_MOVIES = [
  // 1960s
  { id: 101, title: 'Psycho', year: 1960, director: 'Alfred Hitchcock', genre: ['Horror','Thriller'], synopsis: 'A secretary embezzles money and checks into a remote motel run by a disturbed young man under the influence of his mother.', poster: 'https://image.tmdb.org/t/p/w500/yz4QVqPx3h6hWg9sDe4fK9X8aH8.jpg', decade: '1960s', userAdded: false },
  { id: 102, title: '8\u00bd', year: 1963, director: 'Federico Fellini', genre: ['Drama'], synopsis: 'A filmmaker grappling with creative block retreats into his memories and fantasies while trying to make his next film.', poster: 'https://image.tmdb.org/t/p/w500/lp7KJ4S9ISBotxjJVY9x8bIQ5V9.jpg', decade: '1960s', userAdded: false },
  { id: 103, title: 'Lawrence of Arabia', year: 1962, director: 'David Lean', genre: ['Drama','Adventure'], synopsis: 'The story of T.E. Lawrence, the English officer who successfully united and led the diverse, often warring Arab tribes during World War I.', poster: 'https://image.tmdb.org/t/p/w500/AiAm0EtBsxSABWTPuFZuBPAZlIq.jpg', decade: '1960s', userAdded: false },
  { id: 104, title: 'Dr. Strangelove', year: 1964, director: 'Stanley Kubrick', genre: ['Comedy'], synopsis: 'An accidental nuclear strike order forces the US President to deal with a delusional military general and a mad scientist.', poster: 'https://image.tmdb.org/t/p/w500/aXqOzNWzK0EFwFQ1mlcKWTBdO8v.jpg', decade: '1960s', userAdded: false },
  { id: 105, title: 'The Good, the Bad and the Ugly', year: 1966, director: 'Sergio Leone', genre: ['Action','Adventure'], synopsis: 'Three gunslingers compete to find a buried treasure during the American Civil War.', poster: 'https://image.tmdb.org/t/p/w500/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg', decade: '1960s', userAdded: false },
  { id: 106, title: 'Persona', year: 1966, director: 'Ingmar Bergman', genre: ['Drama'], synopsis: 'A nurse is put in charge of a mute actress and finds her personality mysteriously blending with that of her patient.', poster: 'https://image.tmdb.org/t/p/w500/jyHJF3Tms0UFWLS2HG2sNFD3fmZ.jpg', decade: '1960s', userAdded: false },
  { id: 107, title: "Rosemary's Baby", year: 1968, director: 'Roman Polanski', genre: ['Horror','Thriller'], synopsis: 'A young woman suspects that her neighbors have an ulterior motive when she becomes pregnant.', poster: 'https://image.tmdb.org/t/p/w500/yHQIlNAdQFEv7PBXzHjABwFEuMg.jpg', decade: '1960s', userAdded: false },
  { id: 108, title: '2001: A Space Odyssey', year: 1968, director: 'Stanley Kubrick', genre: ['Sci-Fi'], synopsis: 'Humanity finds a mysterious artifact buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000.', poster: 'https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg', decade: '1960s', userAdded: false },
  { id: 109, title: 'Butch Cassidy and the Sundance Kid', year: 1969, director: 'George Roy Hill', genre: ['Action','Comedy'], synopsis: 'Two outlaw bank and train robbers flee to Bolivia when the law gets too close.', poster: 'https://image.tmdb.org/t/p/w500/g3MFkRBnrkRbNUPlsMgROvjCqNu.jpg', decade: '1960s', userAdded: false },
  { id: 110, title: 'Once Upon a Time in the West', year: 1968, director: 'Sergio Leone', genre: ['Action','Drama'], synopsis: 'A mysterious stranger teams up with a notorious bandit to protect a widow from a ruthless assassin.', poster: 'https://image.tmdb.org/t/p/w500/qbYgqOczabrhxfjeANoKHkMnSiW.jpg', decade: '1960s', userAdded: false },
  { id: 111, title: 'Breathless', year: 1960, director: 'Jean-Luc Godard', genre: ['Drama','Thriller'], synopsis: 'A small-time thief shoots a motorcycle policeman and tries to convince his American girlfriend to flee to Italy with him.', poster: 'https://image.tmdb.org/t/p/w500/8XilXjCXsHPiOhMFfIBFoMXBpxv.jpg', decade: '1960s', userAdded: false },
  { id: 112, title: 'The Apartment', year: 1960, director: 'Billy Wilder', genre: ['Comedy','Romance','Drama'], synopsis: 'A corporate employee lets his superiors use his apartment for their extramarital affairs to advance his career, until he falls for one of their mistresses.', poster: 'https://image.tmdb.org/t/p/w500/iXfHGXclcxeMOMZ7jdCCkUNGLBM.jpg', decade: '1960s', userAdded: false },
  { id: 113, title: 'Midnight Cowboy', year: 1969, director: 'John Schlesinger', genre: ['Drama'], synopsis: 'A naive Texas hustler arrives in New York City and forms an unlikely friendship with a sickly con man.', poster: 'https://image.tmdb.org/t/p/w500/9h1FCXwSoMx4E4EqtU5QdPaGJXf.jpg', decade: '1960s', userAdded: false },
  { id: 114, title: 'The Wild Bunch', year: 1969, director: 'Sam Peckinpah', genre: ['Action','Adventure'], synopsis: 'An aging outlaw gang on the Texas-Mexico border is pursued by a former associate as they plan one last major robbery.', poster: 'https://image.tmdb.org/t/p/w500/qMzfzZLqbVhULIVN6KMjjRl95dQ.jpg', decade: '1960s', userAdded: false },
  { id: 115, title: 'Easy Rider', year: 1969, director: 'Dennis Hopper', genre: ['Drama','Adventure'], synopsis: 'Two bikers travel through the American Southwest and South, encountering bigotry and freedom along the way.', poster: 'https://image.tmdb.org/t/p/w500/zjHCs8MxizpfaCBrpDZzO0LBAHB.jpg', decade: '1960s', userAdded: false },
  // 1970s
  { id: 201, title: 'The Godfather', year: 1972, director: 'Francis Ford Coppola', genre: ['Drama','Thriller'], synopsis: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.', poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsLegHnDcdh9b.jpg', decade: '1970s', userAdded: false },
  { id: 202, title: 'The Godfather Part II', year: 1974, director: 'Francis Ford Coppola', genre: ['Drama','Thriller'], synopsis: 'The early life of Vito Corleone and his son Michael expanding his crime syndicate in parallel narratives.', poster: 'https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg', decade: '1970s', userAdded: false },
  { id: 203, title: 'Chinatown', year: 1974, director: 'Roman Polanski', genre: ['Thriller','Drama'], synopsis: 'A private detective hired to expose an adultery case finds himself caught up in a web of deceit, corruption, and murder.', poster: 'https://image.tmdb.org/t/p/w500/nynXZd84bNIIMGeGv9OHiJbJiCN.jpg', decade: '1970s', userAdded: false },
  { id: 204, title: 'Apocalypse Now', year: 1979, director: 'Francis Ford Coppola', genre: ['Drama','Thriller'], synopsis: 'A US Army officer is sent deep into Cambodia to terminate a renegade colonel who has set himself up as a god among a local tribe.', poster: 'https://image.tmdb.org/t/p/w500/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg', decade: '1970s', userAdded: false },
  { id: 205, title: 'Taxi Driver', year: 1976, director: 'Martin Scorsese', genre: ['Drama','Thriller'], synopsis: 'A mentally unstable veteran works as a night taxi driver in New York City, becoming increasingly disturbed by urban corruption.', poster: 'https://image.tmdb.org/t/p/w500/7sF1nFAKfFRVAKrPAKXWV6YKoGl.jpg', decade: '1970s', userAdded: false },
  { id: 206, title: "One Flew Over the Cuckoo's Nest", year: 1975, director: 'Milos Forman', genre: ['Drama'], synopsis: 'A criminal pleads insanity and is admitted to a mental institution, where he rebels against the oppressive head nurse.', poster: 'https://image.tmdb.org/t/p/w500/3jcbDmRFiQ83drXNOvRDeKHxS0C.jpg', decade: '1970s', userAdded: false },
  { id: 207, title: 'Annie Hall', year: 1977, director: 'Woody Allen', genre: ['Comedy','Romance'], synopsis: 'A neurotic New York comedian reflects on his failed relationship with Annie Hall.', poster: 'https://image.tmdb.org/t/p/w500/h1HFgaKt3VrCgZAkpBGEUoYr0b7.jpg', decade: '1970s', userAdded: false },
  { id: 208, title: 'Star Wars', year: 1977, director: 'George Lucas', genre: ['Sci-Fi','Adventure','Action'], synopsis: 'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to rescue a princess from an evil empire.', poster: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg', decade: '1970s', userAdded: false },
  { id: 209, title: 'Jaws', year: 1975, director: 'Steven Spielberg', genre: ['Thriller','Horror','Adventure'], synopsis: 'A sheriff, a marine biologist, and a shark hunter team up to hunt a great white shark terrorizing a beach resort.', poster: 'https://image.tmdb.org/t/p/w500/lxM6kqilAdpdhqUl2biYp5frUxE.jpg', decade: '1970s', userAdded: false },
  { id: 210, title: 'The Deer Hunter', year: 1978, director: 'Michael Cimino', genre: ['Drama'], synopsis: 'An in-depth examination of how the Vietnam War affects the lives of people in a small industrial town in Pennsylvania.', poster: 'https://image.tmdb.org/t/p/w500/9uvTG3sTLQAnLBRSTRlD2XdGZRq.jpg', decade: '1970s', userAdded: false },
  { id: 211, title: 'The Exorcist', year: 1973, director: 'William Friedkin', genre: ['Horror'], synopsis: 'When a girl is possessed by a mysterious entity, her mother seeks the help of two priests to save her.', poster: 'https://image.tmdb.org/t/p/w500/4QMVdkMZqxZjnBHQfHCFiHiH8oB.jpg', decade: '1970s', userAdded: false },
  { id: 212, title: 'Network', year: 1976, director: 'Sidney Lumet', genre: ['Drama'], synopsis: "A fictional television network news anchor's on-air breakdown leads to unexpected fame, which the network exploits.", poster: 'https://image.tmdb.org/t/p/w500/gsHhPlAlJrOegjGD44ySU1XDMTD.jpg', decade: '1970s', userAdded: false },
  { id: 213, title: "All the President's Men", year: 1976, director: 'Alan J. Pakula', genre: ['Drama','Thriller'], synopsis: 'The story of the Washington Post reporters who investigated the Watergate scandal that brought down President Nixon.', poster: 'https://image.tmdb.org/t/p/w500/rhLzFiRSVFhgFGp1CHBKfmTfcCz.jpg', decade: '1970s', userAdded: false },
  { id: 214, title: 'Rocky', year: 1976, director: 'John G. Avildsen', genre: ['Drama','Action'], synopsis: 'A small-time Philadelphia boxer gets a chance to fight the heavy-weight champion.', poster: 'https://image.tmdb.org/t/p/w500/nVGKMFaKZIFkPJGnMsE27dlTBqA.jpg', decade: '1970s', userAdded: false },
  { id: 215, title: 'Alien', year: 1979, director: 'Ridley Scott', genre: ['Sci-Fi','Horror'], synopsis: 'The crew of a commercial spacecraft encounters a deadly lifeform after investigating an unknown transmission.', poster: 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg', decade: '1970s', userAdded: false },
  // 1980s
  { id: 301, title: 'Raging Bull', year: 1980, director: 'Martin Scorsese', genre: ['Drama'], synopsis: 'The life of boxer Jake LaMotta, whose ferocious style in the ring and violence outside of it destroyed his relationships and career.', poster: 'https://image.tmdb.org/t/p/w500/8YxMBJf1j1rrLNXJHnFpKe4UTWB.jpg', decade: '1980s', userAdded: false },
  { id: 302, title: 'E.T. the Extra-Terrestrial', year: 1982, director: 'Steven Spielberg', genre: ['Sci-Fi','Adventure'], synopsis: 'A gentle alien is left behind on Earth and befriends a lonely boy who helps him return home.', poster: 'https://image.tmdb.org/t/p/w500/an0nD6uq6byfxXCfk6lQBzdPqhh.jpg', decade: '1980s', userAdded: false },
  { id: 303, title: 'Blade Runner', year: 1982, director: 'Ridley Scott', genre: ['Sci-Fi','Thriller'], synopsis: 'A blade runner must pursue and terminate four replicants who have stolen a ship and returned to Earth.', poster: 'https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg', decade: '1980s', userAdded: false },
  { id: 304, title: 'The Shining', year: 1980, director: 'Stanley Kubrick', genre: ['Horror','Thriller'], synopsis: 'A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence.', poster: 'https://image.tmdb.org/t/p/w500/xazWoLealQwEgqZ89MLZklLZD3k.jpg', decade: '1980s', userAdded: false },
  { id: 305, title: 'Raiders of the Lost Ark', year: 1981, director: 'Steven Spielberg', genre: ['Action','Adventure'], synopsis: 'In 1936, archaeologist Indiana Jones is hired to find the Ark of the Covenant before the Nazis can obtain its power.', poster: 'https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg', decade: '1980s', userAdded: false },
  { id: 306, title: 'Back to the Future', year: 1985, director: 'Robert Zemeckis', genre: ['Sci-Fi','Comedy','Adventure'], synopsis: 'Marty McFly is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his friend Dr. Brown.', poster: 'https://image.tmdb.org/t/p/w500/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg', decade: '1980s', userAdded: false },
  { id: 307, title: 'Full Metal Jacket', year: 1987, director: 'Stanley Kubrick', genre: ['Drama'], synopsis: 'A pragmatic U.S. Marine observes the dehumanizing effects of Vietnam War training and combat.', poster: 'https://image.tmdb.org/t/p/w500/bVST5sbkfKATJcqHFqyoZ2tGSJa.jpg', decade: '1980s', userAdded: false },
  { id: 308, title: 'Platoon', year: 1986, director: 'Oliver Stone', genre: ['Drama'], synopsis: 'A young soldier in Vietnam faces a moral crisis when confronted with the horrors of war and the duality of man.', poster: 'https://image.tmdb.org/t/p/w500/8F1GkV3tEtxwxHpzLBNLHJYq7xN.jpg', decade: '1980s', userAdded: false },
  { id: 309, title: 'Do the Right Thing', year: 1989, director: 'Spike Lee', genre: ['Drama'], synopsis: 'On the hottest day of the year in Brooklyn, racial tensions between neighborhood residents and a local pizzeria escalate to a boiling point.', poster: 'https://image.tmdb.org/t/p/w500/lDHPqrYmHB0EhqDLDZzVjFPRDqn.jpg', decade: '1980s', userAdded: false },
  { id: 310, title: 'Amadeus', year: 1984, director: 'Milos Forman', genre: ['Drama'], synopsis: 'The life of Mozart as told by Antonio Salieri, the man who grew envious of his genius.', poster: 'https://image.tmdb.org/t/p/w500/aStKa2ek7EgjRnTIxlVNGWalZEi.jpg', decade: '1980s', userAdded: false },
  { id: 311, title: 'Ran', year: 1985, director: 'Akira Kurosawa', genre: ['Drama','Action'], synopsis: 'In medieval Japan, an aging warlord retires to let his three sons take over his realm, but the clan tears itself apart.', poster: 'https://image.tmdb.org/t/p/w500/lfWOm4QL4vFJbqLLpUW8z3PFR0D.jpg', decade: '1980s', userAdded: false },
  { id: 312, title: 'Scarface', year: 1983, director: 'Brian De Palma', genre: ['Drama','Thriller'], synopsis: 'In Miami in 1980, a determined Cuban immigrant takes over a drug cartel and succumbs to greed.', poster: 'https://image.tmdb.org/t/p/w500/iQ4I8SNWV0Sts0XEGwz4D1IYNO3.jpg', decade: '1980s', userAdded: false },
  { id: 313, title: 'The Terminator', year: 1984, director: 'James Cameron', genre: ['Sci-Fi','Action','Thriller'], synopsis: 'A cyborg is sent from the future to kill Sarah Connor, whose son will one day lead a rebellion against the machines.', poster: 'https://image.tmdb.org/t/p/w500/qvktm0BHcnmDpul4Hz01GIazWPr.jpg', decade: '1980s', userAdded: false },
  { id: 314, title: 'Brazil', year: 1985, director: 'Terry Gilliam', genre: ['Sci-Fi','Drama'], synopsis: 'A bureaucrat in a retro-future world tries to correct an administrative error and gets tangled up in a dystopian nightmare.', poster: 'https://image.tmdb.org/t/p/w500/hqZz8OAEIE4u5LHh3B4LzWQyOv8.jpg', decade: '1980s', userAdded: false },
  { id: 315, title: 'Blue Velvet', year: 1986, director: 'David Lynch', genre: ['Mystery','Thriller','Drama'], synopsis: 'A young man finds a severed human ear in a field, leading him to uncover a dark underworld beneath his idyllic small town.', poster: 'https://image.tmdb.org/t/p/w500/lqHhMmYNBQfKBKSbvIAgLBhBVpj.jpg', decade: '1980s', userAdded: false },
  // 1990s
  { id: 401, title: 'Goodfellas', year: 1990, director: 'Martin Scorsese', genre: ['Drama','Thriller'], synopsis: 'The story of Henry Hill and his life in the mob, spanning from his childhood to adulthood.', poster: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg', decade: '1990s', userAdded: false },
  { id: 402, title: 'Pulp Fiction', year: 1994, director: 'Quentin Tarantino', genre: ['Drama','Thriller'], synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in tales of violence and redemption.', poster: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', decade: '1990s', userAdded: false },
  { id: 403, title: "Schindler's List", year: 1993, director: 'Steven Spielberg', genre: ['Drama'], synopsis: 'In German-occupied Poland during World War II, industrialist Oskar Schindler becomes concerned for his Jewish workforce.', poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg', decade: '1990s', userAdded: false },
  { id: 404, title: 'The Shawshank Redemption', year: 1994, director: 'Frank Darabont', genre: ['Drama'], synopsis: 'Two imprisoned men bond over years, finding solace and redemption through acts of common decency.', poster: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', decade: '1990s', userAdded: false },
  { id: 405, title: 'Fargo', year: 1996, director: 'Joel Coen', genre: ['Comedy','Thriller'], synopsis: "Jerry Lundegaard's inept crime spree leads to a comical yet grisly series of events in snowy Minnesota.", poster: 'https://image.tmdb.org/t/p/w500/hbxVQ8SJHC8MiHTqpioqJLFEWkj.jpg', decade: '1990s', userAdded: false },
  { id: 406, title: 'The Silence of the Lambs', year: 1991, director: 'Jonathan Demme', genre: ['Thriller','Horror'], synopsis: 'A young FBI cadet must receive the help of an incarcerated cannibal killer to catch another serial killer known as Buffalo Bill.', poster: 'https://image.tmdb.org/t/p/w500/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg', decade: '1990s', userAdded: false },
  { id: 407, title: 'Jurassic Park', year: 1993, director: 'Steven Spielberg', genre: ['Sci-Fi','Adventure','Thriller'], synopsis: 'A theme park suffers a power breakdown that allows its cloned dinosaur exhibits to run amok.', poster: 'https://image.tmdb.org/t/p/w500/oU7Oq2kFAAlGqbU4VoAE36g4hoI.jpg', decade: '1990s', userAdded: false },
  { id: 408, title: 'Fight Club', year: 1999, director: 'David Fincher', genre: ['Drama','Thriller'], synopsis: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much more.', poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', decade: '1990s', userAdded: false },
  { id: 409, title: 'The Matrix', year: 1999, director: 'The Wachowskis', genre: ['Sci-Fi','Action'], synopsis: 'A computer programmer discovers reality is a simulation and joins a rebellion to break free.', poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', decade: '1990s', userAdded: false },
  { id: 410, title: 'Boogie Nights', year: 1997, director: 'Paul Thomas Anderson', genre: ['Drama'], synopsis: "The story of a young man's journey into, and ultimate disillusionment with, the sex film industry.", poster: 'https://image.tmdb.org/t/p/w500/3HhqBJHnpMNGMQEbBvfAa0BZMQ8.jpg', decade: '1990s', userAdded: false },
  { id: 411, title: 'Titanic', year: 1997, director: 'James Cameron', genre: ['Drama','Romance'], synopsis: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the ill-fated R.M.S. Titanic.', poster: 'https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg', decade: '1990s', userAdded: false },
  { id: 412, title: 'Magnolia', year: 1999, director: 'Paul Thomas Anderson', genre: ['Drama'], synopsis: 'An epic mosaic of several interrelated characters in search of happiness, forgiveness, and meaning in the San Fernando Valley.', poster: 'https://image.tmdb.org/t/p/w500/pChqH8pCGbpK2R8PxgkTBiKBajl.jpg', decade: '1990s', userAdded: false },
  { id: 413, title: 'Three Colors: Red', year: 1994, director: 'Krzysztof Kieslowski', genre: ['Drama'], synopsis: 'A model discovers her neighbor is illegally listening to his neighbors phone conversations and the two develop an unusual relationship.', poster: 'https://image.tmdb.org/t/p/w500/cQXcJVnrAGFBm5lgvt86X8CQVP8.jpg', decade: '1990s', userAdded: false },
  { id: 414, title: 'Toy Story', year: 1995, director: 'John Lasseter', genre: ['Animation','Comedy','Adventure'], synopsis: 'A cowboy doll is profoundly threatened and jealous when a new spaceman figure supplants him as top toy in a boy\'s room.', poster: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg', decade: '1990s', userAdded: false },
  { id: 415, title: 'Heat', year: 1995, director: 'Michael Mann', genre: ['Action','Drama','Thriller'], synopsis: 'A group of professional bank robbers start to feel the heat from the LAPD when they unknowingly leave a clue at their latest heist.', poster: 'https://image.tmdb.org/t/p/w500/umC04Cozevu8nn3ZTIWH2Ng8rBe.jpg', decade: '1990s', userAdded: false },
  // 2000s
  { id: 501, title: 'Memento', year: 2000, director: 'Christopher Nolan', genre: ['Thriller','Mystery'], synopsis: "A man with short-term memory loss attempts to track down his wife's murderer using notes and polaroid photographs.", poster: 'https://image.tmdb.org/t/p/w500/yuNs09hvpHVU1cQTJ0nMFOOKD6N.jpg', decade: '2000s', userAdded: false },
  { id: 502, title: 'There Will Be Blood', year: 2007, director: 'Paul Thomas Anderson', genre: ['Drama'], synopsis: "A story of family, religion, hatred, oil and madness, focusing on a ruthless oil prospector during Southern California's early days.", poster: 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6A.jpg', decade: '2000s', userAdded: false },
  { id: 503, title: 'Mulholland Drive', year: 2001, director: 'David Lynch', genre: ['Thriller','Mystery','Drama'], synopsis: 'After a car accident, an amnesiac meets an aspiring actress and together they unravel a mystery in Los Angeles.', poster: 'https://image.tmdb.org/t/p/w500/tIkFjpnpvsFa2UXEMEG1SKcBfBs.jpg', decade: '2000s', userAdded: false },
  { id: 504, title: 'Eternal Sunshine of the Spotless Mind', year: 2004, director: 'Michel Gondry', genre: ['Romance','Drama','Sci-Fi'], synopsis: 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.', poster: 'https://image.tmdb.org/t/p/w500/5MwkWH9tYHv3mV9OqYdjuMnE3JF.jpg', decade: '2000s', userAdded: false },
  { id: 505, title: 'No Country for Old Men', year: 2007, director: 'Joel Coen', genre: ['Thriller','Drama'], synopsis: 'Violence and mayhem ensue after a hunter stumbles upon a drug deal gone wrong and picks up two million dollars left for dead.', poster: 'https://image.tmdb.org/t/p/w500/6d5XOczc52QHQpCFvLpBCBqsOKY.jpg', decade: '2000s', userAdded: false },
  { id: 506, title: 'The Dark Knight', year: 2008, director: 'Christopher Nolan', genre: ['Action','Thriller'], synopsis: 'When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', decade: '2000s', userAdded: false },
  { id: 507, title: 'City of God', year: 2002, director: 'Fernando Meirelles', genre: ['Drama','Thriller'], synopsis: "The growth of a crime lord in Rio de Janeiro's most dangerous slum is witnessed by a young boy who dreams of becoming a photographer.", poster: 'https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2grZ.jpg', decade: '2000s', userAdded: false },
  { id: 508, title: "Pan's Labyrinth", year: 2006, director: 'Guillermo del Toro', genre: ['Fantasy','Drama'], synopsis: 'In Falangist Spain of 1944, the bookish young stepdaughter of a sadistic army officer escapes into an eerie fantasy world.', poster: 'https://image.tmdb.org/t/p/w500/htykjm8FxOHqMZlgmHlcN48IGPD.jpg', decade: '2000s', userAdded: false },
  { id: 509, title: 'Spirited Away', year: 2001, director: 'Hayao Miyazaki', genre: ['Animation','Fantasy','Adventure'], synopsis: 'A sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.', poster: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', decade: '2000s', userAdded: false },
  { id: 510, title: 'WALL-E', year: 2008, director: 'Andrew Stanton', genre: ['Animation','Sci-Fi','Romance'], synopsis: 'In a distant future, a small waste-collecting robot embarks on a space journey that will ultimately decide the fate of mankind.', poster: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', decade: '2000s', userAdded: false },
  { id: 511, title: 'Children of Men', year: 2006, director: 'Alfonso Cuaron', genre: ['Sci-Fi','Drama','Thriller'], synopsis: 'In a dystopian future where women are infertile, a bureaucrat agrees to help transport a miraculously pregnant woman to a sanctuary at sea.', poster: 'https://image.tmdb.org/t/p/w500/7Dq5G6NjQiHa5tHbdVAGJSPWSoX.jpg', decade: '2000s', userAdded: false },
  { id: 512, title: 'Requiem for a Dream', year: 2000, director: 'Darren Aronofsky', genre: ['Drama'], synopsis: 'The drug-induced utopias of four Coney Island people are shattered when their addictions run deep.', poster: 'https://image.tmdb.org/t/p/w500/nOoAT2GYbTm5mJnXiS5MKnE4sln.jpg', decade: '2000s', userAdded: false },
  { id: 513, title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, director: 'Peter Jackson', genre: ['Adventure','Fantasy','Action'], synopsis: 'A meek Hobbit and eight companions set out on a journey to destroy the One Ring and the Dark Lord Sauron.', poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg', decade: '2000s', userAdded: false },
  { id: 514, title: 'Oldboy', year: 2003, director: 'Chan-wook Park', genre: ['Thriller','Mystery','Drama'], synopsis: 'After being kidnapped and imprisoned for 15 years, a man is released and seeks revenge on his captors with the help of a young woman.', poster: 'https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMm5r7NTNaXBLGx.jpg', decade: '2000s', userAdded: false },
  { id: 515, title: 'Zodiac', year: 2007, director: 'David Fincher', genre: ['Thriller','Mystery','Drama'], synopsis: 'A cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer who terrorized Northern California.', poster: 'https://image.tmdb.org/t/p/w500/reEMJA1OkxuEkVvZSendMnEDPuN.jpg', decade: '2000s', userAdded: false },
  // 2010s
  { id: 601, title: 'Inception', year: 2010, director: 'Christopher Nolan', genre: ['Sci-Fi','Action','Thriller'], synopsis: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO\'s mind.', poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', decade: '2010s', userAdded: false },
  { id: 602, title: 'The Social Network', year: 2010, director: 'David Fincher', genre: ['Drama'], synopsis: 'The story of the founding of Facebook and the legal battles that followed its creation.', poster: 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg', decade: '2010s', userAdded: false },
  { id: 603, title: 'Mad Max: Fury Road', year: 2015, director: 'George Miller', genre: ['Action','Sci-Fi','Adventure'], synopsis: 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search of her homeland with the aid of female prisoners.', poster: 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg', decade: '2010s', userAdded: false },
  { id: 604, title: 'Parasite', year: 2019, director: 'Bong Joon-ho', genre: ['Thriller','Comedy','Drama'], synopsis: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim family.', poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', decade: '2010s', userAdded: false },
  { id: 605, title: 'Moonlight', year: 2016, director: 'Barry Jenkins', genre: ['Drama'], synopsis: 'A chronicle of the childhood, adolescence and burgeoning adulthood of a young black man growing up in a rough neighborhood of Miami.', poster: 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eAlnkNyZh6U0LBAHB.jpg', decade: '2010s', userAdded: false },
  { id: 606, title: 'The Master', year: 2012, director: 'Paul Thomas Anderson', genre: ['Drama'], synopsis: 'A Naval veteran arrives home after World War II and becomes enamored with a philosophical movement known as The Cause and its enigmatic leader.', poster: 'https://image.tmdb.org/t/p/w500/6VIvp4oAFQI4JRqiLAXaOFVKdJm.jpg', decade: '2010s', userAdded: false },
  { id: 607, title: 'Her', year: 2013, director: 'Spike Jonze', genre: ['Romance','Sci-Fi','Drama'], synopsis: 'In the near future, a lonely writer develops an unlikely relationship with an operating system designed to meet his every need.', poster: 'https://image.tmdb.org/t/p/w500/eCOtqtfvn7mxGaoDcJXJbDSHlBo.jpg', decade: '2010s', userAdded: false },
  { id: 608, title: 'Interstellar', year: 2014, director: 'Christopher Nolan', genre: ['Sci-Fi','Adventure','Drama'], synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', decade: '2010s', userAdded: false },
  { id: 609, title: 'Get Out', year: 2017, director: 'Jordan Peele', genre: ['Horror','Thriller'], synopsis: "A young African-American visits his white girlfriend's parents for the weekend, where his unease about their reception eventually reaches a boiling point.", poster: 'https://image.tmdb.org/t/p/w500/tFXcEccSQMf3lfhfXKSU9iRBpa3.jpg', decade: '2010s', userAdded: false },
  { id: 610, title: 'The Tree of Life', year: 2011, director: 'Terrence Malick', genre: ['Drama'], synopsis: 'The story of a Midwest family in the 1950s explores the origins and meaning of life through a surviving brother\'s memories.', poster: 'https://image.tmdb.org/t/p/w500/wmd5tJ5AV2S7KXErnidLAyHwQfj.jpg', decade: '2010s', userAdded: false },
  { id: 611, title: 'Drive', year: 2011, director: 'Nicolas Winding Refn', genre: ['Action','Drama','Thriller'], synopsis: 'A Hollywood stunt performer who moonlights as a getaway driver is lured from his isolated life by a local gangster.', poster: 'https://image.tmdb.org/t/p/w500/602vevIURmpzkMnmBKNOwDVUOLD.jpg', decade: '2010s', userAdded: false },
  { id: 612, title: 'La La Land', year: 2016, director: 'Damien Chazelle', genre: ['Romance','Drama'], synopsis: 'While navigating their careers in Los Angeles, a jazz musician and an actress fall in love while attempting to reconcile their aspirations for the future.', poster: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg', decade: '2010s', userAdded: false },
  { id: 613, title: 'The Wolf of Wall Street', year: 2013, director: 'Martin Scorsese', genre: ['Drama','Comedy'], synopsis: 'Based on the true story of Jordan Belfort, from his rise to a wealthy stockbroker to his fall involving crime and the federal government.', poster: 'https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg', decade: '2010s', userAdded: false },
  { id: 614, title: 'Inside Llewyn Davis', year: 2013, director: 'Joel Coen', genre: ['Drama'], synopsis: 'A week in the life of a young folk singer as he navigates the Greenwich Village folk scene of 1961.', poster: 'https://image.tmdb.org/t/p/w500/rDPFYIk4dPaabfZZFvFPdPMHbA7.jpg', decade: '2010s', userAdded: false },
  { id: 615, title: 'Portrait of a Lady on Fire', year: 2019, director: 'Celine Sciamma', genre: ['Romance','Drama'], synopsis: 'On an isolated island in Brittany in 1770, a female painter is commissioned to do a wedding portrait of a young woman who wishes to avoid her fate.', poster: 'https://image.tmdb.org/t/p/w500/3NTEMlG5oM9BHgXxY0b9t7BfpGK.jpg', decade: '2010s', userAdded: false },
  // 2020s
  { id: 1, title: 'Dune: Part Two', year: 2024, director: 'Denis Villeneuve', genre: ['Sci-Fi','Adventure'], synopsis: 'Paul Atreides unites with Chani and the Fremen to seek revenge against the conspirators who destroyed his family.', poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', decade: '2020s', userAdded: false },
  { id: 2, title: 'Oppenheimer', year: 2023, director: 'Christopher Nolan', genre: ['Drama','Thriller'], synopsis: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.", poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', decade: '2020s', userAdded: false },
  { id: 3, title: 'Poor Things', year: 2023, director: 'Yorgos Lanthimos', genre: ['Drama','Romance'], synopsis: 'The incredible tale of Bella Baxter, a young woman brought back to life by an eccentric scientist.', poster: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXExtvSD0ogg4QV.jpg', decade: '2020s', userAdded: false },
  { id: 4, title: 'Past Lives', year: 2023, director: 'Celine Song', genre: ['Drama','Romance'], synopsis: 'Two childhood friends reunite in New York City after 20 years apart, examining destiny, choice, and love.', poster: 'https://image.tmdb.org/t/p/w500/k3waqVXsnaHb02LT7RIkaODLKDjp.jpg', decade: '2020s', userAdded: false },
  { id: 5, title: 'Killers of the Flower Moon', year: 2023, director: 'Martin Scorsese', genre: ['Drama','Thriller'], synopsis: 'Members of the Osage Nation are murdered under mysterious circumstances, sparking the birth of the FBI.', poster: 'https://image.tmdb.org/t/p/w500/dB6J5zsSXPmMEHLKAkjV3bFSSgB.jpg', decade: '2020s', userAdded: false },
  { id: 6, title: 'The Holdovers', year: 2023, director: 'Alexander Payne', genre: ['Drama','Comedy'], synopsis: 'A curmudgeonly instructor is forced to stay on campus over the holidays with a troublemaker student and a grieving cook.', poster: 'https://image.tmdb.org/t/p/w500/VHSzNBTwxV8vh7wylo7O9CLdgbA.jpg', decade: '2020s', userAdded: false },
  { id: 7, title: 'Saltburn', year: 2023, director: 'Emerald Fennell', genre: ['Drama','Thriller'], synopsis: 'A student at Oxford University finds himself drawn into the world of a charming and aristocratic classmate.', poster: 'https://image.tmdb.org/t/p/w500/qjhahNLSZ705B5JP92YMEYPocPz.jpg', decade: '2020s', userAdded: false },
  { id: 8, title: 'The Zone of Interest', year: 2023, director: 'Jonathan Glazer', genre: ['Drama'], synopsis: 'The commandant of Auschwitz and his wife attempt to build a dream life next to the camp.', poster: 'https://image.tmdb.org/t/p/w500/hUe8p3s8P7oKULHBYKORDGFpxqb.jpg', decade: '2020s', userAdded: false },
  { id: 9, title: 'Everything Everywhere All at Once', year: 2022, director: 'Daniel Kwan and Daniel Scheinert', genre: ['Sci-Fi','Comedy','Action'], synopsis: 'A middle-aged Chinese immigrant is swept up in an adventure in which she alone can save existence by exploring other universes.', poster: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg', decade: '2020s', userAdded: false },
  { id: 10, title: 'The Banshees of Inisherin', year: 2022, director: 'Martin McDonagh', genre: ['Drama','Comedy'], synopsis: 'Two lifelong friends find themselves at an impasse when one abruptly ends their friendship, setting off increasingly drastic events.', poster: 'https://image.tmdb.org/t/p/w500/4yFG6cSPaCaPhyJ1vtGOiK9a7l8.jpg', decade: '2020s', userAdded: false },
  { id: 11, title: 'Tar', year: 2022, director: 'Todd Field', genre: ['Drama'], synopsis: 'The rise and fall of Lydia Tar, the first female chief conductor of a major German orchestra.', poster: 'https://image.tmdb.org/t/p/w500/aEnQomFEkWnHuPLo7B55n1JzfHg.jpg', decade: '2020s', userAdded: false },
  { id: 12, title: 'Aftersun', year: 2022, director: 'Charlotte Wells', genre: ['Drama'], synopsis: 'Sophie reflects on the shared holiday she took with her father twenty years earlier, filled with tender memories tinged by an ominous feeling.', poster: 'https://image.tmdb.org/t/p/w500/4O3K6xCDLIamKUaFsAfRWOSqnaQ.jpg', decade: '2020s', userAdded: false },
  { id: 13, title: 'Drive My Car', year: 2021, director: 'Ryusuke Hamaguchi', genre: ['Drama'], synopsis: 'A stage actor and director who travels to Hiroshima to direct a play develops an unexpected relationship with his chauffeur.', poster: 'https://image.tmdb.org/t/p/w500/eRlQhKMFyBmA8UZQR8OUKBY5EOR.jpg', decade: '2020s', userAdded: false },
  { id: 14, title: 'The Power of the Dog', year: 2021, director: 'Jane Campion', genre: ['Drama','Thriller'], synopsis: 'A domineering rancher seethes with contempt when his brother and new sister-in-law arrive at their cattle ranch.', poster: 'https://image.tmdb.org/t/p/w500/kEy8CKMT5QRGfZI0IXSqTFKu0PO.jpg', decade: '2020s', userAdded: false },
  { id: 15, title: 'Dune: Part One', year: 2021, director: 'Denis Villeneuve', genre: ['Sci-Fi','Adventure'], synopsis: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.', poster: 'https://image.tmdb.org/t/p/w500/d5NXSklpcvkCitePorter6TPkSRl.jpg', decade: '2020s', userAdded: false },
]

export const getMovies = () => {
  const stored = load(MOVIES_KEY)
  if (stored.length === 0) {
    save(MOVIES_KEY, SEED_MOVIES)
    return SEED_MOVIES
  }
  return stored
}

export const ensureSeedMovies = () => {
  const stored = load(MOVIES_KEY)
  if (stored.length >= SEED_MOVIES.length) return
  const existingIds = new Set(stored.map((m) => m.id))
  const toAdd = SEED_MOVIES.filter((m) => !existingIds.has(m.id))
  if (toAdd.length > 0) save(MOVIES_KEY, [...stored, ...toAdd])
}

export const addMovie = (movie) => {
  const movies = load(MOVIES_KEY)
  const newMovie = { ...movie, id: Date.now(), poster: movie.poster || '', userAdded: true, addedBy: movie.addedBy || 'Guest', addedAt: new Date().toISOString() }
  save(MOVIES_KEY, [...movies, newMovie])
  return newMovie
}

export const updateMovie = (id, updatedFields) => {
  save(MOVIES_KEY, load(MOVIES_KEY).map((m) => m.id === id ? { ...m, ...updatedFields } : m))
}

export const deleteMovie = (id) => {
  save(MOVIES_KEY, load(MOVIES_KEY).filter((m) => m.id !== id))
  save(REVIEWS_KEY, load(REVIEWS_KEY).filter((r) => r.movieId !== id))
}

export const getReviews = () => load(REVIEWS_KEY)

export const getReviewsByMovie = (movieId) =>
  load(REVIEWS_KEY).filter((r) => String(r.movieId) === String(movieId))

export const addReview = (review) => {
  const reviews = load(REVIEWS_KEY)
  const newReview = { ...review, id: Date.now(), user: review.user?.trim() || 'Guest', isGuest: !review.user?.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  save(REVIEWS_KEY, [...reviews, newReview])
  return newReview
}

export const updateReview = (id, updatedFields) => {
  save(REVIEWS_KEY, load(REVIEWS_KEY).map((r) => (r.id === id ? { ...r, ...updatedFields } : r)))
}

export const deleteReview = (id) => {
  save(REVIEWS_KEY, load(REVIEWS_KEY).filter((r) => r.id !== id))
}

export const getSuggestions = (username, count = 6) => {
  const allMovies  = getMovies()
  const allReviews = load(REVIEWS_KEY)
  const userReviews = allReviews.filter((r) => r.user === username)
  const reviewedIds = new Set(userReviews.map((r) => String(r.movieId)))
  const candidates  = allMovies.filter((m) => !reviewedIds.has(String(m.id)))

  if (userReviews.length === 0) {
    const byDecade = {}
    SEED_MOVIES.forEach((m) => { if (!byDecade[m.decade]) byDecade[m.decade] = []; byDecade[m.decade].push(m) })
    const picks = []
    ;['1960s','1970s','1980s','1990s','2000s','2010s','2020s'].forEach((d) => {
      if (byDecade[d]) picks.push(byDecade[d][Math.floor(Math.random() * byDecade[d].length)])
    })
    return picks.filter(Boolean).slice(0, count)
  }

  const highRated = userReviews.filter((r) => r.stars >= 4)
  const genreCounts = {}, directorCounts = {}, decadeCounts = {}
  highRated.forEach((r) => {
    const m = allMovies.find((mv) => String(mv.id) === String(r.movieId))
    if (!m) return
    ;(m.genre || []).forEach((g) => { genreCounts[g] = (genreCounts[g] || 0) + 1 })
    if (m.director) directorCounts[m.director] = (directorCounts[m.director] || 0) + 1
    if (m.decade)   decadeCounts[m.decade]  = (decadeCounts[m.decade]  || 0) + 1
  })

  const scored = candidates.map((m) => {
    let score = 0
    ;(m.genre || []).forEach((g) => { score += (genreCounts[g] || 0) * 3 })
    if (m.director) score += (directorCounts[m.director] || 0) * 2
    if (m.decade)   score += (decadeCounts[m.decade]  || 0) * 1
    return { ...m, _score: score }
  })
  scored.sort((a, b) => b._score - a._score || Math.random() - 0.5)
  return scored.slice(0, count)
}

export const getUsers = () => loadObj(USERS_KEY)

export const updateUserProfile = (username, fields) => {
  const users = loadObj(USERS_KEY)
  if (!users[username]) return
  users[username] = { ...users[username], ...fields }
  save(USERS_KEY, users)
}

export const clearAll = () => {
  localStorage.removeItem(MOVIES_KEY)
  localStorage.removeItem(REVIEWS_KEY)
}
