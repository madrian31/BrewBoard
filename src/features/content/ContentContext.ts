import { createContext } from 'react'
import type { Content, ContentInput, ContentStatus } from '../../types/content'

export interface ImportResult {
  added: number
  duplicates: number
}

export interface ContentContextValue {
  items: Content[]
  /** true kapag hindi ma-save sa browser storage */
  saveFailed: boolean
  getContent: (id: string) => Content | undefined
  addContent: (input: ContentInput) => Content
  updateContent: (id: string, patch: Partial<ContentInput>) => void
  deleteContent: (id: string) => void
  moveStatus: (id: string, status: ContentStatus) => void
  importContent: (inputs: ContentInput[]) => ImportResult
}

export const ContentContext = createContext<ContentContextValue | null>(null)
