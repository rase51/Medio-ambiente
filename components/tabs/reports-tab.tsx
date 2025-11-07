"use client"

import type React from "react"
import { useState } from "react"
import { compressImage } from "@/lib/image-compressor"
import { createSharedReport, uploadCommunityImage, deleteSharedReport } from "@/lib/supabase-community"

interface Report {
  id: string
  title: string
  priority: string
  location: string
  description?: string
  status: string
  createdAt: string
  image?: string
  nickname?: string
}

interface User {
  id: string
  nickname: string
  avatar: { type: string; bgColor: string }
  reports: Report[]
}

interface ReportsTabProps {
  user: User
  onUserUpdate: (updates: Partial<User>) => void
}

export function ReportsTab({ user, onUserUpdate }: ReportsTabProps) {
  const [subTab, setSubTab] = useState<"create" | "mine">("create")
  const [formData, setFormData] = useState({
    title: "",
    priority: "",
    location: "",
    description: "",
    image: "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10000000) {
        alert("La imagen es demasiado grande. Por favor usa una imagen menor a 10MB")
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const base64 = event.target?.result as string
          const compressed = await compressImage(base64, 1200, 0.8)
          console.log("[v0] Original size:", base64.length, "Compressed:", compressed.length)
          setFormData({ ...formData, image: compressed })
          setImagePreview(compressed)
        } catch (error) {
          console.error("[v0] Error compressing image:", error)
          alert("Error al procesar la imagen. Intenta con otra imagen.")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.priority || !formData.location || !formData.image) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      const base64Response = await fetch(formData.image)
      const blob = await base64Response.blob()
      const file = new File([blob], `report-${Date.now()}.jpg`, { type: "image/jpeg" })

      const imageUrl = await uploadCommunityImage(file)
      if (!imageUrl) {
        alert("Error al subir la imagen. Intenta de nuevo.")
        return
      }

      const newReportId = Date.now().toString()
      const newReport: Report = {
        id: newReportId,
        title: formData.title,
        priority: formData.priority,
        location: formData.location,
        description: formData.description || "",
        image: imageUrl,
        status: "reportado",
        createdAt: new Date().toISOString(),
        nickname: user.nickname,
      }

      const updatedReports = [...(user.reports || []), newReport]
      onUserUpdate({ reports: updatedReports })

      await createSharedReport({
        user_id: user.id,
        user_nickname: user.nickname,
        user_avatar: user.avatar,
        location: formData.location,
        description: formData.description,
        image_url: imageUrl,
      })

      setFormData({ title: "", priority: "", location: "", description: "", image: "" })
      setImagePreview("")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("[v0] Error creating report:", error)
      alert("Error al crear el reporte. Intenta de nuevo.")
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      baja: "bg-green-500/20 border-green-500/50 text-green-400",
      media: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
      alta: "bg-red-500/20 border-red-500/50 text-red-400",
    }
    return colors[priority] || "bg-gray-500/20"
  }

  const deleteReport = async (id: string) => {
    try {
      // Eliminar de Supabase usando el user_id
      await deleteSharedReport(id, user.id)

      // Eliminar del estado local
      const updatedReports = user.reports.filter((r) => r.id !== id)
      onUserUpdate({ reports: updatedReports })
    } catch (error) {
      console.error("[v0] Error deleting report:", error)
      alert("Error al eliminar el reporte. Intenta de nuevo.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-1 overflow-x-auto">
        <button
          onClick={() => setSubTab("create")}
          className={`px-4 py-2 rounded-lg transition font-medium whitespace-nowrap ${
            subTab === "create"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          📝 Reportar
        </button>
        <button
          onClick={() => setSubTab("mine")}
          className={`px-4 py-2 rounded-lg transition font-medium whitespace-nowrap ${
            subTab === "mine"
              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          📋 Mis Reportes
        </button>
      </div>

      {subTab === "create" && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Reportar Problema</h2>

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm">
              ✅ Reporte compartido automáticamente en la comunidad. ¡Otros usuarios podrán subir evidencia de
              resolución!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Acumulación de basura en parque central"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Prioridad *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
              >
                <option value="" className="bg-slate-800 text-white">
                  Seleccionar...
                </option>
                <option value="baja" className="bg-slate-800 text-white">
                  🟢 Baja
                </option>
                <option value="media" className="bg-slate-800 text-white">
                  🟡 Media
                </option>
                <option value="alta" className="bg-slate-800 text-white">
                  🔴 Alta
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Ubicación *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dirección exacta o referencia"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el problema con residuos..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Evidencia del Problema *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white file:text-emerald-400 file:bg-emerald-500/20 file:border-emerald-500/30 file:rounded-md file:border file:cursor-pointer hover:border-emerald-400/50 transition"
              />
              {imagePreview && (
                <div className="mt-3 relative">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("")
                      setFormData({ ...formData, image: "" })
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95"
            >
              🚀 Crear y Compartir Reporte
            </button>
          </form>
        </div>
      )}

      {subTab === "mine" && (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Mis Reportes</h2>
          {user.reports && user.reports.length > 0 ? (
            <div className="space-y-4">
              {user.reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-emerald-500/30 transition"
                >
                  {report.image && (
                    <img
                      src={report.image || "/placeholder.svg"}
                      alt={report.title}
                      className="w-full max-h-48 object-cover rounded-lg mb-3 border border-white/10"
                    />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{report.title}</h3>
                      <p className="text-sm text-white/60 mt-1">📍 {report.location}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        report.priority,
                      )}`}
                    >
                      {report.priority === "baja" ? "🟢 Baja" : report.priority === "media" ? "🟡 Media" : "🔴 Alta"}
                    </span>
                  </div>

                  {report.description && <p className="text-sm text-white/70 mb-3">{report.description}</p>}

                  <p className="text-xs text-white/50 mb-3">
                    📝 Reportado: {new Date(report.createdAt).toLocaleDateString()}
                  </p>

                  <p className="text-xs text-white/60 mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    💡 La comunidad puede subir evidencia de resolución en la pestaña "Comunidad". Una vez tenga
                    suficientes verificaciones, el reporte se eliminará automáticamente.
                  </p>

                  <button
                    onClick={() => deleteReport(report.id)}
                    className="w-full px-3 py-2 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 rounded-lg transition"
                  >
                    ✕ Eliminar Reporte
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No has hecho reportes</p>
              <p className="text-white/40 text-sm">Reporta problemas en tu comunidad</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
