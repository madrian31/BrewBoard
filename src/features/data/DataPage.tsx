import { useRef, useState } from 'react'
import { useContent } from '../content/useContent'
import { downloadFile } from '../../utils/download'
import { todayISO } from '../../utils/date'
import { parseCsvImport, parseJsonImport, type ImportParse } from './importers'
import './DataPage.css'

interface Notice {
  kind: 'ok' | 'error'
  text: string
}

export default function DataPage() {
  const { items, importContent } = useContent()
  const fileRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [ignored, setIgnored] = useState<string[]>([])

  function exportBackup() {
    downloadFile(
      `brewboard-backup-${todayISO()}.json`,
      JSON.stringify({ app: 'brewboard', exportedAt: new Date().toISOString(), items }, null, 2),
      'application/json',
    )
  }

  async function onFile(file: File | undefined) {
    if (!file) return
    setIgnored([])
    try {
      const text = await file.text()
      const isJson = file.name.toLowerCase().endsWith('.json')
      const parsed: ImportParse = isJson ? parseJsonImport(text) : parseCsvImport(text)

      if (parsed.recognized.length === 0) {
        setNotice({
          kind: 'error',
          text: isJson
            ? 'No content was read from this JSON file.'
            : 'No recognized columns found. Please ensure the header row contains "Topic" or "Title" and "Script".',
        })
        return
      }

      const { added, duplicates } = importContent(parsed.inputs)
      setIgnored(parsed.ignored)
      const bits = [`${added} pieces of content were imported`]
      if (duplicates) bits.push(`${duplicates} were skipped (already exist)`)
      if (parsed.skippedEmpty) bits.push(`${parsed.skippedEmpty} The row is empty.`)
      setNotice({ kind: 'ok', text: bits.join(', ') + '.' })
    } catch {
      setNotice({ kind: 'error', text: 'Hindi mabasa ang file. Siguraduhing CSV o JSON ito.' })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="page data-page">
      <header className="page-header">
        <h1>Import at backup</h1>
        <p className="page-sub">Manage your content by importing from external sources or creating backups.</p>
      </header>

      <section className="data-block">
        <h2>Import from External Sources</h2>
        <ol className="data-steps">
          <li>Google Sheets: File, Download, Comma-separated values ​​(.csv).</li>
          <li>Select the file here. The columns Topic/Title, Script, Quote, Status, Pillar, Platform, Target Date, and Notes are recognized.</li>
        </ol>
        <input
          ref={fileRef}
          id="import-file"
          type="file"
          accept=".csv,.tsv,.json,text/csv"
          hidden
          aria-label="Import file"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
          Pumili ng file
        </button>

        {notice && (
          <p role="status" className={notice.kind === 'ok' ? 'notice ok' : 'notice error'}>
            {notice.text}
          </p>
        )}
        {ignored.length > 0 && (
          <p className="meta">Unrecognized columns: {ignored.join(', ')}</p>
        )}
      </section>

      <section className="data-block">
        <h2>Backup</h2>
        <p>Download all {items.length} pieces of content as JSON. You can import this file again later to restore your data.</p>
        <button className="btn" onClick={exportBackup} disabled={items.length === 0}>
          Download backup
        </button>
      </section>
    </div>
  )
}
