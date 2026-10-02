import type { ContentStatus } from '../types/content'
import { STATUS_MAP } from '../constants/workflow'

export default function StatusBadge({ status }: { status: ContentStatus }) {
  const meta = STATUS_MAP[status]
  return (
    <span className="badge" data-status={status}>
      <span className="badge-dot" aria-hidden="true" />
      {meta.label}
    </span>
  )
}
