// pages/UserSubmissionsPage.jsx — Loads user reviews from Firestore by UID.

import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import {
  getMovies,
  getUserReviews,
  updateReview,
  deleteReview,
} from '../firestoreService.js'
import { useUser }   from '../UserContext.jsx'
import { Header }    from './MovieListPage.jsx'
import AuthModal     from '../AuthModal.jsx'
import s             from './UserSubmissions.module.css'

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Outstanding']

export default function UserSubmissionsPage() {
  const { currentUser } = useUser()
  const [showAuth, setShowAuth] = useState(false)

  if (!currentUser) {
    return (
      <div className={s.shell}>
        <Header />
        <div style={{ maxWidth: 520, margin: '80px auto', padding: '0 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, marginBottom: 12 }}>
            Sign in to see your reviews
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 16, marginBottom: 28 }}>
            Your reviews are linked to your account. Sign in to view, edit, or delete them.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            style={{ background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-deep))', border: 'none', borderRadius: 12, color: '#fff', padding: '14px 36px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
          >
            SIGN IN
          </button>
          {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        </div>
      </div>
    )
  }

  return <SubmissionsContent currentUser={currentUser} />
}

// ── Main content (signed-in) ──────────────────────────────────────────────────
function SubmissionsContent({ currentUser }) {
  const [movies,  setMovies]  = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [toast,    setToast]    = useState('')

  useEffect(() => {
    async function load() {
      // Fetch by UID — reviews are always tied to the authenticated user's UID
      const [movs, revs] = await Promise.all([
        getMovies(),
        getUserReviews(currentUser.uid),
      ])
      setMovies(movs)
      setReviews(revs)
      setLoading(false)
    }
    load()
  }, [currentUser.uid])

  const movieById = (id) => movies.find((m) => m.id === id)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  const handleDelete = async (id) => {
    await deleteReview(id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
    setDeleting(null)
    showToast('Review deleted.')
  }

  const handleSave = async (id, stars, text) => {
    await updateReview(id, { stars, text })
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, stars, text } : r)))
    setEditing(null)
    showToast('Review updated!')
  }

  const avatarBg = (name) =>
    `hsl(${((name || '?').charCodeAt(0) * 20 + 200) % 360},55%,38%)`

  return (
    <div className={s.shell}>
      <Header />

      <div className={s.page}>
        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: avatarBg(currentUser.username), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {currentUser.avatarEmoji || currentUser.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className={s.pageTitle} style={{ margin: 0 }}>My Reviews</h1>
            <div className={s.pageSubtitle} style={{ margin: 0 }}>
              {loading ? 'Loading…' : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`} by{' '}
              <strong style={{ color: 'var(--color-text)' }}>{currentUser.displayName || currentUser.username}</strong>
            </div>
          </div>
          <Link to="/profile" style={{ marginLeft: 'auto', color: 'var(--color-accent)', fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            ← My Profile
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)' }}>
            Loading your reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🎬</div>
            <h3 className={s.emptyTitle}>No reviews yet</h3>
            <p className={s.emptyText}>Start sharing your film opinions with the community!</p>
            <Link to="/submit-review" className={s.writeBtn}>WRITE A REVIEW</Link>
          </div>
        ) : (
          <div className={s.list}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                movie={movieById(review.movieId)}
                isEditing={editing  === review.id}
                isDeleting={deleting === review.id}
                onEdit={() => setEditing(review.id)}
                onCancelEdit={() => setEditing(null)}
                onSave={(stars, text) => handleSave(review.id, stars, text)}
                onDelete={() => setDeleting(review.id)}
                onCancelDelete={() => setDeleting(null)}
                onConfirmDelete={() => handleDelete(review.id)}
              />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div role="status" className={s.toast}>✓ {toast}</div>
      )}
    </div>
  )
}

// ── ReviewCard (unchanged logic, same UI) ────────────────────────────────────
function ReviewCard({ review, movie, isEditing, isDeleting, onEdit, onCancelEdit, onSave, onDelete, onCancelDelete, onConfirmDelete }) {
  const [editStars,   setEditStars]   = useState(review.stars)
  const [editText,    setEditText]    = useState(review.text)
  const [editHovered, setEditHovered] = useState(0)
  const [editError,   setEditError]   = useState('')

  // FIX: when the parent updates the review prop after a successful save,
  // the local editStars/editText state is stale (still holds the old values).
  // Syncing here ensures the next time the edit form opens it shows the
  // most recently saved content, not whatever was there before the last edit.
  useEffect(() => {
    setEditStars(review.stars)
    setEditText(review.text)
  }, [review.stars, review.text])

  const handleOpenEdit = () => {
    setEditStars(review.stars)
    setEditText(review.text)
    setEditError('')
    onEdit()
  }

  const handleSave = () => {
    if (editStars === 0)               { setEditError('Please choose a rating.'); return }
    if (editText.trim().length < 10)   { setEditError('Review must be at least 10 characters.'); return }
    if (editText.trim().length > 1000) { setEditError('Review must be under 1000 characters.'); return }
    onSave(editStars, editText.trim())
  }

  const charCount   = editText.trim().length
  const charHintCls = charCount > 1000 ? s.limit : charCount > 800 ? s.warn : ''

  return (
    <article className={s.card}>
      <div className={s.cardHeader}>
        <div className={s.movieInfo}>
          {movie?.poster && (
            <div className={s.poster} style={{ backgroundImage: `url(${movie.poster})` }} />
          )}
          <div>
            {movie
              ? <Link to={`/movie/${movie.id}`} className={s.movieTitle}>{movie.title}</Link>
              : <span className={s.movieTitle}>Unknown Movie</span>
            }
            {movie && (
              <div className={s.movieMeta}>{movie.year} · {movie.director}</div>
            )}
          </div>
        </div>

        {!isEditing && !isDeleting && (
          <div className={s.actions}>
            <button className={s.editBtn}   onClick={handleOpenEdit} aria-label={`Edit review for ${movie?.title}`}>Edit</button>
            <button className={s.deleteBtn} onClick={onDelete}       aria-label={`Delete review for ${movie?.title}`}>Delete</button>
          </div>
        )}
      </div>

      {/* View mode */}
      {!isEditing && !isDeleting && (
        <>
          <div className={s.stars} role="img" aria-label={`${review.stars} out of 5 stars`}>
            {[1,2,3,4,5].map((n) => (
              <span key={n} className={`${s.star} ${n <= review.stars ? s.active : ''}`}>★</span>
            ))}
          </div>
          <p className={s.reviewText}>{review.text}</p>
          <div className={s.reviewDate}>{review.date}</div>
        </>
      )}

      {/* Inline edit form */}
      {isEditing && (
        <div className={s.editForm}>
          <div>
            <div className={s.editStars}>
              {[1,2,3,4,5].map((n) => (
                <span
                  key={n}
                  className={`${s.editStar} ${n <= (editHovered || editStars) ? s.active : ''}`}
                  onClick={() => setEditStars(n)}
                  onMouseEnter={() => setEditHovered(n)}
                  onMouseLeave={() => setEditHovered(0)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setEditStars(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  aria-pressed={editStars === n}
                >★</span>
              ))}
            </div>
            <div className={s.starLabel}>{STAR_LABELS[editHovered || editStars]}</div>
          </div>
          <div>
            <textarea
              className={s.editTextarea}
              value={editText}
              onChange={(e) => { setEditText(e.target.value); setEditError('') }}
              rows={4}
              aria-label="Edit your review text"
            />
            <div className={`${s.editHint} ${charHintCls}`}>{charCount} / 1000</div>
            {editError && <div role="alert" className={s.editError}>{editError}</div>}
          </div>
          <div className={s.editActions}>
            <button className={s.saveBtn}   onClick={handleSave}>SAVE CHANGES</button>
            <button className={s.cancelBtn} onClick={onCancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {isDeleting && (
        <div role="alertdialog" aria-label="Confirm delete" className={s.deleteConfirm}>
          <span>Are you sure you want to delete this review?</span>
          <button className={s.confirmYes} onClick={onConfirmDelete}>Yes, delete</button>
          <button className={s.confirmNo}  onClick={onCancelDelete}>Cancel</button>
        </div>
      )}
    </article>
  )
}
