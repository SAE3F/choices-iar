import React, { useState } from 'react';
import { Baby, Sparkles, AlertTriangle } from 'lucide-react';

export default function MilestonesView({ milestones }) {
  const [selectedAge, setSelectedAge] = useState(milestones[0]?.age || '');
  const activeMilestone = milestones.find(m => m.age === selectedAge) || milestones[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Intro Hero Banner */}
      <div
        className="rounded-[24px] p-6 sm:p-8 text-white border"
        style={{
          backgroundColor: 'var(--ink)',
          borderColor: '#46382e',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: 'rgba(185, 89, 49, 0.28)', color: 'var(--clay-tint)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pregunta Fija de Examen IAR (Casos 1 y 2)</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#fffdfa]">
              Hitos Madurativos y Neurodesarrollo Pediátrico
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#d8cec6' }}>
              Guía rápida para responder con seguridad: determina al instante si el desarrollo motor, lenguaje o social es <strong>NORMAL</strong>, <strong>TARDÍO</strong> o <strong>AVANZADO</strong> según la edad del paciente en el caso clínico.
            </p>
          </div>
          <div
            className="rounded-2xl p-4 border text-xs space-y-2 shrink-0"
            style={{ backgroundColor: 'rgba(255, 253, 250, 0.08)', borderColor: 'rgba(255, 253, 250, 0.15)' }}
          >
            <div className="font-hand text-lg font-semibold" style={{ color: 'var(--ochre)' }}>
              Regla de Oro IAR:
            </div>
            <p style={{ color: '#ece4dc' }}>
              • <strong>Normal:</strong> cumple los hitos esperados para su edad.<br />
              • <strong>Tardío:</strong> no realiza pautas que ya debería haber logrado.<br />
              • <strong>Avanzado:</strong> realiza conductas de niños de 6 a 12 meses mayores.
            </p>
          </div>
        </div>
      </div>

      {/* Age Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {milestones.map(m => {
          const isSelected = selectedAge === m.age;
          return (
            <button
              key={m.age}
              onClick={() => setSelectedAge(m.age)}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border"
              style={
                isSelected
                  ? { backgroundColor: 'var(--clay)', color: '#fffdfa', borderColor: 'var(--clay)', boxShadow: 'var(--shadow-sm)' }
                  : { backgroundColor: 'var(--surface)', color: 'var(--ink-soft)', borderColor: 'var(--line)' }
              }
            >
              {m.age}
            </button>
          );
        })}
      </div>

      {/* Active Milestone Detailed Card */}
      {activeMilestone && (
        <div className="academic-card-elevated rounded-[20px] p-6 sm:p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b" style={{ borderColor: 'var(--line)' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' }}
            >
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>
                Edad Clave: {activeMilestone.age}
              </h2>
              <p className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                Pautas diagnósticas evaluadas en la consulta de seguimiento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--dc-tint)', borderColor: 'var(--dc-line)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--dc)' }}>
                🏃 Habilidades Motoras Gruesas
              </span>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>
                {activeMilestone.motor}
              </p>
            </div>

            <div className="p-5 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--ochre-tint)', borderColor: '#e5cd99' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7a5a18' }}>
                ✍️ Habilidades Motoras Finas
              </span>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>
                {activeMilestone.fine_motor}
              </p>
            </div>

            <div className="p-5 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--plum-tint)', borderColor: '#e4c7e1' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--plum-deep)' }}>
                🗣️ Lenguaje y Comunicación
              </span>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>
                {activeMilestone.language}
              </p>
            </div>

            <div className="p-5 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--sage-tint)', borderColor: '#b9d8bf' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sage-deep)' }}>
                🤝 Habilidades Sociales y Psicosociales
              </span>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>
                {activeMilestone.social}
              </p>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border text-xs sm:text-sm flex items-start space-x-3"
            style={{ backgroundColor: 'var(--clay-tint)', borderColor: 'var(--clay-tint-2)', color: '#5a1e09' }}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--clay-deep)' }} />
            <div>
              <strong className="font-bold">Banderas Rojas / Criterio de Tardío o Patológico:</strong>
              <p className="mt-0.5">{activeMilestone.red_flags}</p>
            </div>
          </div>
        </div>
      )}

      {/* Typical Cases Cheat Sheet */}
      <div className="rounded-[20px] p-6 border space-y-4" style={{ backgroundColor: 'var(--cream-2)', borderColor: 'var(--line)' }}>
        <h3 className="font-display font-bold text-base" style={{ color: 'var(--ink)' }}>
          📋 Casos Clásicos de Examen:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="academic-card p-4 rounded-xl space-y-1.5">
            <span className="font-bold" style={{ color: 'var(--clay-deep)' }}>Caso Ileana (18 meses):</span>
            <p style={{ color: 'var(--ink-soft)' }}>
              Camina sin ayuda aunque a veces se cae, no regula esfínteres, habla 2 palabras ('mamá' y 'papá').<br />
              <strong>Resolución IAR:</strong> Motor Normal, Lenguaje Tardío (esperable 4-10 palabras), Social Normal (el control de esfínteres a los 18 meses NO es exigible).
            </p>
          </div>
          <div className="academic-card p-4 rounded-xl space-y-1.5">
            <span className="font-bold" style={{ color: 'var(--clay-deep)' }}>Caso Juan Cruz (2 años):</span>
            <p style={{ color: 'var(--ink-soft)' }}>
              Camina solo, lanza pelota, se sube a sillas, imita tareas.<br />
              <strong>Resolución IAR:</strong> Motor Normal, Lenguaje Normal/Tardío según si combina 2 palabras, Social Normal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
