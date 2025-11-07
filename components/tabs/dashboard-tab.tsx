"use client"

import { useMemo, useState, useEffect } from "react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { updateUserBadge, updateUserWeeklyBadges, updateUserAchievements } from "@/lib/auth"
import { getSharedHabits, getSharedReports } from "@/lib/supabase-community"

interface User {
  id: string
  nickname: string
  habits: any[]
  reports: any[]
  selectedBadge?: string
  weeklyBadges?: number[]
}

const BADGES = [
  {
    id: "first_habit",
    title: "Primer Paso",
    description: "Registra tu primer hábito",
    icon: "🌱",
    condition: (user: User) => (user.habits?.length || 0) >= 1,
  },
  {
    id: "five_habits",
    title: "Eco Constructor",
    description: "Crea 5 hábitos",
    icon: "🏗️",
    condition: (user: User) => (user.habits?.length || 0) >= 5,
  },
  {
    id: "ten_habits",
    title: "Especialista Verde",
    description: "Crea 10 hábitos",
    icon: "🌿",
    condition: (user: User) => (user.habits?.length || 0) >= 10,
  },
  {
    id: "seven_day_streak",
    title: "Semana Completa",
    description: "7 días de racha",
    icon: "🔥",
    condition: (user: User) => {
      const habits = user.habits || []
      const allCompletedDates = new Set<string>()
      habits.forEach((h) => {
        ;(h.completedDates || []).forEach((date) => {
          allCompletedDates.add(date)
        })
      })
      if (allCompletedDates.size === 0) return false
      const sortedDates = Array.from(allCompletedDates).sort().reverse()
      let currentStreak = 0
      const today = new Date().toISOString().split("T")[0]
      let checkDate = today
      for (const date of sortedDates) {
        const currentDateObj = new Date(checkDate)
        const checkDateObj = new Date(date)
        const diffTime = currentDateObj.getTime() - checkDateObj.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 0) {
          currentStreak++
          checkDate = date
        } else {
          break
        }
      }
      return currentStreak >= 7
    },
  },
  {
    id: "thirty_day_streak",
    title: "Mes Completo",
    description: "30 días de racha",
    icon: "⭐",
    condition: (user: User) => {
      const habits = user.habits || []
      const allCompletedDates = new Set<string>()
      habits.forEach((h) => {
        ;(h.completedDates || []).forEach((date) => {
          allCompletedDates.add(date)
        })
      })
      if (allCompletedDates.size === 0) return false
      const sortedDates = Array.from(allCompletedDates).sort().reverse()
      let currentStreak = 0
      const today = new Date().toISOString().split("T")[0]
      let checkDate = today
      for (const date of sortedDates) {
        const currentDateObj = new Date(checkDate)
        const checkDateObj = new Date(date)
        const diffTime = currentDateObj.getTime() - checkDateObj.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays === 0) {
          currentStreak++
          checkDate = date
        } else {
          break
        }
      }
      return currentStreak >= 30
    },
  },
  {
    id: "five_reports",
    title: "Reportero Diligente",
    description: "5 reportes compartidos",
    icon: "📝",
    condition: (user: User) => (user.reports?.length || 0) >= 5,
  },
  {
    id: "ten_reports",
    title: "Reportero Activo",
    description: "10 reportes compartidos",
    icon: "📢",
    condition: (user: User) => (user.reports?.length || 0) >= 10,
  },
  {
    id: "evidence_verifier",
    title: "Verificador de Soluciones",
    description: "Tus evidencias de resolución han sido verificadas 5 veces",
    icon: "✅",
    condition: (user: User) => {
      // Cuenta cuántas veces TUS evidencias de resolución han sido verificadas por otros
      return (user as any).resolutionVerificationCount >= 5
    },
  },
  {
    id: "solution_champion",
    title: "Campeón de Soluciones",
    description: "Tus evidencias de resolución han sido verificadas 20 veces",
    icon: "🌟",
    condition: (user: User) => {
      // Cuenta cuántas veces TUS evidencias de resolución han sido verificadas por otros
      return (user as any).resolutionVerificationCount >= 20
    },
  },
  {
    id: "community_champion",
    title: "Campeón Comunitario",
    description: "20 verificaciones en comunidad",
    icon: "👑",
    condition: (user: User) => {
      const habits = user.habits || []
      const totalVerifications = habits.reduce((sum, h) => sum + (h.verificationCount || 0), 0)
      return totalVerifications >= 20
    },
  },
]

