import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { ContentRepository } from './contentRepository'
import { contentToDoc, docToContent, sortByUpdated } from './contentMapper'

// Ang data ng bawat user ay nasa users/{uid}/content/{id}. Tugma ito sa Security Rules.
const BATCH_SIZE = 400 // limit ng Firestore ay 500 kada batch

export const firestoreRepository: ContentRepository = {
  subscribe(uid, onData, onError) {
    return onSnapshot(
      collection(db, 'users', uid, 'content'),
      { includeMetadataChanges: true },
      (snap) => {
        const items = snap.docs.map((d) => docToContent(d.id, d.data()))
        onData(sortByUpdated(items), { pending: snap.metadata.hasPendingWrites })
      },
      onError,
    )
  },

  save(uid, item) {
    return setDoc(doc(db, 'users', uid, 'content', item.id), contentToDoc(item))
  },

  remove(uid, id) {
    return deleteDoc(doc(db, 'users', uid, 'content', id))
  },

  async saveMany(uid, items) {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = writeBatch(db)
      for (const item of items.slice(i, i + BATCH_SIZE)) {
        batch.set(doc(db, 'users', uid, 'content', item.id), contentToDoc(item))
      }
      await batch.commit()
    }
  },
}