import { createContext } from 'react'
import type { Content, ContentInput, ContentStatus } from '../../types/content'

export interface ImportResult {
  added: number
  duplicates: number
}

export interface ContentContextValue {
  items: Content[]
  loading: boolean
  loadError: string | null
  writeError: string | null
  dismissWriteError: () => void
  pending: boolean
  getContent: (id: string) => Content | undefined
  addContent: (input: ContentInput) => Content
  updateContent: (id: string, patch: Partial<ContentInput>) => void
  deleteContent: (id: string) => void
  moveStatus: (id: string, status: ContentStatus) => void
  updateMany: (ids: string[], patch: Partial<ContentInput>) => void
  deleteMany: (ids: string[]) => void
  importContent: (inputs: ContentInput[]) => ImportResult
}

export const ContentContext = createContext<ContentContextValue | null>(null)