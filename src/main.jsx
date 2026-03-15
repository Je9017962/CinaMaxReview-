import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './ThemeContext.jsx'
import { UserProvider }  from './UserContext.jsx'
import AppRouter         from './AppRouter.jsx'
import './theme.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
)
