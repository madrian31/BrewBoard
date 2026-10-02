import { useState } from 'react'
import { toInput } from '../data/importers'
import type { ContentInput } from '../../types/content'
import { useContent } from './useContent'
import { loadLegacyContent, markLegacyMigrated } from './legacyStorage'

/** Alok na ilipat sa account ang content na naka-save sa browser noong wala pang Firebase. */
export default function LocalDataBanner() {
  const { importContent } = useContent()
  const [legacy] = useState(() => loadLegacyContent())
  const [hidden, setHidden] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  if (legacy.length === 0 || hidden) return null

  function run() {
    const inputs = legacy
      .map((c) => toInput(c as unknown as Record<string, unknown>))
      .filter((i): i is ContentInput => i !== null)
    const { added, duplicates } = importContent(inputs)
    markLegacyMigrated()
    setResult(
      `Imported ${added} ${added === 1 ? 'piece' : 'pieces'}` +
        (duplicates ? `, skipped ${duplicates} that already existed.` : '.'),
    )
  }

  if (result) {
    return (
      <div className="banner banner-ok" role="status">
        <span>{result}</span>
        <button type="button" className="btn btn-small" onClick={() => setHidden(true)}>
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="banner" role="status">
      <span>
        Found {legacy.length} {legacy.length === 1 ? 'piece' : 'pieces'} saved in this browser from
        before you signed in. Import {legacy.length === 1 ? 'it' : 'them'} into your account?
      </span>
      <span className="banner-actions">
        <button type="button" className="btn btn-small btn-primary" onClick={run}>
          Import
        </button>
        <button type="button" className="btn btn-small" onClick={() => setHidden(true)}>
          Not now
        </button>
      </span>
    </div>
  )
}
