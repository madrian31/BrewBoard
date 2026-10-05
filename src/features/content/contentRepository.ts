import type { Content } from '../../types/content'

export interface SnapshotMeta {
  /** true habang may mga pagbabagong hindi pa nako-confirm ng server */
  pending: boolean
}

/**
 * Ang kontrata ng storage. Firestore ang totoong implementation;
 * in-memory naman sa tests.
 */
export interface ContentRepository {
  subscribe: (
    uid: string,
    onData: (items: Content[], meta: SnapshotMeta) => void,
    onError: (err: unknown) => void,
  ) => () => void
  save: (uid: string, item: Content) => Promise<void>
  remove: (uid: string, id: string) => Promise<void>
  saveMany: (uid: string, items: Content[]) => Promise<void>
}