import { Navigate, Route, HashRouter, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { UndoProvider } from './contexts/UndoContext'
import { BottomNav } from './components/BottomNav'
import { SplashScreen } from './components/SplashScreen'
import { UndoToast } from './components/UndoToast'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { ImportantDatesPage } from './pages/ImportantDates'
import { GroceriesPage } from './pages/Groceries'
import { TasksPage } from './pages/Tasks'
import type { ReactNode } from 'react'

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      {children}
      <UndoToast />
      <BottomNav />
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <SplashScreen />
  if (!user) return <Navigate to="/login" replace />
  return <AppShell>{children}</AppShell>
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <SplashScreen />
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

function Router() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <Signup />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/tarikh"
        element={
          <RequireAuth>
            <ImportantDatesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/runcit"
        element={
          <RequireAuth>
            <GroceriesPage />
          </RequireAuth>
        }
      />
      <Route
        path="/tugasan"
        element={
          <RequireAuth>
            <TasksPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AuthProvider>
          <UndoProvider>
            <Router />
          </UndoProvider>
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
