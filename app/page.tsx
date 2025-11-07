"use client"

import { useEffect, useState } from "react"
import { Dashboard } from "@/components/dashboard"
import { RegistrationForm } from "@/components/registration-form"
import { LoginForm } from "@/components/login-form"
import { getCurrentUser, logoutUser } from "@/lib/auth"
import { IntroScreen } from "@/components/intro-screen"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setShowIntro(false)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-emerald-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (showIntro && !user) {
    return <IntroScreen onStart={() => setShowIntro(false)} />
  }

  if (!user) {
    return (
      <div>
        {showLogin ? (
          <LoginForm onUserLogged={setUser} onToggleRegister={() => setShowLogin(false)} />
        ) : (
          <RegistrationForm onUserRegistered={setUser} onToggleLogin={() => setShowLogin(true)} />
        )}
      </div>
    )
  }

  return (
    <Dashboard
      user={user}
      onLogout={() => {
        logoutUser()
        setUser(null)
      }}
    />
  )
}
