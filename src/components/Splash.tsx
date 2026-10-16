export default function Splash({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="splash" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  )
}
