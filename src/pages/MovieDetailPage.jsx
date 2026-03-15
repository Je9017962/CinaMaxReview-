// pages/MovieDetailPage.jsx — Fetches movie + reviews from Firestore.

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
// FIX: import getMovieById instead of getMovies — fetches a single doc
// rather than loading the entire movies collection just to find one film.
import { getMovieById, getReviewsByMovie } from '../firestoreService.js'
import { useUser }  from '../UserContext.jsx'
import { Header }   from './MovieListPage.jsx'

export default function MovieDetailPage() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { currentUser } = useUser()

  const [movie,   setMovie]   = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // FIX: parallel fetch of one movie doc + its reviews (was: all movies + reviews)
      const [movieDoc, revs] = await Promise.all([
        getMovieById(id),
        getReviewsByMovie(id),
      ])
      setMovie(movieDoc)
      setReviews(revs)
      setLoading(false)
    }
    load()
  }, [id])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : '—'

  if (loading) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: '80px 32px', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
          Loading…
        </div>
      </Shell>
    )
  }

  if (!movie) {
    return (
      <Shell>
        <div style={{ textAlign: 'center', padding: '80px 32px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎬</div>
          <h2 style={{ marginBottom: 12 }}>Movie not found</h2>
          <Link to="/" style={{ color: 'var(--color-accent)', textDecoration: 'underline', fontWeight: 600 }}>
            ← Back to all films
          </Link>
        </div>
      </Shell>
    )
  }

  // Check if the signed-in user already reviewed this movie (by uid)
  const userReview = currentUser && reviews.find((r) => r.uid === currentUser.uid)

  return (
    <Shell>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 28px 0' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-mono)', padding: 0, fontWeight: 600 }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 28px 60px' }}>

        {/* Hero banner */}
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 28, position: 'relative', height: 300, backgroundColor: 'var(--color-card2)' }}>
          {movie.poster && (
            <div style={{ width: '100%', height: '100%', backgroundImage: `url(${movie.poster})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,var(--color-bg) 0%,rgba(0,4,20,0.15) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 28, left: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {(movie.genre || []).map((g) => (
                <span key={g} style={{ fontSize: 11, background: 'rgba(26,86,219,0.85)', borderRadius: 20, padding: '3px 12px', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{g}</span>
              ))}
              {movie.userAdded && (
                <span style={{ fontSize: 11, background: 'rgba(180,83,9,0.85)', borderRadius: 20, padding: '3px 12px', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  USER ADDED
                </span>
              )}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(22px,4vw,40px)', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>
              {movie.title}
            </h1>
            <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(255,255,255,0.72)', fontFamily: 'var(--font-mono)' }}>
              {movie.year} · Directed by {movie.director}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'AVG RATING', value: `★ ${avgRating}`, gold: true },
            { label: 'REVIEWS',    value: reviews.length },
            { label: 'YEAR',       value: movie.year },
          ].map(({ label, value, gold }) => (
            <div key={label} style={{ background: gold ? 'rgba(245,197,24,0.08)' : 'var(--color-card)', border: `1px solid ${gold ? 'rgba(245,197,24,0.22)' : 'var(--color-border)'}`, borderRadius: 12, padding: '12px 22px', textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: gold ? 'var(--color-star)' : 'var(--color-text)', fontFamily: 'var(--font-mono)' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2, fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: 16, marginBottom: 24, borderLeft: '3px solid var(--color-primary)', paddingLeft: 18 }}>
          {movie.synopsis}
        </p>

        <Link to={`/submit-review?movieId=${movie.id}`}>
          <button style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 12, color: '#fff', padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5, marginBottom: 40, fontFamily: 'var(--font-mono)' }}>
            {userReview ? '✏ EDIT YOUR REVIEW' : '+ WRITE A REVIEW'}
          </button>
        </Link>

        {/* Reviews */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-faint)', fontStyle: 'italic', fontSize: 15 }}>
            No reviews yet — be the first!
          </p>
        ) : (
          reviews.map((r) => <ReviewCard key={r.id} review={r} />)
        )}
      </div>
    </Shell>
  )
}

function ReviewCard({ review }) {
  const avatarBg = (name) => `hsl(${((name || '?').charCodeAt(0) * 20 + 200) % 360},55%,38%)`
  const name = review.displayName || review.username || 'Guest'

  return (
    <article style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            aria-hidden="true"
            style={{ width: 34, height: 34, borderRadius: '50%', background: avatarBg(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}
          >
            {review.avatarEmoji || name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
              {review.isGuest && (
                <span style={{ fontSize: 11, background: 'var(--color-guest-bg)', border: '1px solid var(--color-guest-border)', color: 'var(--color-guest-text)', borderRadius: 20, padding: '1px 8px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  GUEST
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{review.date}</div>
          </div>
        </div>
        <div role="img" aria-label={`${review.stars} out of 5 stars`} style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} style={{ fontSize: 16, color: n <= review.stars ? 'var(--color-star)' : 'var(--color-star-empty)' }}>★</span>
          ))}
        </div>
      </div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
        {review.text}
      </p>
    </article>
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
