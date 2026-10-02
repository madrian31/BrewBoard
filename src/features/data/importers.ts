import * as XLSX from 'xlsx'
import { PLATFORMS, STATUSES } from '../../constants/workflow'
import type { ContentInput, ContentStatus, Platform } from '../../types/content'
import { parseCsv } from '../../utils/csv'

const HEADER_ALIASES: Record<string, keyof ContentInput> = {
  title: 'title',
  topic: 'title',
  'content title': 'title',
  quote: 'quote',
  caption: 'quote',
  script: 'script',
  status: 'status',
  stage: 'status',
  pillar: 'pillar',
  'content pillar': 'pillar',
  platform: 'platforms',
  platforms: 'platforms',
  'target date': 'targetDate',
  'post date': 'targetDate',
  'publish date': 'targetDate',
  date: 'targetDate',
  hot: 'hot',
  'hot content': 'hot',
  notes: 'notes',
  note: 'notes',
}

const STATUS_ALIASES: Record<string, ContentStatus> = {
  draft: 'idea',
  script: 'script_ready',
  record: 'recorded',
  edit: 'edited',
  schedule: 'scheduled',
  posted: 'published',
  done: 'published',
}

function clean(v: string): string {
  return v.toLowerCase().replace(/[\s_-]+/g, ' ').trim()
}

export function normalizeStatus(value: string): ContentStatus | null {
  const v = clean(value)
  if (!v) return null
  for (const s of STATUSES) {
    if (clean(s.id) === v || clean(s.label) === v) return s.id
  }
  return STATUS_ALIASES[v] ?? null
}

export function normalizePlatforms(value: string | string[]): Platform[] {
  const parts = Array.isArray(value) ? value : value.split(/[,;|/]+/)
  const found = new Set<Platform>()
  for (const part of parts) {
    const p = PLATFORMS.find((x) => x.toLowerCase() === part.trim().toLowerCase())
    if (p) found.add(p)
  }
  return [...found]
}

export function normalizeDate(value: string): string {
  const v = value.trim()
  if (!v) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  // Kailangan may 4-digit na taon; kung wala, huhulaan ng Date ang maling taon
  if (!/\b\d{4}\b/.test(v)) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

/** Gawing ContentInput ang kahit anong raw object. Null kung walang silbing laman. */
export function toInput(raw: Record<string, unknown>): ContentInput | null {
  const script = str(raw.script).trim()
  const quote = str(raw.quote).trim()
  let title = str(raw.title).trim()

  if (!title && script) {
    const firstLine = script.split(/\r?\n/)[0].trim()
    title = firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine
  }
  if (!title && quote) title = quote.length > 60 ? `${quote.slice(0, 57)}...` : quote
  if (!title) return null

  const hot =
    raw.hot === true ||
    ['yes', 'y', 'true', '1', 'x', 'hot'].includes(str(raw.hot).trim().toLowerCase())

  const status = normalizeStatus(str(raw.status)) ?? (script ? 'script_ready' : 'idea')

  return {
    title,
    quote,
    script,
    status,
    pillar: str(raw.pillar).trim(),
    platforms: normalizePlatforms(
      Array.isArray(raw.platforms) ? (raw.platforms as string[]) : str(raw.platforms),
    ),
    targetDate: normalizeDate(str(raw.targetDate)),
    notes: str(raw.notes).trim(),
    hot,
  }
}

export interface ImportParse {
  inputs: ContentInput[]
  /** Mga column na nakilala */
  recognized: string[]
  /** Mga column na hindi nakilala at lalaktawan */
  ignored: string[]
  skippedEmpty: number
}

export function parseCsvImport(text: string): ImportParse {
  const rows = parseCsv(text)
  const result: ImportParse = { inputs: [], recognized: [], ignored: [], skippedEmpty: 0 }
  if (rows.length < 2) return result

  const [header, ...body] = rows
  const fieldByIndex = header.map((h) => HEADER_ALIASES[clean(h)])
  result.recognized = header.filter((_, i) => fieldByIndex[i])
  result.ignored = header.filter((h, i) => !fieldByIndex[i] && h.trim() !== '')

  if (result.recognized.length === 0) return result

  for (const r of body) {
    const raw: Record<string, unknown> = {}
    fieldByIndex.forEach((field, i) => {
      if (field && r[i] !== undefined) raw[field] = r[i]
    })
    const input = toInput(raw)
    if (input) result.inputs.push(input)
    else result.skippedEmpty++
  }
  return result
}

export function parseJsonImport(text: string): ImportParse {
  const result: ImportParse = { inputs: [], recognized: [], ignored: [], skippedEmpty: 0 }
  const data: unknown = JSON.parse(text)
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)
      ? (data as { items: unknown[] }).items
      : []
  for (const entry of list) {
    const input =
      entry && typeof entry === 'object' ? toInput(entry as Record<string, unknown>) : null
    if (input) result.inputs.push(input)
    else result.skippedEmpty++
  }
  result.recognized = result.inputs.length ? ['JSON backup'] : []
  return result
}

/** I-convert ang unang sheet ng Excel file sa CSV, tapos gamitin ang existing parser. */
export function parseXlsxImport(buffer: ArrayBuffer): ImportParse {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  if (!sheet) return { inputs: [], recognized: [], ignored: [], skippedEmpty: 0 }
  return parseCsvImport(XLSX.utils.sheet_to_csv(sheet))
}