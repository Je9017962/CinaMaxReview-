// pages/AddMoviePage.jsx — Saves new movies to Firestore via addMovie().

import { useState } from 'react'
import { Link }     from 'react-router-dom'
import { addMovie } from '../firestoreService.js'
import { useUser }  from '../UserContext.jsx'
import { Header }   from './MovieListPage.jsx'
import AuthModal    from '../AuthModal.jsx'

const GENRES = [
  'Drama', 'Romance', 'Horror', 'Thriller', 'Comedy',
  'Sci-Fi', 'Action', 'Animation', 'Adventure', 'Documentary', 'Mystery', 'Fantasy',
]

const CURRENT_YEAR = new Date().getFullYear()

function validate(form) {
  const errors = {}
  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.director.trim()) errors.director = 'Director is required.'
  if (!form.year || form.year < 1888 || form.year > CURRENT_YEAR + 2)
    errors.year = `Year must be between 1888 and ${CURRENT_YEAR + 2}.`
  if (form.genre.length === 0) errors.genre = 'Select at least one genre.'
  if (form.synopsis.trim().length < 20) errors.synopsis = 'Synopsis must be at least 20 characters.'
  if (form.synopsis.trim().length > 600) errors.synopsis = 'Synopsis must be under 600 characters.'
  if (form.poster && !/^https?:\/\/.+/.test(form.poster.trim()))
    errors.poster = 'Poster must be a valid URL (starting with http/https).'
  return errors
}

