import { Suspense } from 'react'
import LoginForm from './LoginForm'
import { Gem } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#0f1117' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12"
        style={{ background: '#111827', borderRight: '1px solid #1f2937' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Gem size={18} color="white" />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: '#f9fafb' }}>ENCANTIKA ERP</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4" style={{ color: '#f9fafb' }}>
            Gestiona tu tienda<br />
            <span style={{ color: '#818cf8' }}>de forma inteligente.</span>
          </h2>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Productos, inventario, pedidos y clientes en un solo lugar.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { label: 'Catálogo', desc: 'Productos y variantes' },
              { label: 'Inventario', desc: 'Stock en tiempo real' },
              { label: 'Pedidos', desc: 'Gestión de ventas' },
              { label: 'Clientes', desc: 'Datos y consultas' },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-lg p-4"
                style={{ background: '#1f2937', border: '1px solid #374151' }}
              >
                <p className="text-xs font-semibold" style={{ color: '#e5e7eb' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: '#374151' }}>© {new Date().getFullYear()} Encantika · Panel Admin</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Gem size={15} color="white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: '#f9fafb' }}>ENCANTIKA</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: '#f9fafb' }}>Iniciar sesión</h1>
            <p className="mt-1 text-sm" style={{ color: '#6b7280' }}>Ingresa a tu cuenta de administrador</p>
          </div>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
