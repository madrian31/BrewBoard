import { useEffect, useId, useRef, useState } from 'react'
import './PillarInput.css'

export interface PillarOption {
  name: string
  /** Ilang content ang gumagamit na nito. 0 = suhestiyon pa lang. */
  count: number
}

interface Props {
  id: string
  value: string
  options: PillarOption[]
  onChange: (value: string) => void
  placeholder?: string
}

interface Row {
  name: string
  count: number
  isNew: boolean
}

/**
 * Combobox: pumili sa mga kasalukuyang pillar, o mag-type ng bago.
 * Ang tina-type ay awtomatikong nagiging pillar kapag na-save.
 */
export default function PillarInput({ id, value, options, onChange, placeholder }: Props) {
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  // true kapag nag-type ang user: saka lang magfi-filter. Kapag hindi, ipakita ang lahat.
  const [typed, setTyped] = useState(false)
  const [active, setActive] = useState(0)

  const q = value.trim().toLowerCase()
  const existing = typed && q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options
  const exactMatch = options.some((o) => o.name.toLowerCase() === q)

  const rows: Row[] = existing.map((o) => ({ name: o.name, count: o.count, isNew: false }))
  if (q !== '' && !exactMatch) rows.push({ name: value.trim(), count: 0, isNew: true })

  const activeIdx = Math.min(active, Math.max(rows.length - 1, 0))
  const showList = open && rows.length > 0

  useEffect(() => {
    if (!showList) return
    document.getElementById(`${listId}-${activeIdx}`)?.scrollIntoView({ block: 'nearest' })
  }, [showList, activeIdx, listId])

  function choose(row: Row) {
    onChange(row.name)
    setOpen(false)
    setTyped(false)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setTyped(false)
        setOpen(true)
        setActive(0)
      } else {
        setActive(Math.min(activeIdx + 1, rows.length - 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(activeIdx - 1, 0))
    } else if (e.key === 'Enter') {
      if (showList) {
        e.preventDefault()
        choose(rows[activeIdx])
      }
    } else if (e.key === 'Escape') {
      if (open) {
        e.preventDefault()
        setOpen(false)
      }
    }
  }

  function onBlur() {
    setOpen(false)
    setTyped(false)
    // Kapag kapareho ng umiiral na pillar (kahit iba ang laki ng letra), gamitin ang umiiral
    const match = options.find((o) => o.name.toLowerCase() === q)
    if (match && match.name !== value) onChange(match.name)
    else if (value !== value.trim()) onChange(value.trim())
  }

  function toggle() {
    if (open) {
      setOpen(false)
    } else {
      setTyped(false)
      setOpen(true)
      setActive(0)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="pillar-input">
      <input
        ref={inputRef}
        id={id}
        className="input pillar-input-field"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList ? `${listId}-${activeIdx}` : undefined}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setTyped(true)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => {
          setTyped(false)
          setOpen(true)
          const i = options.findIndex((o) => o.name === value)
          setActive(i >= 0 ? i : 0)
        }}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        className="pillar-input-toggle"
        tabIndex={-1}
        aria-label={open ? 'Hide pillars' : 'Show pillars'}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggle}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {showList && (
        <ul id={listId} role="listbox" className="pillar-input-list">
          {rows.map((row, i) => (
            <li
              key={row.isNew ? '__new__' : row.name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={!row.isNew && row.name === value}
              className={
                'pillar-input-option' +
                (i === activeIdx ? ' is-active' : '') +
                (row.isNew ? ' is-new' : '')
              }
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(row)}
            >
              {row.isNew ? (
                <span>
                  Create new pillar: <strong>{row.name}</strong>
                </span>
              ) : (
                <>
                  <span>
                    {row.name === value && <span className="pillar-input-check">✓ </span>}
                    {row.name}
                  </span>
                  {row.count > 0 && <span className="pillar-input-count">{row.count}</span>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
