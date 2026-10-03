import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthProvider'
import AuthGate from './features/auth/AuthGate'
import { firebaseAuthService } from './features/auth/firebaseAuthService'
import { firestoreRepository } from './features/content/firestoreRepository'
import { routes } from './routes'

const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
})

export default function App() {
  return (
    <AuthProvider service={firebaseAuthService}>
      <AuthGate repository={firestoreRepository}>
        <RouterProvider router={router} />
      </AuthGate>
    </AuthProvider>
  )
}
