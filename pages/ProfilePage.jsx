// pages/ProfilePage.jsx — Profile page with AI-powered movie recommendations.

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate }                from 'react-router-dom'
import { useUser }                          from '../UserContext.jsx'
import { getUserReviews, getMovies }        from '../firestoreService.js'
import { Header }                           from './MovieListPage.jsx'
import AuthModal                            from '../AuthModal.jsx'

const AVATAR_EMOJIS = ['🎬', '🍿', '🎭', '🎞️', '🎥', '⭐', '🌊', '🔥', '👁️', '🎪']

// ── AI Recommendations via Claude API ─────────────────────────────────────────
async function fetchAIRecommendations(reviews, movies, topGenres) {
  const reviewedIds = new Set(reviews.map(r => r.movieId))
  const unreviewed  = movies.filter(m => !reviewedIds.has(m.id))

  const reviewSummary = reviews
    .slice(0, 15)
    .map(r => {
      const m = movies.find(x => x.id === r.movieId)
      return m ? `${m.title} (${m.year}) — ${r.stars}/5 stars. "${r.text.slice(0, 80)}"` : null
    })
    .filter(Boolean)
    .join('\n')

  const catalogue = unreviewed
    .map(m => `ID:${m.id} | ${m.title} (${m.year}) | ${m.director} | ${m.genre.join(', ')}`)
    .join('\n')

  const prompt = `You are a film recommendation engine for a movie review app.

The user's top genres are: ${topGenres.slice(0, 5).join(', ') || 'varied'}.

Their recent reviews:
${reviewSummary || 'No reviews yet — recommend based on top genres.'}

Movies they have NOT reviewed yet (pick from these only):
${catalogue}

Return ONLY a valid JSON array of exactly 6 objects. No markdown, no explanation, just raw JSON.
Each object must have exactly these fields:
- "id": the movie ID string (the part after "ID:" in the catalogue)
- "reason": one sentence, max 15 words, explaining why this suits them

Example: [{"id":"abc123","reason":"Matches your love of slow-burn psychological thrillers."}]`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) throw new Error(`API ${response.status}`)
  const data  = await response.json()
  const text  = data.content?.find(b => b.type === 'text')?.text || ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── Genre-score fallback ──────────────────────────────────────────────────────
function genreFallback(reviews, movies, topGenres) {
  const reviewedIds = new Set(reviews.map(r => r.movieId))
  const scored = movies
    .filter(m => !reviewedIds.has(m.id))
    .map(m => {
      const score = (m.genre || []).reduce((acc, g) => {
        const rank = topGenres.indexOf(g)
        return rank >= 0 ? acc + (topGenres.length - rank) : acc
      }, 0)
      return { ...m, score }
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score || b.year - a.year)
    .slice(0, 6)

  // If still empty (no reviews/genres), just return 6 highest-rated by year
  if (scored.length === 0) {
    return movies
      .filter(m => !reviewedIds.has(m.id))
      .slice(0, 6)
      .map(m => ({ id: m.id, reason: 'A critically acclaimed film worth your time.' }))
  }

  return scored.map(m => ({
    id: m.id,
    reason: `Matches your interest in ${(m.genre || []).slice(0, 2).join(' and ')}.`,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { currentUser, updateProfile, signOut } = useUser()
  const navigate   = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
        <Header />
        <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>👤</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>
            Sign in to view your profile
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 16, marginBottom: 28 }}>
            Create an account to track your reviews and join the community.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 12, color: '#fff', padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            SIGN IN / CREATE ACCOUNT
          </button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}>
      <Header />
      <ProfileContent user={currentUser} updateProfile={updateProfile} onSignOut={handleSignOut} />
    </div>
  )
}

