"use client"

interface User {
  id: string
  nickname: string
  avatar: { type: string; bgColor: string }
}

interface SidebarProps {
  user: User
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "habits", label: "Mis Hábitos", icon: "✅" },
  { id: "reports", label: "Reportes", icon: "📝" },
  { id: "community", label: "Comunidad", icon: "🌍" },
  { id: "guide", label: "Educación", icon: "📚" },
]

const avatarEmojis: { [key: string]: string } = {
  alien: "👽",
  robot: "🤖",
  monster: "👹",
  animal: "🦊",
}

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  const avatarEmoji = avatarEmojis[user.avatar.type] || "👤"

  return (
    <aside className="lg:col-span-1">
      <div className="sticky top-6 space-y-4">
        {/* User Card */}
        <div
          className="p-4 rounded-2xl border border-white/10 backdrop-blur-lg"
          style={{ backgroundColor: user.avatar.bgColor + "15" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl shadow-lg"
              style={{ backgroundColor: user.avatar.bgColor }}
            >
              {avatarEmoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/50 uppercase tracking-wider">Tu perfil</p>
              <p className="text-white font-bold text-sm truncate">{user.nickname}</p>
              <p className="text-emerald-400 text-xs">Activo</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 text-sm text-white/80 hover:text-white transition rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 font-medium"
          >
            🚪 Cerrar sesión
          </button>
        </div>

        {/* Navigation */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-3 space-y-2">
          <h3 className="text-xs font-semibold text-emerald-400 uppercase px-3 py-2 tracking-wider">Navegación</h3>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
