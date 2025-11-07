"use client"

interface AvatarOption {
  type: string
  bgColor: string
}

interface AvatarSelectorProps {
  selected: AvatarOption | null
  onSelect: (avatar: AvatarOption) => void
}

const AVATAR_OPTIONS: Array<{ type: string; bgColors: string[] }> = [
  {
    type: "alien",
    bgColors: ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"],
  },
  {
    type: "robot",
    bgColors: ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"],
  },
  {
    type: "monster",
    bgColors: ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"],
  },
  {
    type: "animal",
    bgColors: ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444"],
  },
]

export function AvatarSelector({ selected, onSelect }: AvatarSelectorProps) {
  const renderAvatar = (type: string, bgColor: string) => {
    const baseStyle = {
      width: "80px",
      height: "80px",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: bgColor,
      fontSize: "40px",
    }

    const avatars: { [key: string]: string } = {
      alien: "👽",
      robot: "🤖",
      monster: "👹",
      animal: "🦊",
    }

    return avatars[type] || "👤"
  }

  return (
    <div className="space-y-4">
      {AVATAR_OPTIONS.map((option) => (
        <div key={option.type} className="space-y-3">
          <p className="text-sm font-medium text-white/80 capitalize">{option.type}</p>
          <div className="grid grid-cols-6 gap-2">
            {option.bgColors.map((bgColor) => {
              const isSelected = selected?.type === option.type && selected?.bgColor === bgColor

              return (
                <button
                  key={`${option.type}-${bgColor}`}
                  onClick={() => onSelect({ type: option.type, bgColor })}
                  className={`relative p-2 rounded-lg transition transform hover:scale-110 ${
                    isSelected ? "ring-2 ring-emerald-400 scale-110" : "hover:opacity-80"
                  }`}
                  style={{ backgroundColor: bgColor + "20" }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    {renderAvatar(option.type, bgColor)}
                  </div>
                  {isSelected && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
