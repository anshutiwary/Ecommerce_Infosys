export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-shell" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  )
}
