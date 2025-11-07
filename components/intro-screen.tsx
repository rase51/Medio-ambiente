"use client"

import { useState } from "react"
import { ArrowRight, Leaf, Users, BarChart3, MapPin } from "lucide-react"

export function IntroScreen({ onStart }: { onStart: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Bienvenido a Residuos+",
      description: "Una plataforma comunitaria para gestionar y compartir prácticas sostenibles de reciclaje",
      icon: Leaf,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Registra tus Hábitos",
      description: "Crea hábitos de separación de residuos y comparte tu progreso con la comunidad",
      icon: BarChart3,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Reporta Problemas",
      description: "Identifica y reporta puntos críticos de residuos en tu zona, ayudando a mejorar el entorno",
      icon: MapPin,
      color: "from-orange-400 to-orange-600",
    },
    {
      title: "Comunidad Conectada",
      description: "Verifica, comenta y valida acciones de otros usuarios para construir juntos un planeta más limpio",
      icon: Users,
      color: "from-purple-400 to-purple-600",
    },
  ]

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animación de entrada */}
        <div className="animate-fade-in">
          {/* Icono principal */}
          <div
            className={`w-24 h-24 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-8 transform transition-all duration-500`}
          >
            <Icon className="w-12 h-12 text-white" />
          </div>

          {/* Contenido */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{step.title}</h1>
            <p className="text-slate-300 text-lg leading-relaxed">{step.description}</p>
          </div>

          {/* Indicadores de progreso */}
          <div className="flex gap-2 justify-center mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-emerald-500"
                    : index < currentStep
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Botones de navegación */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white font-medium transition-all hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={onStart}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                Comenzar <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Skip */}
          <button
            onClick={onStart}
            className="w-full mt-4 text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Saltar introducción
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
