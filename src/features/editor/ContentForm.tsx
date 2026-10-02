import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useBlocker, useNavigate } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { PILLAR_SUGGESTIONS, PLATFORMS, STATUSES } from '../../constants/workflow'
import type { ContentInput, ContentStatus, Platform } from '../../types/content'
import { countWords, estimateSpeakingTime } from '../../utils/text'
import './ContentForm.css'

interface Props {
  id?: string
  initial: ContentInput
  /** Saan babalik pagkatapos mag-create o mag-delete */
  returnTo: string
}

export default function ContentForm({ id, initial, returnTo }: Props) {
  const navigate = useNavigate()
  const { addContent, updateContent, deleteContent } = useContent()

  const [draft, setDraft] = useState<ContentInput>(initial)
  const [baseline, setBaseline] = useState<ContentInput>(initial)

  const isDirty = JSON.stringify(draft) !== JSON.stringify(baseline)
  const canSave = draft.title.trim() !== '' && (isDirty || !id)

  // true kapag sinadya nating umalis (pagkatapos mag-save/delete), para hindi magtanong
  const allowLeave = useRef(false)
  const blocker = useBlocker(() => isDirty && !allowLeave.current)

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('You have unsaved changes. Leave and discard them?')) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  // Babala rin kapag isasara o ni-refresh ang tab
  useEffect(() => {
    if (!isDirty) return
    function warn(e: BeforeUnloadEvent) {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [isDirty])

  function set<K extends keyof ContentInput>(key: K, value: ContentInput[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function togglePlatform(p: Platform) {
    set(
      'platforms',
      draft.platforms.includes(p)
        ? draft.platforms.filter((x) => x !== p)
        : [...draft.platforms, p],
    )
  }

  const save = useCallback(() => {
    if (!canSave) return
    const clean = { ...draft, title: draft.title.trim() }
    if (id) {
      updateContent(id, clean)
      setBaseline(clean)
      setDraft(clean)
    } else {
      addContent(clean)
      allowLeave.current = true
      navigate(returnTo, { replace: true })
    }
  }, [canSave, draft, id, addContent, updateContent, navigate, returnTo])

  // Ctrl/Cmd + S para mag-save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  function remove() {
    if (!id) return
    if (confirm(`Delete "${draft.title || 'this content'}"? This can't be undone.`)) {
      allowLeave.current = true
      deleteContent(id)
      navigate(returnTo)
    }
  }

  const words = countWords(draft.script)

  return (
    <div className="page editor">
      <div className="editor-bar">
        <div className="editor-left">
          <Link to={returnTo} className="btn btn-small">
            Back
          </Link>
          <span className="meta editor-state">
            {isDirty ? <span className="unsaved">Unsaved changes</span> : id ? 'Saved' : 'New content'}
          </span>
        </div>
        <div className="editor-actions">
          {id && (
            <button type="button" className="btn btn-danger btn-small" onClick={remove}>
              Delete
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={save} disabled={!canSave}>
            {id ? 'Save changes' : 'Create content'}
          </button>
        </div>
      </div>

      <h1 className="sr-only">{id ? 'Edit content' : 'New content'}</h1>

      <div className="editor-grid">
        <div className="editor-main">
          <div className="field">
            <label htmlFor="title" className="sr-only">
              Title
            </label>
            <textarea
              id="title"
              rows={2}
              className="title-input"
              placeholder="Untitled"
              value={draft.title}
              onChange={(e) => set('title', e.target.value.replace(/\n/g, ' '))}
              autoFocus={!id}
            />
          </div>

          <div className="field">
            <label htmlFor="quote">Quote</label>
            <textarea
              id="quote"
              className="quote-input"
              rows={3}
              placeholder="The line that becomes the caption or thumbnail"
              value={draft.quote}
              onChange={(e) => set('quote', e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="script">Script</label>
              <span className="meta">
                {words} {words === 1 ? 'word' : 'words'} · ~{estimateSpeakingTime(words)}
              </span>
            </div>
            <textarea
              id="script"
              className="input script-box"
              rows={16}
              placeholder="Write or paste the full Cup of Coffee script"
              value={draft.script}
              onChange={(e) => set('script', e.target.value)}
            />
          </div>
        </div>

        <aside className="editor-side">
          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="input"
              value={draft.status}
              onChange={(e) => set('status', e.target.value as ContentStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="pillar">Content pillar</label>
            <input
              id="pillar"
              className="input"
              list="pillar-options"
              placeholder="Life / Nostalgia"
              value={draft.pillar}
              onChange={(e) => set('pillar', e.target.value)}
            />
            <datalist id="pillar-options">
              {PILLAR_SUGGESTIONS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <fieldset className="field">
            <legend>Platforms</legend>
            <div className="check-group">
              {PLATFORMS.map((p) => (
                <label key={p} className="check">
                  <input
                    type="checkbox"
                    checked={draft.platforms.includes(p)}
                    onChange={() => togglePlatform(p)}
                  />
                  {p}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="targetDate">Target date</label>
            <input
              id="targetDate"
              type="date"
              className="input"
              value={draft.targetDate}
              onChange={(e) => set('targetDate', e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              className="input"
              rows={6}
              placeholder="Filming, editing, music, B-roll"
              value={draft.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}