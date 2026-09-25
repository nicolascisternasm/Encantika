const ESTADO_CONFIG: Record<string, { label: string; className: string }> = {
  activo: { label: 'Activo', className: 'bg-green-50 text-green-700 border border-green-200' },
  borrador: { label: 'Borrador', className: 'bg-stone-100 text-stone-600 border border-stone-200' },
  archivado: { label: 'Archivado', className: 'bg-red-50 text-red-600 border border-red-200' },
}

export default function StatusBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: estado,
    className: 'bg-stone-100 text-stone-600 border border-stone-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${config.className}`}>
      {config.label}
    </span>
  )
}
