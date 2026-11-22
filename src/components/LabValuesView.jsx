import React, { useState } from 'react';
import { Activity } from 'lucide-react';

export default function LabValuesView({ labValues }) {
  const [search, setSearch] = useState('');

  const filteredValues = labValues.map(group => {
    const items = group.items.filter(item => {
      const q = search.toLowerCase();
      return (
        item.parameter.toLowerCase().includes(q) ||
        item.normal.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      );
    });
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="academic-card rounded-[20px] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--clay)' }}>
              <Activity className="w-4 h-4" />
              <span>Valores de Referencia IAR</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
              Constantes Biológicas y Parámetros de Laboratorio
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--ink-soft)' }}>
              Datos clave extraídos del Apunte de Paz para resolver preguntas de medio interno, hematología, líquidos y hepatograma.
            </p>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar parámetro (ej. potasio, VCM, GASA)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm rounded-xl px-4 py-2.5 border focus:outline-hidden transition-all"
              style={{
                backgroundColor: 'var(--cream)',
                borderColor: 'var(--line-strong)',
                color: 'var(--ink)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables by System */}
      <div className="space-y-6">
        {filteredValues.map((group, idx) => (
          <div key={idx} className="academic-card rounded-[20px] overflow-hidden">
            <div className="px-6 py-3.5 border-b" style={{ backgroundColor: 'var(--cream-2)', borderColor: 'var(--line)' }}>
              <h2 className="font-display font-bold text-base" style={{ color: 'var(--ink)' }}>
                {group.system}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr
                    className="border-b text-[11px] font-bold uppercase tracking-wider"
                    style={{ borderColor: 'var(--line)', backgroundColor: 'var(--cream)', color: 'var(--ink-faint)' }}
                  >
                    <th className="py-3 px-6">Parámetro</th>
                    <th className="py-3 px-6">Valor Normal</th>
                    <th className="py-3 px-6">Perla para el Choice / Interpretación</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--line)' }}>
                  {group.items.map((item, itemIdx) => (
                    <tr key={itemIdx} className="transition-colors" style={{ borderColor: 'var(--line)' }}>
                      <td className="py-3.5 px-6 font-semibold whitespace-nowrap" style={{ color: 'var(--ink)' }}>
                        {item.parameter}
                      </td>
                      <td
                        className="py-3.5 px-6 font-mono text-xs font-semibold whitespace-nowrap"
                        style={{ color: 'var(--clay-deep)', backgroundColor: 'rgba(255, 225, 209, 0.25)' }}
                      >
                        {item.normal}
                      </td>
                      <td className="py-3.5 px-6 leading-relaxed text-xs sm:text-sm" style={{ color: 'var(--ink-soft)' }}>
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
