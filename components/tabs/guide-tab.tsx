"use client"

export function GuideTab() {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">📚 Guía de Gestión de Residuos</h2>

      <div className="space-y-8">
        {/* 3Rs Section */}
        <div>
          <h3 className="text-xl font-bold text-emerald-400 mb-4">♻️ Las 3R: Reducir, Reutilizar, Reciclar</h3>
          <div className="space-y-3 text-white/70">
            <p>
              <strong className="text-white">Reducir:</strong> Evita generar residuos innecesarios. Compra solo lo
              necesario y prefiere productos con menos empaque.
            </p>
            <p>
              <strong className="text-white">Reutilizar:</strong> Dale una segunda vida a los objetos antes de
              desecharlos.
            </p>
            <p>
              <strong className="text-white">Reciclar:</strong> Separa correctamente los residuos para que puedan ser
              procesados.
            </p>
          </div>
        </div>

        {/* Classification Section */}
        <div>
          <h3 className="text-xl font-bold text-emerald-400 mb-4">🗑️ Clasificación de Residuos</h3>
          <div className="space-y-2 text-white/70 text-sm">
            <p>
              <strong className="text-white">🍂 Orgánicos:</strong> Restos de comida, cáscaras, hojas. Pueden
              compostarse.
            </p>
            <p>
              <strong className="text-white">🥤 Plásticos:</strong> Botellas, envases, bolsas. Verifica el símbolo de
              reciclaje.
            </p>
            <p>
              <strong className="text-white">📄 Papel/Cartón:</strong> Periódicos, cajas, cuadernos. Deben estar limpios
              y secos.
            </p>
            <p>
              <strong className="text-white">🍾 Vidrio:</strong> Botellas, frascos. Enjuaga antes de reciclar.
            </p>
            <p>
              <strong className="text-white">🥫 Metales:</strong> Latas de aluminio y acero.
            </p>
            <p>
              <strong className="text-white">🔌 Electrónicos:</strong> Requieren gestión especial. No los tires a la
              basura común.
            </p>
            <p>
              <strong className="text-white">⚠️ Peligrosos:</strong> Pilas, medicamentos, pinturas. Lleva a puntos de
              recolección especiales.
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div>
          <h3 className="text-xl font-bold text-emerald-400 mb-4">💡 Consejos Prácticos</h3>
          <ul className="space-y-2 text-white/70 text-sm">
            <li>✓ Usa bolsas reutilizables para las compras</li>
            <li>✓ Evita productos de un solo uso</li>
            <li>✓ Composta tus residuos orgánicos</li>
            <li>✓ Limpia los envases antes de reciclar</li>
            <li>✓ Separa los residuos desde casa</li>
            <li>✓ Dona lo que ya no uses pero esté en buen estado</li>
          </ul>
        </div>

        {/* Impact Section */}
        <div>
          <h3 className="text-xl font-bold text-emerald-400 mb-4">🌍 Impacto Ambiental</h3>
          <div className="space-y-2 text-white/70 text-sm">
            <p>• Una tonelada de papel reciclado ahorra 17 árboles, 26,000 litros de agua y 4,000 kWh de energía.</p>
            <p>
              • Reciclar una lata de aluminio ahorra suficiente energía para mantener encendida una bombilla durante 3
              horas.
            </p>
            <p>• El 40% de los residuos domésticos son orgánicos y pueden convertirse en compost.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
