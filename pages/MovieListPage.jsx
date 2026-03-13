import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMovies, getReviewsByMovie, getSuggestions } from '../localStorage.js'
import ThemeToggle from '../ThemeToggle.jsx'
import { useUser } from '../UserContext.jsx'
import AuthModal from '../AuthModal.jsx'

const GENRES = [
  'All', 'Drama', 'Romance', 'Horror', 'Thriller',
  'Comedy', 'Sci-Fi', 'Action', 'Animation', 'Adventure',
  'Mystery', 'Fantasy', 'Documentary',
]

export default function MovieListPage() {
  const movies = getMovies()
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('All')

  const filtered = movies.filter((m) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      m.title.toLowerCase().includes(q) ||
      (m.director || '').toLowerCase().includes(q)
    const matchGenre = filter === 'All' || (m.genre || []).includes(filter)
    return matchSearch && matchGenre
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <Header />

      {/* Hero */}
      <section aria-label="Search and filter" style={{ padding: '56px 28px 44px', textAlign: 'center', background: 'var(--color-bg-deep)', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: 'clamp(28px,5vw,56px)', fontWeight: 900, margin: '0 0 12px', fontFamily: 'var(--font-display)' }}>
          What's Worth Watching?
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 17, maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.65 }}>
          Real reviews from real cinephiles. Discover, rate, and discuss the latest releases.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <Link to="/submit-review">
            <button style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 10, color: '#fff', padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, fontFamily: 'var(--font-mono)' }}>
              ✍ WRITE A REVIEW
            </button>
          </Link>
          <Link to="/add-movie">
            <button style={{ background: 'transparent', border: '1px solid var(--color-border-mid)', borderRadius: 10, color: 'var(--color-text-muted)', padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, fontFamily: 'var(--font-mono)' }}>
              + ADD A MOVIE
            </button>
          </Link>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 480, margin: '0 auto 20px', position: 'relative' }}>
          <label htmlFor="movie-search" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
            Search films or directors
          </label>
          <span aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-faint)', fontSize: 17, pointerEvents: 'none' }}>⌕</span>
          <input
            id="movie-search"
            placeholder="Search films or directors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--color-input-bg)', border: '1px solid var(--color-input-border)', borderRadius: 14, padding: '13px 16px 13px 44px', fontSize: 15, outline: 'none', fontFamily: 'var(--font-body)' }}
          />
        </div>

        {/* Genre filters */}
        <div role="group" aria-label="Filter by genre" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              aria-pressed={filter === g}
              style={{ background: filter === g ? 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))' : 'var(--color-input-bg)', border: filter === g ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 20, padding: '7px 16px', color: filter === g ? '#fff' : 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: 'all 0.2s', fontWeight: 600 }}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <SuggestionsSection />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 28px 60px' }}>
        {search && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
            Results for "<span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{search}</span>"
            {' '}— {filtered.length} film{filtered.length !== 1 ? 's' : ''}
          </p>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '80px 0', fontSize: 17 }}>
            No movies match your search.{' '}
            <Link to="/add-movie" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontWeight: 600 }}>
              Add it yourself!
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 24 }}>
            {filtered.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Movie Card ────────────────────────────────────────────────────────────────
function MovieCard({ movie }) {
  const [hovered, setHovered] = useState(false)
  const reviews   = getReviewsByMovie(movie.id)
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : '—'

  return (
    <Link
      to={`/movie/${movie.id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      aria-label={`${movie.title} (${movie.year}) — ${avgRating} stars`}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, overflow: 'hidden', height: '100%', boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)', transform: hovered ? 'translateY(-5px)' : 'translateY(0)', transition: 'transform 0.25s, box-shadow 0.25s' }}
      >
        <div style={{ height: 240, backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--color-card2)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,var(--color-card) 0%,transparent 60%)' }} />
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(37,99,235,0.92)', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
            ★ {avgRating}
          </div>
          {movie.userAdded && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(251,191,36,0.9)', borderRadius: 8, padding: '3px 8px', fontSize: 11, fontWeight: 700, color: '#000', fontFamily: 'var(--font-mono)' }}>
              USER ADDED
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(movie.genre || []).slice(0, 2).map((g) => (
              <span key={g} style={{ fontSize: 11, background: 'rgba(37,99,235,0.8)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 20, padding: '2px 10px', color: '#fff', fontFamily: 'var(--font-mono)' }}>{g}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: '13px 16px 16px' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-meta)', fontFamily: 'var(--font-mono)', marginBottom: 4, fontWeight: 500 }}>
            {movie.year} · {movie.director}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
            {movie.title}
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {movie.synopsis}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Shared Header — exported for all pages ────────────────────────────────────
// ── Suggestions Section ───────────────────────────────────────────────────────
export function SuggestionsSection() {
  const { currentUser } = useUser()
  if (!currentUser) return null

  const suggestions = getSuggestions(currentUser.username, 6)
  if (suggestions.length === 0) return null

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text)' }}>
            ✨ Recommended For You
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
            Based on your review history
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
        {suggestions.map((movie) => (
          <SuggestionCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--color-border)', margin: '40px 0 0' }} />
    </section>
  )
}

function SuggestionCard({ movie }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/movie/${movie.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: 'var(--color-card)',
        border: `1px solid ${hovered ? 'var(--color-primary)' : 'var(--color-border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.2s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-card-hover)' : 'none',
      }}>
        {/* Poster */}
        <div style={{ aspectRatio: '2/3', background: 'var(--color-bg-deep)', overflow: 'hidden', position: 'relative' }}>
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🎬</div>
          )}
          {/* Decade badge */}
          {movie.decade && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '3px 7px', borderRadius: 6, letterSpacing: 0.5 }}>
              {movie.decade}
            </div>
          )}
        </div>
        {/* Info */}
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', fontFamily: 'var(--font-display)', lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {movie.title}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
            {movie.year}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {(movie.genre || []).slice(0, 2).map((g) => (
              <span key={g} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--color-bg-deep)', color: 'var(--color-text-muted)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}


export function Header() {
  const { currentUser, signOut } = useUser()
  const navigate = useNavigate()
  const [showAuth,     setShowAuth]     = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const avatarBg = (name) => `hsl(${(name.charCodeAt(0) * 20 + 200) % 360},55%,40%)`

  const handleSignOut = () => {
    signOut()
    setShowDropdown(false)
    navigate('/')
  }

  // Close dropdown on outside click
  const handleDropdownBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setShowDropdown(false)
  }

  return (
    <>
      <header style={{ padding: '0 28px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-header-bg)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>

          {/* Logo */}
          <Link to="/" style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text)', fontFamily: 'var(--font-display)', textDecoration: 'none' }}>
            Cina<span style={{ color: 'var(--color-accent)' }}>Max</span>
            <span style={{ color: 'var(--color-text-faint)', fontWeight: 400, fontSize: 14 }}> Review</span>
          </Link>

          {/* Nav */}
          <nav aria-label="Main navigation" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[['/', 'All Films'], ['/submit-review', 'Write Review'], ['/add-movie', '+ Add Movie']].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {label}
              </Link>
            ))}

            <ThemeToggle />

            {/* Auth area */}
            {currentUser ? (
              <div style={{ position: 'relative' }} onBlur={handleDropdownBlur}>
                <button
                  onClick={() => setShowDropdown((d) => !d)}
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-input-bg)', border: '1px solid var(--color-border-mid)', borderRadius: 999, padding: '5px 14px 5px 5px', cursor: 'pointer', color: 'var(--color-text)' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg(currentUser.username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff' }}>
                    {currentUser.avatarEmoji || currentUser.username[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {currentUser.displayName || currentUser.username}
                  </span>
                  <span aria-hidden="true" style={{ fontSize: 9, color: 'var(--color-text-faint)' }}>▾</span>
                </button>

                {showDropdown && (
                  <div role="menu" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--color-card)', border: '1px solid var(--color-border-mid)', borderRadius: 14, minWidth: 210, overflow: 'hidden', boxShadow: 'var(--shadow-modal)', zIndex: 200 }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{currentUser.displayName || currentUser.username}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-faint)', marginTop: 2 }}>{currentUser.email}</div>
                    </div>
                    {[
                      ['/profile',        '👤 My Profile'],
                      ['/my-submissions', '📋 My Reviews'],
                    ].map(([to, label]) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setShowDropdown(false)}
                        style={{ display: 'block', padding: '12px 16px', color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 14, fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--color-border)', fontWeight: 500 }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-deep)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {label}
                      </Link>
                    ))}
                    <button
                      role="menuitem"
                      onClick={handleSignOut}
                      style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', color: 'var(--color-error)', fontSize: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-error-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      ⟵ Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 10, color: '#fff', padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}
              >
                SIGN IN
              </button>
            )}
          </nav>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
