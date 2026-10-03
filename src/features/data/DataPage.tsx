import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { downloadFile } from '../../utils/download'
import { todayISO } from '../../utils/date'
import { downloadTemplate } from './templateFile'
import { parseCsvImport, parseJsonImport, parseXlsxImport, type ImportParse } from './importers'
import './DataPage.css'

interface Notice {
  kind: 'ok' | 'error'
  text: string
}

const AFTER_IMPORT_PATH = '/'

export default function DataPage() {
  const navigate = useNavigate()
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
      const name = file.name.toLowerCase()
      const isJson = name.endsWith('.json')
      const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls')
      const parsed: ImportParse = isExcel
        ? parseXlsxImport(await file.arrayBuffer())
        : isJson
          ? parseJsonImport(await file.text())
          : parseCsvImport(await file.text())

      if (parsed.recognized.length === 0) {
        setNotice({
          kind: 'error',
          text: isJson
            ? 'No content found in this JSON file.'
            : 'No recognizable columns. The first row should be a header with "Topic" or "Title" and "Script".',
        })
        return
      }

      const { added, duplicates } = importContent(parsed.inputs)
      setIgnored(parsed.ignored)
      const bits = [`${added} imported`]
      if (duplicates) bits.push(`${duplicates} skipped (already exist)`)
      if (parsed.skippedEmpty) bits.push(`${parsed.skippedEmpty} empty ${parsed.skippedEmpty === 1 ? 'row' : 'rows'}`)
      const summary = bits.join(', ') + '.'
      if (added > 0) {
        navigate(AFTER_IMPORT_PATH, { state: { notice: summary } })
        return
      }
      setNotice({ kind: 'ok', text: summary })
    } catch {
      setNotice({ kind: 'error', text: "Couldn't read this file. Make sure it's a CSV, Excel, or JSON file." })
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="page data-page">
      <header className="page-header">
        <h1>Import &amp; backup</h1>
        <p className="page-sub">
          Your content lives in your account. Download a backup now and then.
        </p>
      </header>

      <section className="data-block">
        <h2>Import from Google Sheets</h2>
        <ol className="data-steps">
          <li>
            Download the template and fill it in, or use your own sheet (in Google Sheets: File,
            Download, .csv or .xlsx).
          </li>
          <li>
            Choose the file here. Columns recognized: Topic or Title, Script, Quote, Caption, Hashtags, Status, Pillar,
            Platform, Target Date, Hot, Notes.
          </li>
        </ol>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls,.json,text/csv"
          hidden
          aria-label="Import file"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <div className="data-actions">
          <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
            Choose file
          </button>
          <button type="button" className="btn" onClick={downloadTemplate}>
            Download template
          </button>
        </div>

        {notice && (
          <p role="status" className={notice.kind === 'ok' ? 'notice ok' : 'notice error'}>
            {notice.text}
          </p>
        )}
        {ignored.length > 0 && <p className="meta">Ignored columns: {ignored.join(', ')}</p>}
      </section>

      <section className="data-block">
        <h2>Backup</h2>
        <p>
          Downloads all {items.length} {items.length === 1 ? 'piece' : 'pieces'} as a JSON file.
          Import it above to restore.
        </p>
        <button className="btn" onClick={exportBackup} disabled={items.length === 0}>
          Download backup
        </button>
      </section>
    </div>
  )
}