import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import AuthGate from './features/auth/AuthGate'
import { firebaseAuthService } from './features/auth/firebaseAuthService'
import { firestoreRepository } from './features/content/firestoreRepository'
import { routes } from './routes'

// Data router (hindi <BrowserRouter>) para magamit ang useBlocker sa editor.
const router = createBrowserRouter(routes)

export default function App() {
  return (
    <AuthProvider service={firebaseAuthService}>
      <AuthGate repository={firestoreRepository}>
        <RouterProvider router={router} />
      </AuthGate>
    </AuthProvider>
  )
}
