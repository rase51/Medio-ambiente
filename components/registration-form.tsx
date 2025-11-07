"use client"

import type React from "react"
import { useState } from "react"
import { AvatarSelector } from "./avatar-selector"
import { registerUser } from "@/lib/auth"

interface RegistrationFormProps {
  onUserRegistered: (user: any) => void
  onToggleLogin: () => void
}

export function RegistrationForm({ onUserRegistered, onToggleLogin }: RegistrationFormProps) {
  const [step, setStep] = useState<"nickname" | "password" | "avatar">("nickname")
  const [nickname, setNickname] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<{ type: string; bgColor: string } | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // Agregado estado para mostrar/ocultar contraseña
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false) // Agregado para confirmar

  const handleNicknameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim().length < 3) {
      setError("El nickname debe tener al menos 3 caracteres")
      return
    }
    if (nickname.trim().length > 20) {
      setError("El nickname no debe exceder 20 caracteres")
      return
    }

    setError("")
    setStep("password")
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden")
      return
    }
    setError("")
    setStep("avatar")
  }

  const handleAvatarSelect = (avatar: { type: string; bgColor: string }) => {
    setSelectedAvatar(avatar)
  }

  const handleAvatarConfirm = async () => {
    if (!selectedAvatar) {
      setError("Debes seleccionar un avatar")
      return
    }

    setLoading(true)
    const result = await registerUser(nickname.trim(), password, JSON.stringify(selectedAvatar))

    if (!result.success) {
      setError(result.error || "Error al registrar usuario")
      setLoading(false)
      return
    }

    const newUser = {
      id: Date.now().toString(),
      nickname: nickname.trim(),
      avatar: selectedAvatar,
    }

    onUserRegistered(newUser)
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

          {step === "nickname" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h2>
                <p className="text-white/60">Paso 1: Elige tu nickname</p>
              </div>

              <form onSubmit={handleNicknameSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Tu Nickname</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value)
                      setError("")
                    }}
                    placeholder="Ej: EcoWarrior123"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                    autoFocus
                  />
                  <p className="text-xs text-white/50 mt-1">3-20 caracteres</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
                >
                  Continuar →
                </button>
              </form>
            </div>
          )}

          {step === "password" && (
            <div className="space-y-6">
              <button
                onClick={() => setStep("nickname")}
                className="flex items-center text-white/60 hover:text-white transition text-sm mb-6"
              >
                ← Atrás
              </button>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Crea tu Contraseña</h2>
                <p className="text-white/60">Paso 2: Seguridad de tu cuenta</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                      autoFocus
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

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Confirmar Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(e) => {
                        setPasswordConfirm(e.target.value)
                        setError("")
                      }}
                      placeholder="Repite tu contraseña"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition text-lg"
                    >
                      {showPasswordConfirm ? "👁️" : "🔒"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
                >
                  Continuar →
                </button>
              </form>
            </div>
          )}

          {step === "avatar" && (
            <div className="space-y-6">
              <button
                onClick={() => setStep("password")}
                className="flex items-center text-white/60 hover:text-white transition text-sm mb-6"
              >
                ← Atrás
              </button>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Elige tu Avatar</h2>
                <p className="text-white/60">Paso 3: Personaliza tu imagen</p>
              </div>

              <AvatarSelector selected={selectedAvatar} onSelect={handleAvatarSelect} />

              {selectedAvatar && (
                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <p className="text-emerald-400 text-sm">✓ Avatar seleccionado</p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleAvatarConfirm}
                disabled={!selectedAvatar || loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
              >
                {loading ? "Registrando..." : "¡Comencemos!"}
              </button>
            </div>
          )}

          {step !== "nickname" && (
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                ¿Ya tienes cuenta?{" "}
                <button onClick={onToggleLogin} className="text-emerald-400 hover:text-emerald-300 font-semibold">
                  Inicia sesión
                </button>
              </p>
            </div>
          )}
        </div>

        {step === "nickname" && (
          <div className="text-center mt-6 text-white/40 text-sm">
            <p>¿Ya tienes cuenta?</p>
            <button onClick={onToggleLogin} className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Inicia sesión aquí
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