export default function AddMoviePage() {
  const { currentUser } = useUser()
  const [showAuth,    setShowAuth]    = useState(false)
  const [submitted,   setSubmitted]   = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [form,        setForm]        = useState({
    title: '', director: '', year: '', genre: [], synopsis: '', poster: '',
  })
  const [touched, setTouched] = useState({})

  const errors  = validate({ ...form, year: Number(form.year) })
  const isValid = Object.keys(errors).length === 0

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setTouched((t) => ({ ...t, [k]: true }))
  }
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }))
  const toggleGenre = (g) => {
    setForm((f) => ({
      ...f,
      genre: f.genre.includes(g) ? f.genre.filter((x) => x !== g) : [...f.genre, g],
    }))
    setTouched((t) => ({ ...t, genre: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ title: true, director: true, year: true, genre: true, synopsis: true, poster: true })
    if (!isValid || submitting) return

    setSubmitting(true)
    try {
      // Pass the current user so their UID is stored on the movie document
      const newMovie = await addMovie(
        {
          title:    form.title.trim(),
          director: form.director.trim(),
          year:     Number(form.year),
          genre:    form.genre,
          synopsis: form.synopsis.trim(),
          poster:   form.poster.trim(),
        },
        currentUser   // { uid, username, displayName, … }
      )
      setSubmitted(newMovie)
    } catch (err) {
      console.error('Failed to add movie:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Shell>
        <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 28px', textAlign: 'center', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎬</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 10 }}>Movie Added!</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 16, marginBottom: 28 }}>
            <strong style={{ color: 'var(--color-text)' }}>{submitted.title}</strong> is now in the catalogue. Be the first to review it!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/movie/${submitted.id}`}>
              <button style={primaryBtn}>VIEW MOVIE →</button>
            </Link>
            <Link to={`/submit-review?movieId=${submitted.id}`}>
              <button style={secondaryBtn}>WRITE A REVIEW</button>
            </Link>
          </div>
        </div>
      </Shell>
    )
  }

  // ── Sign-in gate for guests ───────────────────────────────────────────────
  if (!currentUser) {
    return (
      <Shell>
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎬</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 12 }}>
            Sign in to Add a Movie
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 16, lineHeight: 1.65, marginBottom: 12 }}>
            Only registered members can add new films to the catalogue.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button onClick={() => setShowAuth(true)} style={primaryBtn}>
              SIGN IN / CREATE ACCOUNT
            </button>
            <Link to="/"><button style={secondaryBtn}>← BROWSE FILMS</button></Link>
          </div>
          <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: 1, marginBottom: 14 }}>MEMBER BENEFITS</div>
            {[['🎬','Add movies to the catalogue'],['✍️','Write and manage your reviews'],['👤','Build your personal film profile'],['✏️','Edit or delete past reviews']].map(([icon, text]) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, fontSize: 14, color: 'var(--color-text-muted)' }}>
                <span style={{ fontSize: 18 }}>{icon}</span>{text}
              </div>
            ))}
          </div>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </Shell>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 28px 80px' }}>
        <Link to="/" style={{ color: 'var(--color-accent)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          ← Back to films
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px,4vw,34px)', margin: '20px 0 8px' }}>
          Add a Movie
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Can't find a film in our catalogue? Add it yourself and be the first to review it.
        </p>

        {/* Signed-in badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 10, marginBottom: 28, fontSize: 14 }}>
          <span style={{ fontSize: 20 }}>{currentUser.avatarEmoji || '🎬'}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            Adding as{' '}
            <strong style={{ color: 'var(--color-success)' }}>{currentUser.displayName || currentUser.username}</strong>
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>✓ VERIFIED</span>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          <Field label="MOVIE TITLE *" error={touched.title && errors.title}>
            <input value={form.title} onChange={set('title')} onBlur={touch('title')} placeholder="e.g. Dune: Part Three" style={inputSt(touched.title && errors.title)} />
          </Field>

          <Field label="DIRECTOR *" error={touched.director && errors.director}>
            <input value={form.director} onChange={set('director')} onBlur={touch('director')} placeholder="e.g. Denis Villeneuve" style={inputSt(touched.director && errors.director)} />
          </Field>

          <Field label="RELEASE YEAR *" error={touched.year && errors.year}>
            <input value={form.year} onChange={set('year')} onBlur={touch('year')} placeholder={String(CURRENT_YEAR)} type="number" min="1888" max={CURRENT_YEAR + 2} style={{ ...inputSt(touched.year && errors.year), maxWidth: 160 }} />
          </Field>

          <Field label="GENRE (select all that apply) *" error={touched.genre && errors.genre}>
            <div role="group" aria-label="Genres" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GENRES.map((g) => {
                const selected = form.genre.includes(g)
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    aria-pressed={selected}
                    style={{ background: selected ? 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))' : 'var(--color-input-bg)', border: selected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', borderRadius: 20, padding: '7px 16px', color: selected ? '#fff' : 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 600, transition: 'all 0.18s' }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field label="SYNOPSIS *" error={touched.synopsis && errors.synopsis}>
            <textarea
              value={form.synopsis}
              onChange={set('synopsis')}
              onBlur={touch('synopsis')}
              rows={4}
              placeholder="Brief plot summary — no major spoilers."
              style={{ ...inputSt(touched.synopsis && errors.synopsis), resize: 'vertical', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}
            />
            <div style={{ fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', textAlign: 'right', marginTop: 2 }}>
              {form.synopsis.trim().length} / 600
            </div>
          </Field>

          <Field label="POSTER IMAGE URL (optional)" error={touched.poster && errors.poster}>
            <input value={form.poster} onChange={set('poster')} onBlur={touch('poster')} placeholder="https://example.com/poster.jpg" type="url" style={inputSt(touched.poster && errors.poster)} />
            {form.poster && !errors.poster && (
              <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                <img src={form.poster} alt="Poster preview" onError={(e) => (e.currentTarget.style.display = 'none')} style={{ width: 60, height: 82, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--color-border)' }} />
                <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>Preview</span>
              </div>
            )}
          </Field>

          <button
            type="submit"
            disabled={submitting || (Object.keys(touched).length > 0 && !isValid)}
            style={{ ...primaryBtn, alignSelf: 'flex-start', opacity: (submitting || (Object.keys(touched).length > 0 && !isValid)) ? 0.45 : 1, cursor: submitting ? 'wait' : 'pointer' }}
          >
            {submitting ? 'Adding…' : 'ADD MOVIE'}
          </button>
        </form>
      </div>
    </Shell>
  )
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, fontWeight: 700 }}>{label}</label>
      {children}
      {error && <span role="alert" style={{ fontSize: 13, color: 'var(--color-error)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>⚠ {error}</span>}
    </div>
  )
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
      <Header />
      {children}
    </div>
  )
}

const inputSt = (hasError) => ({
  width: '100%', background: 'var(--color-input-bg)', color: 'var(--color-input-text)',
  border: `1.5px solid ${hasError ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
  borderRadius: 10, padding: '12px 14px', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'var(--font-body)', transition: 'border-color 0.2s, box-shadow 0.2s',
})

const primaryBtn = {
  background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))',
  border: 'none', borderRadius: 12, color: '#fff', padding: '13px 32px',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
}

const secondaryBtn = {
  background: 'transparent', border: '1.5px solid var(--color-border-mid)',
  borderRadius: 12, color: 'var(--color-accent)', padding: '13px 32px',
  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
}