// ── ProfileContent ────────────────────────────────────────────────────────────
function ProfileContent({ user, updateProfile, onSignOut }) {
  const [reviews, setReviews] = useState([])
  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [revs, movs] = await Promise.all([
        getUserReviews(user.uid),
        getMovies(),
      ])
      setReviews(revs)
      setMovies(movs)
      setLoading(false)
    }
    load()
  }, [user.uid])

  const movieById = (id) => movies.find((m) => m.id === id)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : '—'

  const topGenres = getTopGenres(reviews, movies)

  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState({
    displayName: user.displayName || user.username,
    bio:         user.bio || '',
    avatarEmoji: user.avatarEmoji || '🎬',
  })
  const [saveMsg, setSaveMsg] = useState('')
  const [saving,  setSaving]  = useState(false)

  const handleSave = async () => {
    if (!form.displayName.trim() || saving) return
    setSaving(true)
    await updateProfile({
      displayName: form.displayName.trim(),
      bio:         form.bio.trim(),
      avatarEmoji: form.avatarEmoji,
    })
    setSaving(false)
    setSaveMsg('Profile saved!')
    setEditing(false)
    setTimeout(() => setSaveMsg(''), 2500)
  }

  const avatarBg = `hsl(${(user.username.charCodeAt(0) * 20 + 200) % 360},55%,40%)`
  const joined   = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently'

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 28px 80px' }}>

      {/* ── Profile card ── */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32, marginBottom: 28, display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, border: '3px solid var(--color-border-mid)' }}>
            {editing ? form.avatarEmoji : (user.avatarEmoji || '🎬')}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>AVATAR</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                  {AVATAR_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setForm((f) => ({ ...f, avatarEmoji: em }))}
                      style={{ fontSize: 24, background: form.avatarEmoji === em ? 'var(--color-bg-deep)' : 'transparent', border: form.avatarEmoji === em ? '2px solid var(--color-primary)' : '2px solid transparent', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', transition: 'all 0.15s' }}
                      aria-pressed={form.avatarEmoji === em}
                    >{em}</button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="display-name" style={labelStyle}>DISPLAY NAME</label>
                <input id="display-name" value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} maxLength={40} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="bio" style={labelStyle}>BIO</label>
                <textarea id="bio" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} maxLength={200} placeholder="Tell the community about your film taste…" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-body)' }} />
                <div style={{ fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', textAlign: 'right', marginTop: 2 }}>{form.bio.length} / 200</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>{saving ? 'Saving…' : 'SAVE PROFILE'}</button>
                <button onClick={() => setEditing(false)} style={ghostBtnStyle}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 900 }}>{user.displayName || user.username}</h1>
                {user.displayName && user.displayName !== user.username && (
                  <span style={{ fontSize: 13, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>@{user.username}</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
                {user.email} · Joined {joined}
              </div>
              {user.bio ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: 15, lineHeight: 1.65, margin: '0 0 16px', maxWidth: 480 }}>{user.bio}</p>
              ) : (
                <p style={{ color: 'var(--color-text-faint)', fontSize: 14, fontStyle: 'italic', margin: '0 0 16px' }}>No bio yet. Tell the community about your film taste!</p>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => setEditing(true)} style={primaryBtnStyle}>✏ Edit Profile</button>
                <button onClick={onSignOut} style={{ ...ghostBtnStyle, color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}>⟵ Sign Out</button>
              </div>
            </>
          )}
        </div>
      </div>

      {saveMsg && (
        <div role="status" style={{ padding: '12px 18px', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 10, color: 'var(--color-success)', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
          ✓ {saveMsg}
        </div>
      )}

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'REVIEWS',    value: loading ? '…' : reviews.length,                              emoji: '📝' },
          { label: 'AVG RATING', value: loading ? '…' : (reviews.length ? `★ ${avgRating}` : '—'),   emoji: '⭐' },
          { label: 'TOP GENRE',  value: loading ? '…' : (topGenres[0] || '—'),                        emoji: '🎭' },
        ].map(({ label, value, emoji }) => (
          <div key={label} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-text)', marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── AI Recommendations ── */}
      {!loading && (
        <RecommendationsSection
          reviews={reviews}
          movies={movies}
          topGenres={topGenres}
          movieById={movieById}
        />
      )}

      {/* ── Recent reviews ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22 }}>My Reviews</h2>
        {reviews.length > 0 && (
          <Link to="/my-submissions" style={{ color: 'var(--color-accent)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Manage all →</Link>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 28px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 16, marginBottom: 20 }}>You haven't written any reviews yet.</p>
          <Link to="/submit-review"><button style={primaryBtnStyle}>WRITE YOUR FIRST REVIEW</button></Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {reviews.slice(0, 5).map((r) => {
            const movie = movieById(r.movieId)
            return (
              <article key={r.id} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {movie?.poster && (
                  <Link to={`/movie/${movie.id}`} style={{ flexShrink: 0 }}>
                    <div style={{ width: 52, height: 72, backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 6 }} />
                  </Link>
                )}
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                    <div>
                      {movie ? (
                        <Link to={`/movie/${movie.id}`} style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-display)', color: 'var(--color-text)', textDecoration: 'none' }}>{movie.title}</Link>
                      ) : (
                        <span style={{ fontWeight: 700, fontSize: 15 }}>Unknown Movie</span>
                      )}
                      {movie && <div style={{ fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{movie.year} · {movie.director}</div>}
                    </div>
                    <div role="img" aria-label={`${r.stars} out of 5 stars`} style={{ display: 'flex', gap: 2 }}>
                      {[1,2,3,4,5].map((n) => (
                        <span key={n} style={{ fontSize: 14, color: n <= r.stars ? 'var(--color-star)' : 'var(--color-star-empty)' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.text}</p>
                  <div style={{ fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>{r.date}</div>
                </div>
              </article>
            )
          })}
          {reviews.length > 5 && (
            <Link to="/my-submissions" style={{ textAlign: 'center', display: 'block', padding: 14, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
              View all {reviews.length} reviews →
            </Link>
          )}
        </div>
      )}
    </main>
  )
}

// ── Recommendations Section ───────────────────────────────────────────────────
function RecommendationsSection({ reviews, movies, topGenres, movieById }) {
  const [recs,    setRecs]    = useState([])      // [{ id, reason }]
  const [status,  setStatus]  = useState('idle')  // idle | loading | done | error
  const [source,  setSource]  = useState(null)    // 'ai' | 'fallback'

  const load = useCallback(async () => {
    setStatus('loading')
    setRecs([])
    try {
      const aiRecs = await fetchAIRecommendations(reviews, movies, topGenres)
      // Validate: filter to IDs that actually exist in movies
      const valid = aiRecs.filter(r => movies.some(m => m.id === r.id)).slice(0, 6)
      if (valid.length < 3) throw new Error('Too few valid AI results')
      setRecs(valid)
      setSource('ai')
      setStatus('done')
    } catch {
      // Fallback to genre algorithm
      const fallback = genreFallback(reviews, movies, topGenres)
      setRecs(fallback)
      setSource('fallback')
      setStatus(fallback.length > 0 ? 'done' : 'empty')
    }
  }, [reviews, movies, topGenres])

  // Auto-load once data is ready and user has some activity
  useEffect(() => {
    if (movies.length > 0 && status === 'idle') {
      load()
    }
  }, [movies.length, status, load])

  const hasActivity = reviews.length > 0 || topGenres.length > 0

  return (
    <section aria-labelledby="recs-heading" style={{ marginBottom: 40 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 id="recs-heading" style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 22 }}>
            Recommended for You
          </h2>
          {source === 'ai' && status === 'done' && (
            <div style={{ fontSize: 11, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 3, letterSpacing: 0.5 }}>
              ✦ AI-POWERED
            </div>
          )}
          {source === 'fallback' && status === 'done' && (
            <div style={{ fontSize: 11, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', fontWeight: 600, marginTop: 3 }}>
              BASED ON YOUR GENRE PREFERENCES
            </div>
          )}
        </div>
        {status !== 'loading' && (
          <button
            onClick={load}
            style={{ background: 'transparent', border: '1px solid var(--color-border-mid)', borderRadius: 8, color: 'var(--color-accent)', padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}
          >
            ↻ REFRESH
          </button>
        )}
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', animation: 'pulse 1.5s ease infinite' }}>
              <div style={{ height: 140, background: 'var(--color-card2)' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ height: 14, background: 'var(--color-card2)', borderRadius: 4, marginBottom: 8 }} />
                <div style={{ height: 10, background: 'var(--color-card2)', borderRadius: 4, width: '70%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No activity yet */}
      {status === 'empty' && (
        <div style={{ textAlign: 'center', padding: '40px 28px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 15, marginBottom: 16 }}>
            Write a few reviews and we'll recommend films you'll love.
          </p>
          <Link to="/submit-review">
            <button style={primaryBtnStyle}>WRITE A REVIEW</button>
          </Link>
        </div>
      )}

      {/* Recommendation grid */}
      {status === 'done' && recs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {recs.map(({ id, reason }) => {
            const movie = movieById(id)
            if (!movie) return null
            return (
              <Link
                key={id}
                to={`/movie/${movie.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <article style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Poster */}
                  <div style={{ height: 140, backgroundImage: movie.poster ? `url(${movie.poster})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--color-card2)', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-card) 0%, transparent 60%)' }} />
                    {/* Genre pill */}
                    {movie.genre?.[0] && (
                      <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(26,86,219,0.85)', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                        {movie.genre[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '10px 14px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
                      {movie.year} · {movie.director}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.2, marginBottom: 8, color: 'var(--color-text)' }}>
                      {movie.title}
                    </div>
                    {/* Reason chip */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>
                        {source === 'ai' ? '✦' : '🎯'}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        {reason}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTopGenres(reviews, movies) {
  const counts = {}
  reviews.forEach((r) => {
    const movie = movies.find((m) => m.id === r.movieId)
    ;(movie?.genre || []).forEach((g) => { counts[g] = (counts[g] || 0) + 1 })
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([g]) => g)
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = {
  fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
  letterSpacing: 1, display: 'block', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase',
}
const inputStyle = {
  width: '100%', background: 'var(--color-input-bg)', border: '1.5px solid var(--color-input-border)',
  borderRadius: 10, padding: '11px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
}
const primaryBtnStyle = {
  background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))',
  border: 'none', borderRadius: 10, color: '#fff', padding: '10px 22px',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
}
const ghostBtnStyle = {
  background: 'transparent', border: '1.5px solid var(--color-border-mid)',
  borderRadius: 10, color: 'var(--color-text-muted)', padding: '10px 22px',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)',
}
