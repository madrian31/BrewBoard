export default function Splash({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="splash" role="status">
      {label}
    </div>
  )
}
