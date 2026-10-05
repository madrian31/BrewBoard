import { useState } from 'react'
import type { ScriptVersion } from '../../types/content'
import { countWords } from '../../utils/text'
import './ScriptHistory.css'

interface Props {
  versions: ScriptVersion[]
  /** Ang script na nasa editor ngayon */
  current: string
  onRestore: (script: string) => void
}

function stamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Earlier version'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Listahan ng mga naunang bersyon ng script. Hindi nase-save ang pagbalik hangga't hindi pinipindot ang Save. */
export default function ScriptHistory({ versions, current, onRestore }: Props) {
  const [open, setOpen] = useState(false)

  if (versions.length === 0) {
    return (
      <p className="meta history-empty">
        No earlier versions yet. They appear after you change the script and save.
      </p>
    )
  }

  function restore(script: string) {
    const needsConfirm = current.trim() !== '' && current !== script
    if (
      needsConfirm &&
      !window.confirm(
        'Put this version into the editor? Nothing is saved until you click Save changes.',
      )
    ) {
      return
    }
    onRestore(script)
  }

  return (
    <div className="history">
      <button
        type="button"
        className="btn btn-small"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Hide version history' : `Version history (${versions.length})`}
      </button>

      {open && (
        <ul className="history-list">
          {versions.map((v, i) => {
            const words = countWords(v.script)
            const isCurrent = v.script === current
            return (
              <li key={`${v.savedAt}-${i}`} className="history-item">
                <div className="history-head">
                  <span className="history-when">{stamp(v.savedAt)}</span>
                  <span className="meta">
                    {words} {words === 1 ? 'word' : 'words'}
                  </span>
                  {isCurrent ? (
                    <span className="meta history-current">In the editor now</span>
                  ) : (
                    <button type="button" className="btn btn-small" onClick={() => restore(v.script)}>
                      Restore
                    </button>
                  )}
                </div>
                <details>
                  <summary>{v.script.replace(/\s+/g, ' ').slice(0, 90)}…</summary>
                  <pre className="history-text">{v.script}</pre>
                </details>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
