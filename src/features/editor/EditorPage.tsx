import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useContent } from '../content/useContent'
import { createEmptyInput } from '../../constants/workflow'
import { isValidISODate } from '../../utils/date'
import ContentForm from './ContentForm'

export default function EditorPage() {
  const { id } = useParams()
  const { getContent } = useContent()
  const [params] = useSearchParams()

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
      }
    : { ...createEmptyInput(), targetDate: isValidISODate(date) ? date : '' }

  // `key` para mag-reset ang form kapag lumipat sa ibang content
  return <ContentForm key={id ?? 'new'} id={id} initial={initial} />
}
