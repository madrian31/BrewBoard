import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { Content, ContentInput, ContentStatus } from '../../types/content'
import { uid } from '../../utils/id'
import {
  ContentContext,
  type ContentContextValue,
  type ImportResult,
} from './ContentContext'
import {
  getSaveFailed,
  loadContent,
  saveContent,
  subscribeSaveStatus,
} from './contentStorage'

function fingerprint(c: Pick<ContentInput, 'title' | 'script'>): string {
  return `${c.title.trim().toLowerCase()}\u0000${c.script.trim()}`
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Content[]>(() => loadContent())
  const saveFailed = useSyncExternalStore(subscribeSaveStatus, getSaveFailed)

  useEffect(() => {
    saveContent(items)
  }, [items])

  const getContent = useCallback(
    (id: string) => items.find((c) => c.id === id),
    [items],
  )

  const addContent = useCallback((input: ContentInput) => {
    const now = new Date().toISOString()
    const item: Content = { ...input, id: uid(), createdAt: now, updatedAt: now }
    setItems((prev) => [item, ...prev])
    return item
  }, [])

  const updateContent = useCallback((id: string, patch: Partial<ContentInput>) => {
    const now = new Date().toISOString()
    setItems((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: now } : c)),
    )
  }, [])

  const deleteContent = useCallback((id: string) => {
    setItems((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const moveStatus = useCallback(
    (id: string, status: ContentStatus) => updateContent(id, { status }),
    [updateContent],
  )

  const importContent = useCallback(
    (inputs: ContentInput[]): ImportResult => {
      const seen = new Set(items.map(fingerprint))
      const fresh: ContentInput[] = []
      let duplicates = 0
      for (const input of inputs) {
        const key = fingerprint(input)
        if (seen.has(key)) {
          duplicates++
        } else {
          seen.add(key)
          fresh.push(input)
        }
      }
      // Bawat isa ay 1ms na mas luma kaysa sa nauna, para nasa parehong ayos ng sheet
      const base = Date.now()
      const created: Content[] = fresh.map((input, i) => {
        const stamp = new Date(base - i).toISOString()
        return { ...input, id: uid(), createdAt: stamp, updatedAt: stamp }
      })
      if (created.length > 0) setItems((prev) => [...created, ...prev])
      return { added: created.length, duplicates }
    },
    [items],
  )

  const value = useMemo<ContentContextValue>(
    () => ({
      items,
      saveFailed,
      getContent,
      addContent,
      updateContent,
      deleteContent,
      moveStatus,
      importContent,
    }),
    [items, saveFailed, getContent, addContent, updateContent, deleteContent, moveStatus, importContent],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
