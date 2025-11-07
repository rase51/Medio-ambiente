"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  getSharedHabits,
  getSharedReports,
  addCheckToHabit,
  addCheckToReport,
  addCommentToReport,
  addResolutionEvidence,
  addCheckToResolutionEvidence,
  uploadCommunityImage,
} from "@/lib/supabase-community"

interface User {
  id: string
  nickname: string
  avatar: { type: string; bgColor: string }
}

export function CommunityTab({ user }: { user: User }) {
  const [habits, setHabits] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [commentModals, setCommentModals] = useState<{ [key: string]: boolean }>({})
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({})
  const [evidenceModals, setEvidenceModals] = useState<{ [key: string]: boolean }>({})
  const [evidenceData, setEvidenceData] = useState<{ [key: string]: { image: File | null; description: string } }>({})
  const [fullImageModal, setFullImageModal] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
  const userSelectedBadge = currentUser.selectedBadge || null

  const ALL_BADGES = [
    { id: "first_habit", icon: "🌱" },
    { id: "five_habits", icon: "🏗️" },
    { id: "ten_habits", icon: "🌿" },
    { id: "seven_day_streak", icon: "🔥" },
    { id: "thirty_day_streak", icon: "⭐" },
    { id: "five_reports", icon: "📝" },
    { id: "ten_reports", icon: "📢" },
    { id: "thirty_days_active", icon: "🏆" },
    { id: "master_recycler", icon: "♻️" },
    { id: "community_champion", icon: "👑" },
  ]

  useEffect(() => {
    const loadCommunityData = async () => {
      const [habitsData, reportsData] = await Promise.all([getSharedHabits(), getSharedReports()])
      setHabits(habitsData)

      const activeReports = reportsData.filter((report: any) => {
        if (!report.resolution_evidences || report.resolution_evidences.length === 0) return true
        // Si alguna evidencia tiene 3+ checks, el reporte debería estar eliminado
        const hasResolvedEvidence = report.resolution_evidences.some((ev: any) => ev.checks.length >= 3)
        return !hasResolvedEvidence
      })

      setReports(activeReports)
    }

    loadCommunityData()
    const interval = setInterval(loadCommunityData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleVerifyHabit = async (habitId: string) => {
    const success = await addCheckToHabit(habitId, user.nickname)
    if (success) {
      const habitsData = await getSharedHabits()
      setHabits(habitsData)
    }
  }

  const handleVerifyReport = async (reportId: string) => {
    const success = await addCheckToReport(reportId, user.nickname)
    if (success) {
      const reportsData = await getSharedReports()
      setReports(reportsData)
    }
  }

  const handleAddComment = async (reportId: string) => {
    const text = commentTexts[reportId]
    if (text && text.trim()) {
      const success = await addCommentToReport(reportId, {
        user: user.nickname,
        text,
        timestamp: new Date().toISOString(),
      })
      if (success) {
        const reportsData = await getSharedReports()
        setReports(reportsData)
        setCommentTexts({ ...commentTexts, [reportId]: "" })
        setCommentModals({ ...commentModals, [reportId]: false })
      }
    }
  }

  const handleAddCommentToHabit = async (habitId: string) => {
    const text = commentTexts[habitId]
    if (text && text.trim()) {
      // Assuming there is a function addCommentToHabit in supabase-community
      const success = await addCommentToReport(habitId, {
        user: user.nickname,
        text,
        timestamp: new Date().toISOString(),
      })
      if (success) {
        const habitsData = await getSharedHabits()
        setHabits(habitsData)
        setCommentTexts({ ...commentTexts, [habitId]: "" })
        setCommentModals({ ...commentModals, [habitId]: false })
      }
    }
  }

  const handleAddEvidenceToReport = async (reportId: string) => {
    const evidence = evidenceData[reportId]
    if (!evidence?.image) {
      alert("Por favor sube una imagen")
      return
    }

    setLoading(true)
    try {
      const imageUrl = await uploadCommunityImage(evidence.image)
      if (!imageUrl) {
        alert("Error al subir la imagen")
        setLoading(false)
        return
      }

      const success = await addResolutionEvidence(reportId, {
        user: user.nickname,
        image_url: imageUrl,
        description: evidence.description,
        checks: [],
        timestamp: new Date().toISOString(),
      })

      if (success) {
        const reportsData = await getSharedReports()
        setReports(reportsData)
        setEvidenceData({ ...evidenceData, [reportId]: { image: null, description: "" } })
        setEvidenceModals({ ...evidenceModals, [reportId]: false })
      }
    } catch (error) {
      console.error("[v0] Error adding evidence:", error)
      alert("Error al subir evidencia")
    }
    setLoading(false)
  }

  const handleVerifyEvidence = async (reportId: string, evidenceIndex: number) => {
    const success = await addCheckToResolutionEvidence(reportId, evidenceIndex, user.nickname)
    if (success) {
      const reportsData = await getSharedReports()
      setReports(reportsData)
    }
  }

  const handleEvidenceImageChange = (e: React.ChangeEvent<HTMLInputElement>, reportId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10000000) {
        alert("La imagen es demasiado grande. Por favor usa una imagen menor a 10MB")
        return
      }
      setEvidenceData({
        ...evidenceData,
        [reportId]: { ...evidenceData[reportId], image: file },
      })
    }
  }

  const allItems = [
    ...habits.map((h: any) => ({ ...h, type: "habit", date: new Date(h.created_at) })),
    ...reports.map((r: any) => ({ ...r, type: "report", date: new Date(r.created_at) })),
  ].sort((a: any, b: any) => b.date.getTime() - a.date.getTime())

  const uniqueUserIds = new Set<string>()
  habits.forEach((h: any) => uniqueUserIds.add(h.user_id))
  reports.forEach((r: any) => uniqueUserIds.add(r.user_id))
  const activeMembers = uniqueUserIds.size

  const totalVerifications =
    habits.reduce((sum: number, h: any) => sum + h.checks.length, 0) +
    reports.reduce((sum: number, r: any) => sum + r.checks.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-lg border border-emerald-500/30 rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-white mb-2">🌍 Comunidad Global</h1>
        <p className="text-white/70">
          Feed unificado con hábitos y reportes compartidos. Verifica, comenta y colabora.
        </p>
      </div>

      {/* Stats - sin Miembros Activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/60 text-sm mb-1">Publicaciones</p>
          <p className="text-3xl font-bold text-emerald-400">{allItems.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/60 text-sm mb-1">Verificaciones</p>
          <p className="text-3xl font-bold text-yellow-400">{totalVerifications}</p>
        </div>
      </div>

      {/* Community Feed */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">📰 Feed Comunitario</h2>

        {allItems.length > 0 ? (
          <div className="space-y-4">
            {allItems.map((item: any) => {
              const itemId = item.id
              const isHabit = item.type === "habit"
              const userHasVerified = isHabit
                ? item.checks.includes(user.nickname)
                : item.checks.includes(user.nickname)

              let posterBadge = null
              let badgeIcon = "⭐"
              if (item.user_id === currentUser.id && userSelectedBadge) {
                posterBadge = userSelectedBadge
                // Si es insignia semanal, usar trofeo
                if (posterBadge.startsWith("weekly_")) {
                  badgeIcon = "🏆"
                } else {
                  // Buscar el ícono del logro específico
                  const badge = ALL_BADGES.find((b) => b.id === posterBadge)
                  badgeIcon = badge?.icon || "⭐"
                }
              }

              return (
                <div
                  key={`${item.type}-${itemId}`}
                  className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-6 transition"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                          style={{ backgroundColor: item.user_avatar?.bgColor || "#10b981" }}
                        >
                          {item.user_avatar?.type === "alien" && "👽"}
                          {item.user_avatar?.type === "robot" && "🤖"}
                          {item.user_avatar?.type === "monster" && "👹"}
                          {item.user_avatar?.type === "animal" && "🐻"}
                        </div>
                        {posterBadge && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs border-2 border-slate-900">
                            {badgeIcon}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{item.user_nickname}</p>
                        <p className="text-xs text-white/50">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isHabit
                          ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                          : "bg-blue-500/20 border border-blue-500/50 text-blue-400"
                      }`}
                    >
                      {isHabit ? "🌱 Hábito" : "📢 Reporte"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {isHabit ? item.description : item.description || "Problema reportado"}
                    </h3>
                    {!isHabit && item.location && (
                      <p className="text-sm text-white/70 mb-2">
                        📍 <span className="font-medium">{item.location}</span>
                      </p>
                    )}
                    {item.description && !isHabit && <p className="text-white/80 mb-3">{item.description}</p>}
                    {item.image_url && (
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={isHabit ? "habit evidence" : "report"}
                        className="w-full max-h-80 object-cover rounded-lg border border-white/10 mb-3 cursor-pointer hover:opacity-90 transition"
                        onClick={() => setFullImageModal(item.image_url)}
                      />
                    )}
                  </div>

                  {/* Resolution Evidences for Reports */}
                  {!isHabit && item.resolution_evidences && item.resolution_evidences.length > 0 && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4">
                      <p className="text-sm font-semibold text-emerald-400 mb-3">✅ Evidencias de Resolución</p>
                      <div className="space-y-3">
                        {item.resolution_evidences.map((ev: any, idx: number) => (
                          <div key={idx} className="bg-white/5 rounded-lg overflow-hidden border border-white/10">
                            <img
                              src={ev.image_url || "/placeholder.svg"}
                              alt="evidence"
                              className="w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition"
                              onClick={() => setFullImageModal(ev.image_url)}
                            />
                            {ev.description && <p className="text-xs text-white/70 p-2">{ev.description}</p>}
                            <div className="p-2">
                              <button
                                onClick={() => handleVerifyEvidence(itemId, idx)}
                                disabled={ev.checks.includes(user.nickname)}
                                className={`text-xs px-2 py-1 rounded ${
                                  ev.checks.includes(user.nickname)
                                    ? "bg-emerald-500/40 text-emerald-300"
                                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400"
                                } transition disabled:cursor-not-allowed`}
                              >
                                👍 Verificar ({ev.checks.length}/3)
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                    <p className="text-sm font-semibold text-white mb-3">✓ Verificación Comunitaria</p>
                    <div className="flex gap-3 flex-wrap">
                      {isHabit && (
                        <button
                          onClick={() => handleVerifyHabit(itemId)}
                          disabled={userHasVerified}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            userHasVerified
                              ? "bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 cursor-not-allowed"
                              : "bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400"
                          }`}
                        >
                          👍 Verificar ({item.checks.length}/3)
                        </button>
                      )}
                      <button
                        onClick={() => setCommentModals({ ...commentModals, [itemId]: !commentModals[itemId] })}
                        className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg text-sm font-medium transition"
                      >
                        💬 Comentar ({item.comments?.length || 0})
                      </button>
                      {!isHabit && (
                        <button
                          onClick={() => setEvidenceModals({ ...evidenceModals, [itemId]: !evidenceModals[itemId] })}
                          className="px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm font-medium transition"
                        >
                          📸 Subir Evidencia de Resolución
                        </button>
                      )}
                    </div>
                  </div>

                  {commentModals[itemId] && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        {item.comments && item.comments.length > 0 && (
                          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {item.comments.map((comment: any, idx: number) => (
                              <div key={idx} className="bg-white/5 p-2 rounded text-xs">
                                <p className="font-medium text-white">{comment.user}</p>
                                <p className="text-white/70">{comment.text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        <textarea
                          value={commentTexts[itemId] || ""}
                          onChange={(e) => setCommentTexts({ ...commentTexts, [itemId]: e.target.value })}
                          placeholder="Escribe un comentario..."
                          rows={2}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 outline-none text-sm resize-none"
                        />
                        <button
                          onClick={() => {
                            if (isHabit) {
                              handleAddCommentToHabit(itemId)
                            } else {
                              handleAddComment(itemId)
                            }
                          }}
                          className="w-full px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm font-medium transition"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  )}

                  {!isHabit && evidenceModals[itemId] && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-white mb-3">📸 Subir Evidencia de Resolución</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-white/80 mb-2">Foto de Resolución *</label>
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleEvidenceImageChange(e, itemId)}
                              className="hidden"
                              id={`evidence-input-${itemId}`}
                            />
                            <label
                              htmlFor={`evidence-input-${itemId}`}
                              className="block w-full px-4 py-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-2 border-dashed border-yellow-500/50 hover:border-yellow-400 hover:bg-yellow-500/20 rounded-xl text-white text-center cursor-pointer transition-all shadow-lg hover:shadow-yellow-500/20"
                            >
                              <span className="text-sm font-medium">📁 Seleccionar imagen de resolución</span>
                              <p className="text-xs text-white/50 mt-1">Arrastra o haz clic para subir</p>
                            </label>
                          </div>
                          {evidenceData[itemId]?.image && (
                            <p className="mt-2 text-xs text-emerald-400">✓ Imagen seleccionada</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-white/80 mb-2">Descripción</label>
                          <textarea
                            value={evidenceData[itemId]?.description || ""}
                            onChange={(e) =>
                              setEvidenceData({
                                ...evidenceData,
                                [itemId]: { ...evidenceData[itemId], description: e.target.value },
                              })
                            }
                            placeholder="Describe cómo se resolvió el problema..."
                            rows={2}
                            className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs outline-none resize-none focus:border-emerald-400"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEvidenceModals({ ...evidenceModals, [itemId]: false })}
                            className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition"
                            disabled={loading}
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleAddEvidenceToReport(itemId)}
                            disabled={!evidenceData[itemId]?.image || loading}
                            className="flex-1 px-3 py-2 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-lg text-xs transition disabled:opacity-50"
                          >
                            {loading ? "Subiendo..." : "Subir Evidencia"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-white/60 text-lg mb-2">No hay publicaciones en la comunidad aún</p>
            <p className="text-white/40">Sé el primero en compartir un hábito o reporte</p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">💡 Normas de la Comunidad</h3>
        <ul className="space-y-2 text-sm text-white/70">
          <li>✓ Sé respetuoso con otros usuarios</li>
          <li>✓ Verifica la información antes de validar</li>
          <li>✓ Adjunta pruebas (fotos) cuando sea posible</li>
          <li>✓ Para reportes, sube evidencia de resolución si el problema fue solucionado</li>
          <li>✓ Usa comentarios para colaboración constructiva</li>
          <li>✓ Juntos construimos una comunidad más consciente 🌱</li>
        </ul>
      </div>

      {fullImageModal && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          onClick={() => setFullImageModal(null)}
        >
          <div className="relative max-w-6xl max-h-screen">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setFullImageModal(null)
              }}
              className="absolute -top-4 -right-4 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 shadow-xl z-50 border-2 border-white/80 hover:scale-110 hover:rotate-90 cursor-pointer"
              style={{
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
              }}
              aria-label="Cerrar imagen"
            >
              ✕
            </button>
            <img
              src={fullImageModal || "/placeholder.svg"}
              alt="full size"
              className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