const WEEKLY_CHALLENGES = [
  // Semana 1
  [
    {
      id: "w1_ch1",
      title: "Reciclador del Día",
      description: "Completa al menos 1 hábito verificado",
      target: 1,
      icon: "🎯",
      week: 1,
    },
    {
      id: "w1_ch2",
      title: "Racha de 3",
      description: "Completa 3 acciones verificadas distintas",
      target: 3,
      icon: "🔥",
      week: 1,
    },
    {
      id: "w1_ch3",
      title: "Verificador Comunitario",
      description: "Verifica 5 publicaciones",
      target: 5,
      icon: "✓",
      week: 1,
    },
    {
      id: "w1_ch4",
      title: "Reportero de la Semana",
      description: "Haz 2 reportes verificados",
      target: 2,
      icon: "📊",
      week: 1,
    },
  ],
  // Semana 2
  [
    {
      id: "w2_ch1",
      title: "Eco Guerrero",
      description: "Completa 5 hábitos verificados",
      target: 5,
      icon: "⚔️",
      week: 2,
    },
    {
      id: "w2_ch2",
      title: "Comentarista Activo",
      description: "Deja 10 comentarios en la comunidad",
      target: 10,
      icon: "💬",
      week: 2,
    },
    {
      id: "w2_ch3",
      title: "Racha de Fuego",
      description: "Mantén una racha de 5 días",
      target: 5,
      icon: "🔥",
      week: 2,
    },
    {
      id: "w2_ch4",
      title: "Inspector de Problemas",
      description: "Haz 3 reportes verificados",
      target: 3,
      icon: "🔍",
      week: 2,
    },
  ],
  // Semana 3
  [
    {
      id: "w3_ch1",
      title: "Maestro del Plástico",
      description: "Recicla 10 veces plástico (verificado)",
      target: 10,
      icon: "♻️",
      week: 3,
    },
    {
      id: "w3_ch2",
      title: "Verificador Experto",
      description: "Verifica 15 publicaciones",
      target: 15,
      icon: "✅",
      week: 3,
    },
    {
      id: "w3_ch3",
      title: "Semana Completa",
      description: "Completa 7 hábitos verificados",
      target: 7,
      icon: "📅",
      week: 3,
    },
    {
      id: "w3_ch4",
      title: "Reportero Pro",
      description: "Haz 5 reportes verificados",
      target: 5,
      icon: "📢",
      week: 3,
    },
  ],
  // Semana 4 (rotación: vuelven los retos de la semana 1)
  [
    {
      id: "w4_ch1",
      title: "Reciclador del Día",
      description: "Completa al menos 1 hábito verificado",
      target: 1,
      icon: "🎯",
      week: 4,
    },
    {
      id: "w4_ch2",
      title: "Racha de 3",
      description: "Completa 3 acciones verificadas distintas",
      target: 3,
      icon: "🔥",
      week: 4,
    },
    {
      id: "w4_ch3",
      title: "Verificador Comunitario",
      description: "Verifica 5 publicaciones",
      target: 5,
      icon: "✓",
      week: 4,
    },
    {
      id: "w4_ch4",
      title: "Reportero de la Semana",
      description: "Haz 2 reportes verificados",
      target: 2,
      icon: "📊",
      week: 4,
    },
  ],
]

