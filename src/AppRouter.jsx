import { Routes, Route } from 'react-router-dom'
import MovieListPage      from './pages/MovieListPage.jsx'
import MovieDetailPage    from './pages/MovieDetailPage.jsx'
import ReviewFormPage     from './pages/ReviewFormPage.jsx'
import UserSubmissionsPage from './pages/UserSubmissionsPage.jsx'
import ProfilePage        from './pages/ProfilePage.jsx'
import AddMoviePage       from './pages/AddMoviePage.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/"                element={<MovieListPage />} />
      <Route path="/movie/:id"       element={<MovieDetailPage />} />
      <Route path="/submit-review"   element={<ReviewFormPage />} />
      <Route path="/my-submissions"  element={<UserSubmissionsPage />} />
      <Route path="/profile"         element={<ProfilePage />} />
      <Route path="/add-movie"       element={<AddMoviePage />} />
    </Routes>
  )
}
