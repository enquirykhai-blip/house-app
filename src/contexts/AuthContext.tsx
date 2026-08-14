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
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { HouseholdConfig } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  config: HouseholdConfig | null
  configLoading: boolean
  role: 'khai' | 'wife' | null
  displayName: string | null
  signupOpen: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (
    email: string,
    password: string,
    role: 'khai' | 'wife',
    name: string,
  ) => Promise<void>
  logout: () => Promise<void>
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

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const ref = doc(db, 'household', 'config')
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setConfig(snap.exists() ? (snap.data() as HouseholdConfig) : emptyConfig)
        setConfigLoading(false)
      },
      () => {
        // Not readable yet (e.g. logged out) — treat as unknown.
        setConfig(null)
        setConfigLoading(false)
      },
    )
    return unsub
  }, [user])

  const signupOpen = !config || !config.khaiUid || !config.wifeUid

  async function login(email: string, password: string) {
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

  const role: 'khai' | 'wife' | null =
    user && config
      ? user.uid === config.khaiUid
        ? 'khai'
        : user.uid === config.wifeUid
          ? 'wife'
          : null
      : null

  const displayName = role && config ? (role === 'khai' ? config.khaiName : config.wifeName) : null

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
        login,
        signup,
        logout,
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
