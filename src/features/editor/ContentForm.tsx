import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useBlocker, useNavigate } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { PILLAR_SUGGESTIONS, PLATFORMS, STATUSES } from '../../constants/workflow'
import type { ContentInput, ContentStatus, Platform } from '../../types/content'
import { countWords, estimateSpeakingTime } from '../../utils/text'
import PillarInput, { type PillarOption } from '../../components/PillarInput'
import ScriptHistory from './ScriptHistory'
import './ContentForm.css'

interface Props {
  id?: string
  initial: ContentInput
  /** Saan babalik pagkatapos mag-create o mag-delete */
  returnTo: string
}

export default function ContentForm({ id, initial, returnTo }: Props) {
  const navigate = useNavigate()
  const { items, getContent, addContent, updateContent, deleteContent } = useContent()
  const history = id ? (getContent(id)?.history ?? []) : []

  // Mga pillar na ginagamit na, may bilang, kasama ang mga suhestiyon na hindi pa nagagamit
  const pillarOptions = useMemo<PillarOption[]>(() => {
    const counts = new Map<string, number>()
    for (const c of items) {
      if (c.pillar) counts.set(c.pillar, (counts.get(c.pillar) ?? 0) + 1)
    }
    const known = new Set([...counts.keys()].map((n) => n.toLowerCase()))
    for (const p of PILLAR_SUGGESTIONS) {
      if (!known.has(p.toLowerCase())) counts.set(p, 0)
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  const [draft, setDraft] = useState<ContentInput>(initial)
  const [baseline] = useState<ContentInput>(initial)

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
    const clean = { ...draft, title: draft.title.trim(), pillar: draft.pillar.trim() }
    // Sa pag-save (bago man o edit), bumalik sa pinanggalingan (default: Library)
    allowLeave.current = true
    if (id) {
      updateContent(id, clean)
    } else {
      addContent(clean)
    }
    navigate(returnTo, { replace: true })
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
  const caption = draft.caption ?? ''
  const hashtags = draft.hashtags ?? ''
  const tagCount = hashtags.split(/\s+/).filter((t) => t.startsWith('#') && t.length > 1).length
  const [copied, setCopied] = useState(false)

  async function copyPost() {
    const text = [caption.trim(), hashtags.trim()].filter(Boolean).join('\n\n')
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      alert("Couldn't copy automatically. Select the text and copy it yourself.")
    }
  }

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
            {id && (
              <ScriptHistory
                versions={history}
                current={draft.script}
                onRestore={(script) => set('script', script)}
              />
            )}
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="caption">Caption</label>
              <span className="meta">{caption.length} characters</span>
            </div>
            <textarea
              id="caption"
              className="input"
              rows={5}
              placeholder="The caption that goes with the post"
              value={caption}
              onChange={(e) => set('caption', e.target.value)}
            />
          </div>

          <div className="field">
            <div className="label-row">
              <label htmlFor="hashtags">Hashtags</label>
              <span className="meta">
                {tagCount} {tagCount === 1 ? 'hashtag' : 'hashtags'}
              </span>
            </div>
            <textarea
              id="hashtags"
              className="input"
              rows={2}
              placeholder="#life #mindset #cupofcoffee"
              value={hashtags}
              onChange={(e) => set('hashtags', e.target.value)}
            />
            <div>
              <button
                type="button"
                className="btn btn-small"
                onClick={copyPost}
                disabled={!caption.trim() && !hashtags.trim()}
              >
                {copied ? 'Copied' : 'Copy caption and hashtags'}
              </button>
            </div>
          </div>
        </div>

        <aside className="editor-side">
          <div className="field">
            <label className="check">
              <input
                type="checkbox"
                checked={!!draft.hot}
                onChange={(e) => set('hot', e.target.checked)}
              />
              🔥 Hot content
            </label>
            <span className="meta">Mark pieces you think will perform well.</span>
          </div>

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
            <PillarInput
              id="pillar"
              placeholder="Pick one or type a new pillar"
              value={draft.pillar}
              options={pillarOptions}
              onChange={(v) => set('pillar', v)}
            />
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