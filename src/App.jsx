// App.jsx — entry component. Main.jsx renders this via BrowserRouter + providers.
// AppRouter handles all page routing; this file just re-exports it cleanly.
import AppRouter from './AppRouter.jsx'

export default function App() {
  return <AppRouter />
}
