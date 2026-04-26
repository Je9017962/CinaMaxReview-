// pages/ReviewFormPage.jsx — Submits reviews to Firestore via createReview().
// Reviews are tied to the authenticated user's UID when signed in.

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getMovies, createReview } from '../firestoreService.js'
import { useUser }  from '../UserContext.jsx'
import { Header }   from './MovieListPage.jsx'
import AuthModal    from '../AuthModal.jsx'
import s from './ReviewForm.module.css'

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding']

function validate(form, isLoggedIn) {
  const errors = {}
  if (!form.movieId) errors.movieId = 'Please select a movie.'
  if (!isLoggedIn) {
    const u = form.guestName.trim()
    if (u.length > 0 && u.length < 2) errors.guestName = 'Name must be at least 2 characters.'
    if (u.length > 30)                  errors.guestName = 'Name must be under 30 characters.'
  }
  if (form.stars === 0) errors.stars = 'Please choose a star rating.'
  if (form.text.trim().length < 10)   errors.text = 'Review must be at least 10 characters.'
  if (form.text.trim().length > 1000) errors.text = 'Review must be under 1000 characters.'
  return errors
}

export default function ReviewFormPage() {
  const navigate           = useNavigate()
  const [searchParams]     = useSearchParams()
  const preselectedId      = searchParams.get('movieId') || ''
  const { currentUser }    = useUser()

  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMovies().then((data) => {
      setMovies(data)
      setLoading(false)
    })
  }, [])

  const [form, setForm] = useState({
    movieId:   preselectedId,
    guestName: '',
    stars:     0,
    text:      '',
  })
  const [touched,   setTouched]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hovered,   setHovered]   = useState(0)
  const [showAuth,  setShowAuth]  = useState(false)

  const isLoggedIn = !!currentUser
  const errors     = validate(form, isLoggedIn)
  const isValid    = Object.keys(errors).length === 0

  const touch    = (field) => () => setTouched((t) => ({ ...t, [field]: true }))
  const setField = (k)     => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleStars = (n) => {
    setForm((f) => ({ ...f, stars: n }))
    setTouched((t) => ({ ...t, stars: true }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ movieId: true, guestName: true, stars: true, text: true })
    if (!isValid) return

    setSubmitting(true)
    try {
      await createReview(
        {
          // FIX: form.movieId is already a string (the Firestore doc ID from
          // the <select> value). Do NOT wrap in Number() — Firestore document
          // IDs are always strings, and converting to a number would make
          // getReviewsByMovie(id) queries return 0 results on the detail page.
          movieId:   form.movieId,
          stars:     form.stars,
          text:      form.text.trim(),
          guestName: form.guestName,
        },
        currentUser || null
      )
      setSubmitted(true)
      // FIX: store the timeout ID so it can be cleared if the component
      // unmounts before the 2.5 s elapses (prevents setState-after-unmount).
      const t = setTimeout(() => navigate(`/movie/${form.movieId}`), 2500)
      return () => clearTimeout(t)
    } catch (err) {
      console.error('Failed to submit review:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const charCount   = form.text.trim().length
  const charHintCls = charCount > 1000 ? s.limit : charCount > 800 ? s.warn : ''

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    const displayName = isLoggedIn
      ? (currentUser.displayName || currentUser.username)
      : form.guestName.trim() || 'Guest'

    return (
      <Shell>
        <div className={s.success}>
          <div className={s.successIcon}>🎬</div>
          <h2 className={s.successTitle}>Review Submitted!</h2>
          <p className={s.successSub}>
            Thanks, <strong>{displayName}</strong>. Redirecting you to the movie page…
          </p>
          <div className={s.successActions}>
            <Link to={`/movie/${form.movieId}`} className={s.btnPrimary}>VIEW MOVIE →</Link>
            {isLoggedIn && (
              <Link to="/my-submissions" className={s.btnSecondary}>MY REVIEWS</Link>
            )}
          </div>
        </div>
      </Shell>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <Shell>
      <div className={s.page}>
        <h1 className={s.pageTitle}>Write a Review</h1>
        <p className={s.pageSubtitle}>Share your honest take with the CinaMaxReview community.</p>

        {!isLoggedIn && (
          <div role="note" style={{ marginBottom: 24, padding: '14px 18px', borderRadius: 12, background: 'var(--color-guest-bg)', border: '1px solid var(--color-guest-border)', color: 'var(--color-guest-text)', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <span>📝 Sign in to link this review to your profile — or post as a guest below.</span>
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 8, color: '#fff', padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}
            >
              SIGN IN / JOIN
            </button>
          </div>
        )}
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

        <form className={s.form} onSubmit={handleSubmit} noValidate>

          {/* Movie selector */}
          <div className={s.field}>
            <label className={s.label} htmlFor="movieId">MOVIE</label>
            <select
              id="movieId"
              className={`${s.select} ${touched.movieId && errors.movieId ? s.hasError : ''}`}
              value={form.movieId}
              onChange={setField('movieId')}
              onBlur={touch('movieId')}
              disabled={!!preselectedId || loading}
              style={{ opacity: preselectedId ? 0.75 : 1 }}
            >
              <option value="">— Select a film —</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.title} ({m.year})</option>
              ))}
            </select>
            {touched.movieId && errors.movieId && (
              <span className={s.fieldError} role="alert">{errors.movieId}</span>
            )}
          </div>

          {/* Reviewer identity */}
          <div className={s.field}>
            <label className={s.label} htmlFor="reviewer-name">
              {isLoggedIn ? 'REVIEWING AS' : 'YOUR NAME (OPTIONAL)'}
            </label>
            {isLoggedIn ? (
              <div className={s.readonlyField}>
                <span style={{ marginRight: 8 }}>{currentUser.avatarEmoji || '🎬'}</span>
                {currentUser.displayName || currentUser.username}
                <span className={s.verifiedBadge}>✓ Signed in</span>
              </div>
            ) : (
              <>
                <input
                  id="reviewer-name"
                  className={`${s.input} ${touched.guestName && errors.guestName ? s.hasError : ''}`}
                  value={form.guestName}
                  onChange={setField('guestName')}
                  onBlur={touch('guestName')}
                  placeholder='Leave blank to post as "Guest"'
                  autoComplete="name"
                />
                {touched.guestName && errors.guestName && (
                  <span className={s.fieldError} role="alert">{errors.guestName}</span>
                )}
                <span className={s.fieldHint} style={{ marginTop: 4 }}>
                  Reviews without a name are posted as "Guest"
                </span>
              </>
            )}
          </div>

          <hr className={s.divider} />

          {/* Star rating */}
          <div className={s.field}>
            <label className={s.label} id="stars-label">YOUR RATING</label>
            <div className={s.stars} role="group" aria-labelledby="stars-label">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`${s.star} ${n <= (hovered || form.stars) ? s.active : ''}`}
                  onClick={() => handleStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleStars(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  aria-pressed={form.stars === n}
                >★</span>
              ))}
            </div>
            <div className={s.starLabel}>{STAR_LABELS[hovered || form.stars]}</div>
            {touched.stars && errors.stars && (
              <span className={s.fieldError} role="alert">{errors.stars}</span>
            )}
          </div>

          <hr className={s.divider} />

          {/* Review text */}
          <div className={s.field}>
            <label className={s.label} htmlFor="reviewText">YOUR REVIEW</label>
            <textarea
              id="reviewText"
              className={`${s.textarea} ${touched.text && errors.text ? s.hasError : ''}`}
              value={form.text}
              onChange={setField('text')}
              onBlur={touch('text')}
              placeholder="What did you think? Be specific and honest — no spoilers!"
              rows={6}
              aria-describedby="char-count"
            />
            <div id="char-count" className={`${s.fieldHint} ${charHintCls}`}>{charCount} / 1000</div>
            {touched.text && errors.text && (
              <span className={s.fieldError} role="alert">{errors.text}</span>
            )}
          </div>

          <button
            type="submit"
            className={s.submitBtn}
            disabled={submitting || (Object.keys(touched).length > 0 && !isValid)}
          >
            {submitting ? 'Submitting…' : 'SUBMIT REVIEW'}
          </button>
        </form>
      </div>
    </Shell>
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
