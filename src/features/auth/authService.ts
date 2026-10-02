export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

/** Maliit na interface para hindi nakadikit ang app sa Firebase (at madaling i-test). */
export interface AuthService {
  subscribe: (onChange: (user: AuthUser | null) => void) => () => void
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}
