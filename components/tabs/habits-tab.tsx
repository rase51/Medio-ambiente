"use client"

import type React from "react"
import { useState } from "react"
import { createSharedHabit, uploadCommunityImage } from "@/lib/supabase-community"

interface Habit {
  id: string
  category: string
  description: string
  quantity: number
  frequency: string
  streak: number
  shared?: boolean
  completedDates?: string[]
  evidence?: Array<{ image: string; description: string; date: string; verificationCount?: number }>
  verified?: boolean
  verificationCount?: number
}

interface User {
  id: string
  nickname: string
  avatar: { type: string; bgColor: string }
  habits: Habit[]
}

interface HabitsTabProps {
  user: User
  onUserUpdate: (updates: Partial<User>) => void
}

const CATEGORIES = [
  {
    value: "organico",
    label: "Orgánico",
    emoji: "🍂",
    color: "from-amber-500 to-yellow-500",
    description: "Separé restos de comida para compostar",
  },
  {
    value: "plastico",
    label: "Plástico",
    emoji: "🥤",
    color: "from-blue-500 to-cyan-500",
    description: "Reciclé botellas y envases",
  },
  {
    value: "papel",
    label: "Papel/Cartón",
    emoji: "📄",
    color: "from-orange-400 to-orange-600",
    description: "Separé papel limpio para reciclar",
  },
  {
    value: "vidrio",
    label: "Vidrio",
    emoji: "🍾",
    color: "from-emerald-400 to-green-600",
    description: "Separé frascos y botellas de vidrio",
  },
  {
    value: "metal",
    label: "Metal",
    emoji: "🥫",
    color: "from-gray-400 to-gray-600",
    description: "Separé latas de aluminio/acero",
  },
  {
    value: "electronico",
    label: "Electrónico",
    emoji: "🔌",
    color: "from-purple-500 to-pink-500",
    description: "Llevé aparatos a reciclaje especial",
  },
  {
    value: "peligroso",
    label: "Peligroso",
    emoji: "⚠️",
    color: "from-red-500 to-rose-600",
    description: "Llevé pilas/químicos a punto limpio",
  },
]

const VERIFICATION_THRESHOLD = 3

