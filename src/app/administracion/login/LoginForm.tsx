'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'login' | 'recovery-email' | 'recovery-verify'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    searchParams.get('error') === 'unauthorized'
      ? 'No tienes permisos de administrador.'
      : null,
  )
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const inputStyle = {
    background: '#1f2937',
    border: '1px solid #374151',
    color: '#f9fafb',
    borderRadius: '8px',
  }

  function resetRecovery() {
    setStep('login')
    setError(null)
    setSuccessMsg(null)
    setCode('')
    setNewPassword('')
    setConfirmPassword('')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!perfil || (perfil.rol !== 'propietario' && perfil.rol !== 'colaborador')) {
        await supabase.auth.signOut()
        setError('No tienes permisos de administrador.')
        setLoading(false)
        return
      }
    }

    router.push('/administracion')
    router.refresh()
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: recError } = await supabase.auth.resetPasswordForEmail(email)

    setLoading(false)
    if (recError) {
      setError('No se pudo enviar el correo. Intenta de nuevo.')
    } else {
      setStep('recovery-verify')
    }
  }

  async function handleVerifyAndUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'recovery',
    })

    if (verifyError) {
      setError('Código inválido o expirado. Solicita uno nuevo.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    setLoading(false)
    if (updateError) {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.')
    } else {
      setSuccessMsg('¡Contraseña actualizada! Ya puedes iniciar sesión.')
      setTimeout(() => resetRecovery(), 2500)
    }
  }

  // --- Paso 1: Ingresar correo para recibir código ---
  if (step === 'recovery-email') {
    return (
      <form onSubmit={handleSendCode} className="space-y-5">
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.
        </p>

        <div>
          <label htmlFor="email-rec" className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
            Correo electrónico
          </label>
          <input
            id="email-rec"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            placeholder="hola@encantika.cl"
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#374151')}
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#6366f1', color: 'white' }}
        >
          {loading ? 'Enviando…' : 'Enviar código'}
        </button>

        <button type="button" onClick={resetRecovery} className="w-full py-2 text-xs" style={{ color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          ← Volver al inicio de sesión
        </button>
      </form>
    )
  }

  // --- Paso 2: Ingresar código y nueva contraseña ---
  if (step === 'recovery-verify') {
    return (
      <form onSubmit={handleVerifyAndUpdate} className="space-y-5">
        <p className="text-sm" style={{ color: '#9ca3af' }}>
          Revisa tu correo <span style={{ color: '#f9fafb' }}>{email}</span> e ingresa el código que recibiste.
        </p>

        <div>
          <label htmlFor="code" className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
            Código de verificación
          </label>
          <input
            id="code"
            type="text"
            required
            inputMode="numeric"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none transition-colors tracking-widest"
            style={{ ...inputStyle, letterSpacing: '0.2em' }}
            placeholder="000000"
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#374151')}
          />
        </div>

        <div>
          <label htmlFor="new-password" className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
            Nueva contraseña
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            placeholder="Mínimo 8 caracteres"
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#374151')}
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
            Confirmar contraseña
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#374151')}
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
            {successMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!successMsg}
          className="w-full py-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#6366f1', color: 'white' }}
        >
          {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
        </button>

        <button type="button" onClick={() => { setStep('recovery-email'); setError(null); setCode('') }} className="w-full py-2 text-xs" style={{ color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          ← Reenviar código
        </button>
      </form>
    )
  }

  // --- Formulario de login normal ---
  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 text-sm focus:outline-none transition-colors placeholder:text-opacity-30"
          style={{ ...inputStyle, '--tw-placeholder-opacity': '0.3' } as React.CSSProperties}
          placeholder="hola@encantika.cl"
          onFocus={e => (e.target.style.borderColor = '#6366f1')}
          onBlur={e => (e.target.style.borderColor = '#374151')}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium mb-2" style={{ color: '#9ca3af' }}>
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-sm focus:outline-none transition-colors"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = '#6366f1')}
          onBlur={e => (e.target.style.borderColor = '#374151')}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => { setStep('recovery-email'); setError(null) }}
            className="text-xs transition-colors"
            style={{ color: '#6b7280', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = '#a5b4fc')}
            onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = '#6b7280')}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: '#6366f1', color: 'white' }}
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
