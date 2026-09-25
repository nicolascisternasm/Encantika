import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-2">
            Panel de administración
          </p>
          <h1 className="text-3xl font-light tracking-widest text-stone-800">
            encantika
          </h1>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
