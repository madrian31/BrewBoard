import { createContext } from 'react'
import type { AuthUser } from './authService'

export interface AuthContextValue {
  status: 'loading' | 'ready'
  user: AuthUser | null
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
