import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthService, AuthUser } from './authService'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { describeAuthError } from './authErrors'

interface State {
  status: 'loading' | 'ready'
  user: AuthUser | null
}

export function AuthProvider({ service, children }: { service: AuthService; children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading', user: null })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => service.subscribe((user) => setState({ status: 'ready', user })), [service])

  const signIn = useCallback(async () => {
    setError(null)
    try {
      await service.signInWithGoogle()
    } catch (err) {
      setError(describeAuthError(err))
    }
  }, [service])

  const signOut = useCallback(() => service.signOut(), [service])

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, error, signIn, signOut }),
    [state, error, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
