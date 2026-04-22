import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AlertCircle, Stethoscope, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate(user.tipo_acesso === 'medico' ? '/medico/dashboard' : '/', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    if (err) {
      if (err.status === 0) setError('Erro de conexão. Verifique sua internet.')
      else if (err.status === 400) setError('Email ou senha incorretos')
      else if (err.message?.includes('inactive'))
        setError('Sua conta foi desativada. Contate o administrador.')
      else setError('Erro ao entrar. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-[#f0dfd5] to-[#94f2f0] opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-[#05807f] to-[#94f2f0] opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#05807f] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#05807f]/20">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display text-[#191c1e]">Clinica Pass</h1>
          <p className="text-sm text-[#6e7979] mt-1">Sistema de Gestão Clínica</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e6e8ea] shadow-[0_8px_32px_rgba(5,128,127,0.08)] p-8">
          <h2 className="text-xl font-bold font-display text-[#191c1e] mb-1">Bem-vindo(a)!</h2>
          <p className="text-sm text-[#6e7979] mb-6">Acesse sua conta para continuar</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#191c1e] mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#e6e8ea] rounded-xl text-[#191c1e] placeholder:text-[#6e7979]
                  focus:outline-none focus:ring-2 focus:ring-[#05807f]/25 focus:border-[#05807f]
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#191c1e] mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-[#e6e8ea] rounded-xl text-[#191c1e] placeholder:text-[#6e7979]
                    focus:outline-none focus:ring-2 focus:ring-[#05807f]/25 focus:border-[#05807f]
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6e7979] hover:text-[#05807f] transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#05807f] hover:bg-[#006564] disabled:opacity-60 disabled:cursor-not-allowed
                text-white font-semibold text-sm py-2.5 rounded-xl transition-all duration-200
                shadow-sm shadow-[#05807f]/20 hover:shadow-md hover:shadow-[#05807f]/30 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#6e7979] mt-6">
          © {new Date().getFullYear()} Clinica Pass · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
