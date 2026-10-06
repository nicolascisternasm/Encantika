const ESTADO_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  activo: {
    label: 'Activo',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
  },
  borrador: {
    label: 'Borrador',
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.1)',
    border: 'rgba(156,163,175,0.2)',
  },
  archivado: {
    label: 'Archivado',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
  },
}

export default function StatusBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: estado,
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.1)',
    border: 'rgba(156,163,175,0.2)',
  }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs rounded-md font-medium"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.border}` }}
    >
      {config.label}
    </span>
  )
}
