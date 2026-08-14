import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { arrayUnion, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { DEFAULT_DATE_CATEGORIES, type FavoriteGrocery, type HouseholdConfig } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  config: HouseholdConfig | null
  configLoading: boolean
  role: 'khai' | 'wife' | null
  displayName: string | null
  signupOpen: boolean
  dateCategories: string[]
  favoriteGroceries: FavoriteGrocery[]
  authError: string | null
  clearAuthError: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (
    email: string,
    password: string,
    role: 'khai' | 'wife',
    name: string,
  ) => Promise<void>
  logout: () => Promise<void>
  addDateCategory: (name: string) => Promise<void>
  toggleFavoriteGrocery: (favorite: FavoriteGrocery) => Promise<void>
  updateDisplayName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const emptyConfig: HouseholdConfig = {
  khaiName: '',
  wifeName: '',
  khaiUid: '',
  wifeUid: '',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<HouseholdConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setConfigLoading(true)
    const ref = doc(db, 'household', 'config')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setConfig(snap.exists() ? (snap.data() as HouseholdConfig) : emptyConfig)
        setConfigLoading(false)
      },
      () => {
        // Permission denied — either logged out (expected, not an error), or
        // signed in with a UID that's neither khaiUid nor wifeUid. The
        // latter is someone landing on an unrecognized account by mistake
        // (e.g. via a stray signup); recover automatically instead of
        // leaving them stuck looking at permanently empty lists forever.
        //
        // Checked here, inside the callback for THIS specific subscription,
        // rather than as a separate effect reacting to `user`/`config`
        // state: this closure's `user` is guaranteed to match the
        // subscription that just failed. A separate effect can fire in the
        // same commit as this one before its `setConfigLoading(true)` above
        // is visible to that other effect, reading a stale `configLoading`
        // from the *previous* user and misfiring for a legitimate account.
        setConfig(null)
        setConfigLoading(false)
        if (user) {
          signOut(auth)
          // Stores a translation key, not the final message — Login.tsx
          // renders it via t() so it respects the current language.
          setAuthError('wrongHouseholdError')
        }
      },
    )
    return unsub
  }, [user])

  const signupOpen = !config || !config.khaiUid || !config.wifeUid

  async function login(email: string, password: string) {
    setAuthError(null)
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signup(
    email: string,
    password: string,
    role: 'khai' | 'wife',
    name: string,
  ) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const ref = doc(db, 'household', 'config')
    const base = config ?? emptyConfig
    const next: HouseholdConfig = {
      khaiName: role === 'khai' ? name : base.khaiName,
      wifeName: role === 'wife' ? name : base.wifeName,
      khaiUid: role === 'khai' ? cred.user.uid : base.khaiUid,
      wifeUid: role === 'wife' ? cred.user.uid : base.wifeUid,
    }
    await setDoc(ref, next, { merge: true })
  }

  async function logout() {
    await signOut(auth)
  }

  function clearAuthError() {
    setAuthError(null)
  }

  async function addDateCategory(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const ref = doc(db, 'household', 'config')
    await updateDoc(ref, { dateCategories: arrayUnion(trimmed) })
  }

  async function updateDisplayName(name: string) {
    const trimmed = name.trim()
    if (!trimmed || !role) return
    const ref = doc(db, 'household', 'config')
    await updateDoc(ref, role === 'khai' ? { khaiName: trimmed } : { wifeName: trimmed })
  }

  async function toggleFavoriteGrocery(favorite: FavoriteGrocery) {
    const ref = doc(db, 'household', 'config')
    const current = config?.favoriteGroceries ?? []
    const exists = current.some(
      (f) => f.name === favorite.name && f.category === favorite.category,
    )
    const next = exists
      ? current.filter((f) => !(f.name === favorite.name && f.category === favorite.category))
      : [...current, favorite]
    await updateDoc(ref, { favoriteGroceries: next })
  }

  const role: 'khai' | 'wife' | null =
    user && config
      ? user.uid === config.khaiUid
        ? 'khai'
        : user.uid === config.wifeUid
          ? 'wife'
          : null
      : null

  const displayName = role && config ? (role === 'khai' ? config.khaiName : config.wifeName) : null

  const dateCategories =
    config?.dateCategories && config.dateCategories.length > 0
      ? config.dateCategories
      : DEFAULT_DATE_CATEGORIES

  const favoriteGroceries = config?.favoriteGroceries ?? []

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        config,
        configLoading,
        role,
        displayName,
        signupOpen,
        dateCategories,
        favoriteGroceries,
        authError,
        clearAuthError,
        login,
        signup,
        logout,
        addDateCategory,
        toggleFavoriteGrocery,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
