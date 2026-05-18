export default function StatusBadge({ label, variant = 'default' }) {
  return <span className={`status-badge ${variant}`}>{label}</span>
}
