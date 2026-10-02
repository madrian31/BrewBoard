import { useContext } from 'react'
import { ContentContext } from './ContentContext'

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent ay dapat nasa loob ng <ContentProvider>')
  return ctx
}
