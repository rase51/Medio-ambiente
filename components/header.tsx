"use client"

export function Header({ nickname }: { nickname: string }) {
  return (
    <header className="relative border-b border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden">
      <div className="absolute inset-0 h-full opacity-40">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.4), transparent)",
            animation: "slideGlow 4s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes slideGlow {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              ♻️ Sistema de Gestión de Residuos
            </h1>
            <p className="text-white/60 mt-1">Reduce • Reutiliza • Recicla • Reporta</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">Bienvenido,</p>
            <p className="text-emerald-400 font-semibold">{nickname}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
