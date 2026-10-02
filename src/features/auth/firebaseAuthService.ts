import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import type { AuthService } from './authService'

export const firebaseAuthService: AuthService = {
  subscribe(onChange) {
    return onAuthStateChanged(auth, (u) =>
      onChange(
        u
          ? { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL }
          : null,
      ),
    )
  },
  async signInWithGoogle() {
    await signInWithPopup(auth, new GoogleAuthProvider())
  },
  signOut() {
    return signOut(auth)
  },
}