export function HabitsTab({ user, onUserUpdate }: HabitsTabProps) {
  const [subTab, setSubTab] = useState<"list" | "quick" | "add">("list")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [counter, setCounter] = useState(1)
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    quantity: "",
    frequency: "diario",
  })
  const [success, setSuccess] = useState(false)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState<string | null>(null)
  const [evidenceData, setEvidenceData] = useState({ image: "", description: "" })

  const getActionDescription = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category)
    return cat ? `${counter} ${cat.label}: ${cat.description}` : ""
  }

  const handleQuickAdd = (category: string) => {
    if (selectedCategory === category) {
      setCounter(counter + 1)
    } else {
      setSelectedCategory(category)
      setCounter(1)
    }
  }

  const handleQuickAddSubmit = () => {
    if (!selectedCategory) return

    const categoryData = CATEGORIES.find((c) => c.value === selectedCategory)
    const today = new Date().toISOString().split("T")[0]

    const newHabit: Habit = {
      id: Date.now().toString(),
      category: selectedCategory,
      description: getActionDescription(selectedCategory),
      quantity: counter,
      frequency: "diario",
      streak: 0,
      shared: false,
      completedDates: [today],
      evidence: [],
      verified: false,
      verificationCount: 0,
    }

    const updatedHabits = [...(user.habits || []), newHabit]
    onUserUpdate({ habits: updatedHabits })
    setSelectedCategory(null)
    setCounter(1)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const today = new Date().toISOString().split("T")[0]

    const newHabit: Habit = {
      id: Date.now().toString(),
      category: formData.category,
      description: formData.description,
      quantity: Number.parseInt(formData.quantity),
      frequency: formData.frequency,
      streak: 0,
      shared: false,
      completedDates: [today],
      evidence: [],
      verified: false,
      verificationCount: 0,
    }

    const updatedHabits = [...(user.habits || []), newHabit]
    onUserUpdate({ habits: updatedHabits })

    setFormData({ category: "", description: "", quantity: "", frequency: "diario" })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const getCategoryData = (category: string) => {
    return CATEGORIES.find((c) => c.value === category)
  }

  const submitEvidence = async (habitId: string) => {
    if (!evidenceData.image) return

    try {
      const habit = user.habits.find((h) => h.id === habitId)
      if (!habit) return

      const base64Response = await fetch(evidenceData.image)
      const blob = await base64Response.blob()
      const file = new File([blob], `habit-${Date.now()}.jpg`, { type: "image/jpeg" })

      const imageUrl = await uploadCommunityImage(file)
      if (!imageUrl) {
        alert("Error al subir la imagen. Intenta de nuevo.")
        return
      }

      const today = new Date().toISOString()
      const newEvidence = [
        ...(habit.evidence || []),
        {
          image: imageUrl,
          description: evidenceData.description,
          date: today,
          verificationCount: 0,
        },
      ]

      const updatedHabits = user.habits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            evidence: newEvidence,
            verified: false,
          }
        }
        return h
      })

      onUserUpdate({ habits: updatedHabits })

      await createSharedHabit({
        user_id: user.id,
        user_nickname: user.nickname,
        user_avatar: user.avatar,
        category: habit.category,
        description: habit.description,
        image_url: imageUrl,
      })

      setEvidenceData({ image: "", description: "" })
      setEvidenceModalOpen(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("[v0] Error uploading evidence:", error)
      alert("Error al subir evidencia. Intenta de nuevo.")
    }
  }

  const handleEvidenceImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10000000) {
        alert("La imagen es demasiado grande. Por favor usa una imagen menor a 10MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setEvidenceData({ ...evidenceData, image: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteHabit = (id: string) => {
    const updatedHabits = user.habits.filter((h) => h.id !== id)
    onUserUpdate({ habits: updatedHabits })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-1 overflow-x-auto">
        <button
          onClick={() => setSubTab("list")}
          className={`px-4 py-2 rounded-lg transition font-medium whitespace-nowrap ${
            subTab === "list"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          📝 Mis Hábitos
        </button>
        <button
          onClick={() => setSubTab("quick")}
          className={`px-4 py-2 rounded-lg transition font-medium whitespace-nowrap ${
            subTab === "quick"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          ⚡ Click Rápido
        </button>
        <button
          onClick={() => setSubTab("add")}
          className={`px-4 py-2 rounded-lg transition font-medium whitespace-nowrap ${
            subTab === "add"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          ➕ Agregar
        </button>
      </div>

      {subTab === "list" && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Mis Hábitos de Reciclaje</h2>
          {user.habits && user.habits.length > 0 ? (
            <div className="grid gap-4">
              {user.habits.map((habit) => {
                const catData = getCategoryData(habit.category)
                return (
                  <div
                    key={habit.id}
                    className="group bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-emerald-500/30 rounded-xl p-4 transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold bg-gradient-to-br ${catData?.color} shadow-lg`}
                        >
                          {catData?.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg">{habit.description}</h3>
                          <p className="text-sm text-white/60">
                            {habit.frequency} • Meta: {habit.quantity}
                          </p>
                          <p className="text-xs text-emerald-400 mt-1">
                            {habit.verified ? "✓ Validado" : habit.verificationCount || 0}/{VERIFICATION_THRESHOLD}{" "}
                            verificaciones
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-center bg-white/5 rounded-lg px-3 py-2">
                          <p className="text-2xl font-bold text-emerald-400">{habit.streak}</p>
                          <p className="text-xs text-white/60">racha</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/20">
                      <p className="text-xs text-white/60 mb-2">Evidencia del hábito:</p>
                      {habit.evidence && habit.evidence.length > 0 ? (
                        <div className="space-y-2 mb-2">
                          {habit.evidence.map((ev, idx) => (
                            <div key={idx} className="text-xs text-white/70 bg-white/5 p-2 rounded">
                              <img
                                src={ev.image || "/placeholder.svg"}
                                alt="evidence"
                                className="w-full max-h-24 object-cover rounded mb-1"
                              />
                              {ev.description && <p className="font-medium">{ev.description}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 mb-2">Sin evidencia aún</p>
                      )}
                      <button
                        onClick={() => setEvidenceModalOpen(habit.id)}
                        className="w-full px-2 py-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 rounded transition"
                      >
                        📸 Subir Evidencia
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="flex-1 px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg transition"
                      >
                        ✕ Eliminar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No has creado hábitos aún</p>
              <p className="text-white/40 text-sm">Crea uno para comenzar tu viaje de reciclaje</p>
            </div>
          )}
        </div>
      )}

      {subTab === "quick" && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">⚡ Modo Click Rápido</h2>
          <p className="text-white/60 mb-6">Registra hábitos rápidamente, luego sube evidencia para validarlos</p>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
              ✅ Hábito registrado exitosamente
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleQuickAdd(cat.value)}
                className={`p-4 rounded-xl border transition transform hover:scale-105 flex flex-col items-center text-center ${
                  selectedCategory === cat.value
                    ? `bg-gradient-to-br ${cat.color} border-white/30 shadow-lg scale-105`
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <p
                  className={`font-semibold text-sm ${selectedCategory === cat.value ? "text-white" : "text-white/80"}`}
                >
                  {cat.label}
                </p>
                <p className={`text-xs mt-1 ${selectedCategory === cat.value ? "text-white/90" : "text-white/50"}`}>
                  {cat.description}
                </p>
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-semibold">Cantidad: {counter}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCounter(Math.max(1, counter - 1))}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg transition"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setCounter(counter + 1)}
                    className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 rounded-lg transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                onClick={handleQuickAddSubmit}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition"
              >
                ✓ Registrar {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
              </button>
            </div>
          )}
        </div>
      )}

      {subTab === "add" && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Registrar Nuevo Hábito</h2>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
              ✅ Hábito registrado exitosamente
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
              >
                <option value="" className="bg-slate-800 text-white">
                  Seleccionar...
                </option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800 text-white">
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Descripción</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ej: Separar botellas de plástico"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Cantidad/Meta</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Ej: 5"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Frecuencia</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 rounded-lg text-white text-center cursor-pointer transition hover:bg-white/10"
              >
                <option value="diario" className="bg-slate-800 text-white">
                  Diario
                </option>
                <option value="semanal" className="bg-slate-800 text-white">
                  Semanal
                </option>
                <option value="mensual" className="bg-slate-800 text-white">
                  Mensual
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              ➕ Agregar Hábito
            </button>
          </form>
        </div>
      )}

      {evidenceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Subir Evidencia</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Foto de Evidencia</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEvidenceImageChange}
                    className="hidden"
                    id="evidence-file-input"
                  />
                  <label
                    htmlFor="evidence-file-input"
                    className="block w-full px-4 py-3 bg-white/5 border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 rounded-lg text-white text-center cursor-pointer transition hover:bg-white/10"
                  >
                    <span className="text-sm">📁 Selecciona una imagen</span>
                  </label>
                </div>
                {evidenceData.image && (
                  <img
                    src={evidenceData.image || "/placeholder.svg"}
                    alt="preview"
                    className="mt-2 max-h-40 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Descripción (Opcional)</label>
                <textarea
                  value={evidenceData.description}
                  onChange={(e) => setEvidenceData({ ...evidenceData, description: e.target.value })}
                  placeholder="Describe qué hiciste..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEvidenceModalOpen(null)
                    setEvidenceData({ image: "", description: "" })
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => submitEvidence(evidenceModalOpen)}
                  disabled={!evidenceData.image}
                  className="flex-1 px-4 py-2 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  Subir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