export function DashboardTab({ user }: { user: User }) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  const [selectedBadge, setSelectedBadge] = useState<string | null>(currentUser.selectedBadge || null)
  const [weeklyBadges, setWeeklyBadges] = useState<number[]>(currentUser.weeklyBadges || [])
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>(currentUser.unlockedAchievements || [])
  const [activeReportsCount, setActiveReportsCount] = useState(0)
  const [verifiedHabitsReports, setVerifiedHabitsReports] = useState<any[]>([])
  const [resolutionVerificationCount, setResolutionVerificationCount] = useState(0)

  useEffect(() => {
    const loadCommunityData = async () => {
      const [habits, reports] = await Promise.all([getSharedHabits(), getSharedReports()])

      const activeReports = reports.filter((r: any) => !r.resolved)
      setActiveReportsCount(activeReports.length)

      const userVerifiedItems = [
        ...habits.filter((h: any) => h.user_id === user.id && (h.verifiedBy?.length || 0) >= 3),
        ...reports.filter((r: any) => r.user_id === user.id && (r.verifiedBy?.length || 0) >= 3),
      ]
      setVerifiedHabitsReports(userVerifiedItems)

      let resolutionVerificationTotal = 0
      reports.forEach((r: any) => {
        if (r.resolution_evidences && Array.isArray(r.resolution_evidences)) {
          r.resolution_evidences.forEach((ev: any) => {
            // Solo contar si la evidencia fue subida por el usuario actual
            if (ev.user === user.nickname) {
              resolutionVerificationTotal += (ev.checks || []).length
            }
          })
        }
      })
      setResolutionVerificationCount(resolutionVerificationTotal)
    }

    loadCommunityData()
    const interval = setInterval(loadCommunityData, 5000)
    return () => clearInterval(interval)
  }, [user.id, user.nickname])

  useEffect(() => {
    const userWithVerifications = {
      ...user,
      resolutionVerificationCount,
    }

    const newlyUnlockedBadges = BADGES.filter(
      (badge) => badge.condition(userWithVerifications) && !unlockedAchievementIds.includes(badge.id),
    )

    if (newlyUnlockedBadges.length > 0) {
      const updatedUnlocked = [...unlockedAchievementIds, ...newlyUnlockedBadges.map((b) => b.id)]
      setUnlockedAchievementIds(updatedUnlocked)
      updateUserAchievements(user.id, updatedUnlocked)

      const updatedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
      updatedUser.unlockedAchievements = updatedUnlocked
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    }
  }, [user, unlockedAchievementIds, resolutionVerificationCount])

  const unlockedBadges = useMemo(() => {
    return BADGES.filter((badge) => unlockedAchievementIds.includes(badge.id))
  }, [unlockedAchievementIds])

  const calculateCurrentStreak = () => {
    if (verifiedHabitsReports.length === 0) return 0

    const allCompletedDates = new Set<string>()
    verifiedHabitsReports.forEach((item) => {
      const dateStr = new Date(item.created_at).toISOString().split("T")[0]
      allCompletedDates.add(dateStr)
    })

    if (allCompletedDates.size === 0) return 0

    const sortedDates = Array.from(allCompletedDates).sort().reverse()
    let currentStreak = 0
    const today = new Date().toISOString().split("T")[0]
    let checkDate = today

    for (const date of sortedDates) {
      const currentDateObj = new Date(checkDate)
      const checkDateObj = new Date(date)
      const diffTime = currentDateObj.getTime() - checkDateObj.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        currentStreak++
        const nextDay = new Date(checkDateObj)
        nextDay.setDate(nextDay.getDate() - 1)
        checkDate = nextDay.toISOString().split("T")[0]
      } else {
        break
      }
    }

    return currentStreak
  }

  const calculateWeeklyProgress = () => {
    if (verifiedHabitsReports.length === 0) return 0

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    let weeklyCount = 0
    verifiedHabitsReports.forEach((item) => {
      const date = new Date(item.created_at)
      if (date >= weekStart && date <= today) {
        weeklyCount++
      }
    })

    return weeklyCount
  }

  useEffect(() => {
    const weeklyProgress = calculateWeeklyProgress()
    const weeklyTarget = 15

    if (weeklyProgress >= weeklyTarget) {
      const existingWeeklyBadges = user.weeklyBadges || []
      const weekNumber = existingWeeklyBadges.length + 1

      if (!existingWeeklyBadges.includes(weekNumber)) {
        const updatedWeeklyBadges = [...existingWeeklyBadges, weekNumber]
        updateUserWeeklyBadges(user.id, updatedWeeklyBadges)
        setWeeklyBadges(updatedWeeklyBadges)
      } else {
        setWeeklyBadges(existingWeeklyBadges)
      }
    } else {
      setWeeklyBadges(user.weeklyBadges || [])
    }
  }, [user.habits, user.id, user.weeklyBadges])

  const getCurrentWeekIndex = () => {
    const startDate = new Date("2025-01-01") // Fecha de inicio de la plataforma (semana 1)
    const today = new Date()
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const weekNumber = Math.floor(diffDays / 7)
    return weekNumber % 4 // Rotación cada 4 semanas
  }

  const currentWeekChallenges = WEEKLY_CHALLENGES[getCurrentWeekIndex()]

  const checkWeeklyChallengeCompletion = (challengeId: string, target: number) => {
    const habits = verifiedHabitsReports.filter((item) => !item.location)
    const reports = verifiedHabitsReports.filter((item) => item.location)

    let totalVerifications = 0
    const communityData = JSON.parse(localStorage.getItem("residuos_community") || '{"habits":[],"reports":[]}')
    communityData.habits.forEach((h: any) => {
      if (h.verifiedBy?.includes(user.id)) totalVerifications++
    })
    communityData.reports.forEach((r: any) => {
      if (r.verifiedBy?.includes(user.id)) totalVerifications++
    })

    let totalComments = 0
    communityData.habits.forEach((h: any) => {
      totalComments += (h.comments || []).filter((c: any) => c.userId === user.id).length
    })
    communityData.reports.forEach((r: any) => {
      totalComments += (r.comments || []).filter((c: any) => c.userId === user.id).length
    })

    if (challengeId.includes("ch1") && challengeId.includes("w1")) return habits.length >= target
    if (challengeId.includes("ch2") && challengeId.includes("w1")) return habits.length >= target
    if (challengeId.includes("ch3") && challengeId.includes("w1")) return totalVerifications >= target
    if (challengeId.includes("ch4") && challengeId.includes("w1")) return reports.length >= target

    if (challengeId.includes("ch1") && challengeId.includes("w2")) return habits.length >= target
    if (challengeId.includes("ch2") && challengeId.includes("w2")) return totalComments >= target
    if (challengeId.includes("ch3") && challengeId.includes("w2")) return calculateCurrentStreak() >= target
    if (challengeId.includes("ch4") && challengeId.includes("w2")) return reports.length >= target

    if (challengeId.includes("ch1") && challengeId.includes("w3")) return habits.length >= target
    if (challengeId.includes("ch2") && challengeId.includes("w3")) return totalVerifications >= target
    if (challengeId.includes("ch3") && challengeId.includes("w3")) return habits.length >= target
    if (challengeId.includes("ch4") && challengeId.includes("w3")) return reports.length >= target

    if (challengeId.includes("ch1") && challengeId.includes("w4")) return habits.length >= target
    if (challengeId.includes("ch2") && challengeId.includes("w4")) return habits.length >= target
    if (challengeId.includes("ch3") && challengeId.includes("w4")) return totalVerifications >= target
    if (challengeId.includes("ch4") && challengeId.includes("w4")) return reports.length >= target

    return false
  }

  const getChallengeProgress = (challengeId: string, target: number) => {
    const habits = verifiedHabitsReports.filter((item) => !item.location)
    const reports = verifiedHabitsReports.filter((item) => item.location)

    let totalVerifications = 0
    const communityData = JSON.parse(localStorage.getItem("residuos_community") || '{"habits":[],"reports":[]}')
    communityData.habits.forEach((h: any) => {
      if (h.verifiedBy?.includes(user.id)) totalVerifications++
    })
    communityData.reports.forEach((r: any) => {
      if (r.verifiedBy?.includes(user.id)) totalVerifications++
    })

    let totalComments = 0
    communityData.habits.forEach((h: any) => {
      totalComments += (h.comments || []).filter((c: any) => c.userId === user.id).length
    })
    communityData.reports.forEach((r: any) => {
      totalComments += (r.comments || []).filter((c: any) => c.userId === user.id).length
    })

    if (challengeId.includes("ch1") && (challengeId.includes("w1") || challengeId.includes("w4")))
      return Math.min(habits.length, target)
    if (challengeId.includes("ch2") && (challengeId.includes("w1") || challengeId.includes("w4")))
      return Math.min(habits.length, target)
    if (challengeId.includes("ch3") && (challengeId.includes("w1") || challengeId.includes("w4")))
      return Math.min(totalVerifications, target)
    if (challengeId.includes("ch4") && (challengeId.includes("w1") || challengeId.includes("w4")))
      return Math.min(reports.length, target)

    if (challengeId.includes("ch1") && challengeId.includes("w2")) return Math.min(habits.length, target)
    if (challengeId.includes("ch2") && challengeId.includes("w2")) return Math.min(totalComments, target)
    if (challengeId.includes("ch3") && challengeId.includes("w2")) return Math.min(calculateCurrentStreak(), target)
    if (challengeId.includes("ch4") && challengeId.includes("w2")) return Math.min(reports.length, target)

    if (challengeId.includes("ch1") && challengeId.includes("w3")) return Math.min(habits.length, target)
    if (challengeId.includes("ch2") && challengeId.includes("w3")) return Math.min(totalVerifications, target)
    if (challengeId.includes("ch3") && challengeId.includes("w3")) return Math.min(habits.length, target)
    if (challengeId.includes("ch4") && challengeId.includes("w3")) return Math.min(reports.length, target)

    return 0
  }

  const handleSelectBadge = (badgeId: string) => {
    setSelectedBadge(badgeId)
    updateUserBadge(user.id, badgeId)

    const updatedUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    updatedUser.selectedBadge = badgeId
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-lg border border-emerald-500/30 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">¡Hola, {user.nickname}! 👋</h2>
        <p className="text-white/70 text-sm">
          Sigue completando hábitos y contribuyendo a un planeta más limpio. ¡Cada acción cuenta!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/60 text-xs mb-2">RACHA ACTUAL</p>
          <p className="text-4xl font-bold text-emerald-400">{calculateCurrentStreak()}</p>
          <p className="text-white/50 text-xs mt-1">días consecutivos 🔥</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/60 text-xs mb-2">TOTAL HÁBITOS</p>
          <p className="text-4xl font-bold text-cyan-400">{user.habits?.length || 0}</p>
          <p className="text-white/50 text-xs mt-1">creados</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/60 text-xs mb-2">REPORTES ACTIVOS</p>
          <p className="text-4xl font-bold text-orange-400">{activeReportsCount}</p>
          <p className="text-white/50 text-xs mt-1">sin resolver</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 text-center">Progreso Semanal</h3>
        <div className="flex flex-col items-center justify-center">
          <div style={{ width: 200, height: 200 }} className="mx-auto">
            <CircularProgressbar
              value={Math.min((calculateWeeklyProgress() / 15) * 100, 100)}
              styles={buildStyles({
                rotation: 0,
                strokeLinecap: "round",
                pathTransitionDuration: 0.5,
                pathColor: `rgba(16, 185, 129, ${0.6 + Math.min(calculateWeeklyProgress() / 15, 1) * 0.4})`,
                textColor: "transparent",
                trailColor: "rgba(255, 255, 255, 0.15)",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
              })}
              strokeWidth={16}
            />
          </div>
          <p className="text-5xl font-bold text-white mt-6">{calculateWeeklyProgress()}/15</p>
          <p className="text-white/70 text-sm mt-2 text-center">Acciones verificadas esta semana</p>
          {weeklyBadges.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap justify-center">
              {weeklyBadges.map((weekNum) => (
                <div
                  key={weekNum}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/20 border border-purple-400/50 rounded-full text-white text-xs font-bold"
                >
                  🏆 Semana {weekNum}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">🎯 Retos Semanales</h3>
        <div className="space-y-3">
          {currentWeekChallenges.map((challenge) => {
            const isCompleted = checkWeeklyChallengeCompletion(challenge.id, challenge.target)
            const currentProgress = getChallengeProgress(challenge.id, challenge.target)
            const remaining = Math.max(0, challenge.target - currentProgress)

            return (
              <div
                key={challenge.id}
                className={`border rounded-lg p-3 flex items-center gap-3 transition ${
                  isCompleted ? "bg-emerald-500/20 border-emerald-500/50" : "bg-white/5 border-white/10"
                }`}
              >
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{challenge.title}</p>
                  <p className="text-white/60 text-xs">{challenge.description}</p>
                </div>
                <div className="text-right">
                  {isCompleted ? (
                    <p className="text-emerald-400 font-bold text-sm">✓ Completado</p>
                  ) : (
                    <>
                      <p className="text-emerald-400 font-bold text-lg">{remaining}</p>
                      <p className="text-white/40 text-xs">restantes</p>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2">Insignias y Logros</h3>
          <p className="text-white/60 text-sm">
            {selectedBadge
              ? "Insignia seleccionada para mostrar en comunidad ✓"
              : "Selecciona una insignia para presumir en la comunidad"}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {weeklyBadges.map((weekNum) => {
            const badgeId = `weekly_${weekNum}`
            const isSelected = selectedBadge === badgeId
            return (
              <button
                key={badgeId}
                onClick={() => handleSelectBadge(badgeId)}
                className={`flex flex-col items-center p-4 rounded-xl border transition transform ${
                  isSelected
                    ? "bg-gradient-to-br from-purple-500/30 to-pink-500/20 border-purple-400 scale-105 ring-2 ring-purple-400"
                    : "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30 hover:scale-105 cursor-pointer"
                }`}
              >
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-xs font-semibold text-white text-center mb-1">Semana {weekNum}</p>
                <p className="text-xs text-white/60 text-center mb-2">Progreso semanal completado</p>
                {isSelected && <p className="text-xs text-purple-400 font-bold">En comunidad</p>}
                {!isSelected && <p className="text-xs text-amber-400">✓ Desbloqueado</p>}
              </button>
            )
          })}
          {BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.some((b) => b.id === badge.id)
            const isSelected = selectedBadge === badge.id
            return (
              <button
                key={badge.id}
                onClick={() => isUnlocked && handleSelectBadge(badge.id)}
                disabled={!isUnlocked}
                className={`flex flex-col items-center p-4 rounded-xl border transition transform ${
                  isSelected
                    ? "bg-gradient-to-br from-purple-500/30 to-pink-500/20 border-purple-400 scale-105 ring-2 ring-purple-400"
                    : isUnlocked
                      ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30 hover:scale-105 cursor-pointer"
                      : "bg-white/5 border-white/10 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className={`text-4xl mb-2 transition ${isUnlocked ? "scale-100" : "grayscale"}`}>{badge.icon}</div>
                <p className="text-xs font-semibold text-white text-center mb-1">{badge.title}</p>
                <p className="text-xs text-white/60 text-center mb-2">{badge.description}</p>
                {isSelected && <p className="text-xs text-purple-400 font-bold">En comunidad</p>}
                {isUnlocked && !isSelected && <p className="text-xs text-amber-400">✓ Desbloqueado</p>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
