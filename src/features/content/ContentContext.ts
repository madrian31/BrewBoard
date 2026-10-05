import { createContext } from 'react'
import type { Content, ContentInput, ContentStatus } from '../../types/content'

export interface ImportResult {
  added: number
  duplicates: number
}

export interface ContentContextValue {
  items: Content[]
  /** true hanggang dumating ang unang data mula sa Firestore */
  loading: boolean
  loadError: string | null
  writeError: string | null
  dismissWriteError: () => void
  /** true habang may pagbabagong hindi pa nako-confirm ng server */
  pending: boolean
  getContent: (id: string) => Content | undefined
  addContent: (input: ContentInput) => Content
  updateContent: (id: string, patch: Partial<ContentInput>) => void
  deleteContent: (id: string) => void
  moveStatus: (id: string, status: ContentStatus) => void
  /** Isang beses na pagbabago sa maraming content (batch ang pag-save) */
  updateMany: (ids: string[], patch: Partial<ContentInput>) => void
  deleteMany: (ids: string[]) => void
  importContent: (inputs: ContentInput[]) => ImportResult
}

export const ContentContext = createContext<ContentContextValue | null>(null)