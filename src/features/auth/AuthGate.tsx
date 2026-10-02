import type { ReactNode } from 'react'
import Splash from '../../components/Splash'
import { ContentProvider } from '../content/ContentProvider'
import type { ContentRepository } from '../content/contentRepository'
import LoginPage from './LoginPage'
import { useAuth } from './useAuth'

/** Walang user = login page. May user = ibigay ang data niya sa buong app. */
export default function AuthGate({
  repository,
  children,
}: {
  repository: ContentRepository
  children: ReactNode
}) {
  const { status, user } = useAuth()

  if (status === 'loading') return <Splash />
  if (!user) return <LoginPage />

  // key={uid}: kapag nagpalit ng account, panibagong state ang lahat
  return (
    <ContentProvider key={user.uid} uid={user.uid} repository={repository}>
      {children}
    </ContentProvider>
  )
}
