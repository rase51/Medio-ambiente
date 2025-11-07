"use client"

import type React from "react"
import { useState } from "react"
import { loginUser } from "@/lib/auth"

interface LoginFormProps {
  onUserLogged: (user: any) => void
  onToggleRegister: () => void
}

export function LoginForm({ onUserLogged, onToggleRegister }: LoginFormProps) {
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Agregado estado para mostrar/ocultar contraseña

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    const result = await loginUser(nickname, password)

    if (!result.success || !result.user) {
      setError(result.error || "Error en el login")
      setLoading(false)
      return
    }

    onUserLogged(result.user)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              ♻️ Residuos
            </h1>
            <p className="text-white/60">Reduce • Reutiliza • Recicla</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Inicia Sesión</h2>
            <p className="text-white/60">Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value)
                  setError("")
                }}
                placeholder="Tu nickname"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Tu contraseña"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition text-lg"
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              ¿No tienes cuenta?{" "}
              <button onClick={onToggleRegister} className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
