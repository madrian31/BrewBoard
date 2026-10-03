import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { createEmptyInput, STATUSES } from '../../constants/workflow'
import type { ContentStatus } from '../../types/content'
import { isValidISODate } from '../../utils/date'
import ContentForm from './ContentForm'

export default function EditorPage() {
  const { id } = useParams()
  const { getContent } = useContent()
  const [params] = useSearchParams()
  const location = useLocation()

  const from = (location.state as { from?: unknown } | null)?.from
  const returnTo = typeof from === 'string' && from.startsWith('/') ? from : '/library'

  const existing = id ? getContent(id) : undefined

  if (id && !existing) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Content not found</h1>
          <p className="page-sub">It may have been deleted.</p>
        </header>
        <Link to="/library" className="btn">
          Back to Library
        </Link>
      </div>
    )
  }

  const date = params.get('date')
  const statusParam = params.get('status')
  const prefillStatus = STATUSES.find((s) => s.id === statusParam)?.id as ContentStatus | undefined
  const initial = existing
    ? {
        title: existing.title,
        quote: existing.quote,
        script: existing.script,
        status: existing.status,
        pillar: existing.pillar,
        platforms: existing.platforms,
        targetDate: existing.targetDate,
        notes: existing.notes,
        hot: existing.hot ?? false,
        caption: existing.caption ?? '',
        hashtags: existing.hashtags ?? '',
      }
    : {
        ...createEmptyInput(),
        targetDate: isValidISODate(date) ? date : '',
        hot: false,
        caption: '',
        hashtags: '',
        ...(prefillStatus ? { status: prefillStatus } : {}),
      }

  return <ContentForm key={id ?? 'new'} id={id} initial={initial} returnTo={returnTo} />
}