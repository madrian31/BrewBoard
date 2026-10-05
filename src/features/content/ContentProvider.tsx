import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Content, ContentInput, ContentStatus } from '../../types/content'
import { uid as makeId } from '../../utils/id'
import { ContentContext, type ContentContextValue, type ImportResult } from './ContentContext'
import type { ContentRepository } from './contentRepository'

function fingerprint(c: Pick<ContentInput, 'title' | 'script'>): string {
  return `${c.title.trim().toLowerCase()}\u0000${c.script.trim()}`
}

function describeError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : ''
  if (code === 'permission-denied') {
    return 'Permission denied. Check that your Firestore rules allow access to users/{uid}/content.'
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}

interface Props {
  uid: string
  repository: ContentRepository
  children: ReactNode
}

export function ContentProvider({ uid, repository, children }: Props) {
  const [items, setItems] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [writeError, setWriteError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  // Laging pinakabagong listahan, para tama ang mga sunud-sunod na mabilis na edit
  const itemsRef = useRef<Content[]>([])

  const commit = useCallback((next: Content[]) => {
    itemsRef.current = next
    setItems(next)
  }, [])

  useEffect(() => {
    return repository.subscribe(
      uid,
      (next, meta) => {
        commit(next)
        setPending(meta.pending)
        setLoading(false)
      },
      (err) => {
        setLoadError(describeError(err))
        setLoading(false)
      },
    )
  }, [uid, repository, commit])

  const onWriteError = useCallback((err: unknown) => setWriteError(describeError(err)), [])

  const getContent = useCallback((id: string) => items.find((c) => c.id === id), [items])

  const addContent = useCallback(
    (input: ContentInput) => {
      const now = new Date().toISOString()
      const item: Content = { ...input, id: makeId(), createdAt: now, updatedAt: now }
      commit([item, ...itemsRef.current])
      repository.save(uid, item).catch(onWriteError)
      return item
    },
    [uid, repository, commit, onWriteError],
  )

  const updateContent = useCallback(
    (id: string, patch: Partial<ContentInput>) => {
      const current = itemsRef.current.find((c) => c.id === id)
      if (!current) return
      const updated: Content = { ...current, ...patch, updatedAt: new Date().toISOString() }
      commit(itemsRef.current.map((c) => (c.id === id ? updated : c)))
      repository.save(uid, updated).catch(onWriteError)
    },
    [uid, repository, commit, onWriteError],
  )

  const deleteContent = useCallback(
    (id: string) => {
      commit(itemsRef.current.filter((c) => c.id !== id))
      repository.remove(uid, id).catch(onWriteError)
    },
    [uid, repository, commit, onWriteError],
  )

  const updateMany = useCallback(
    (ids: string[], patch: Partial<ContentInput>) => {
      const idSet = new Set(ids)
      // Bawat isa ay 1ms na mas luma sa nauna, para hindi magbago ang kanilang pagkakasunod-sunod
      const base = Date.now()
      const changed: Content[] = []
      const next = itemsRef.current.map((c) => {
        if (!idSet.has(c.id)) return c
        const updated: Content = {
          ...c,
          ...patch,
          updatedAt: new Date(base - changed.length).toISOString(),
        }
        changed.push(updated)
        return updated
      })
      if (changed.length === 0) return
      commit(next)
      repository.saveMany(uid, changed).catch(onWriteError)
    },
    [uid, repository, commit, onWriteError],
  )

  const deleteMany = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return
      const idSet = new Set(ids)
      commit(itemsRef.current.filter((c) => !idSet.has(c.id)))
      Promise.all(ids.map((id) => repository.remove(uid, id))).catch(onWriteError)
    },
    [uid, repository, commit, onWriteError],
  )

  const moveStatus = useCallback(
    (id: string, status: ContentStatus) => updateContent(id, { status }),
    [updateContent],
  )

  const importContent = useCallback(
    (inputs: ContentInput[]): ImportResult => {
      const seen = new Set(itemsRef.current.map(fingerprint))
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
      // Bawat isa ay 1ms na mas luma sa nauna, para nasa parehong ayos ng sheet
      const base = Date.now()
      const created: Content[] = fresh.map((input, i) => {
        const stamp = new Date(base - i).toISOString()
        return { ...input, id: makeId(), createdAt: stamp, updatedAt: stamp }
      })
      if (created.length > 0) {
        commit([...created, ...itemsRef.current])
        repository.saveMany(uid, created).catch(onWriteError)
      }
      return { added: created.length, duplicates }
    },
    [uid, repository, commit, onWriteError],
  )

  const value = useMemo<ContentContextValue>(
    () => ({
      items,
      loading,
      loadError,
      writeError,
      dismissWriteError: () => setWriteError(null),
      pending,
      getContent,
      addContent,
      updateContent,
      deleteContent,
      moveStatus,
      updateMany,
      deleteMany,
      importContent,
    }),
    [
      items,
      loading,
      loadError,
      writeError,
      pending,
      getContent,
      addContent,
      updateContent,
      deleteContent,
      moveStatus,
      updateMany,
      deleteMany,
      importContent,
    ],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}