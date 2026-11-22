import React, { useState, useMemo } from 'react';
import {
  Search, ChevronRight, ExternalLink, FileText, ZoomIn, X, ChevronLeft, Eye, EyeOff
} from 'lucide-react';

const AREA_STYLES = {
  'Clínica Médica': { backgroundColor: 'var(--dc-tint)', color: 'var(--dc)' },
  'Cirugía': { backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' },
  'Tocoginecología': { backgroundColor: 'var(--plum-tint)', color: 'var(--plum-deep)' },
  'Pediatría': { backgroundColor: 'var(--ochre-tint)', color: '#7a5a18' },
};

export default function TheoryView({ theory, onGoToQuizArea }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTopicId, setActiveTopicId] = useState(() => theory[0]?.id || null);
  const [lightboxPage, setLightboxPage] = useState(null);
  const [showOcrText, setShowOcrText] = useState(false);

  const categories = [
    { id: 'all', name: 'Todos los Temas' },
    { id: 'Clínica Médica', name: 'Clínica Médica' },
    { id: 'Cirugía', name: 'Cirugía' },
    { id: 'Tocoginecología', name: 'Tocoginecología' },
    { id: 'Pediatría', name: 'Pediatría' }
  ];

  const filteredTopics = useMemo(() => {
    return theory.filter(t => {
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = t.title.toLowerCase().includes(q);
        const inContent = t.content.toLowerCase().includes(q);
        const inKeywords = (t.keywords || []).some(k => k.toLowerCase().includes(q));
        return inTitle || inContent || inKeywords;
      }
      return true;
    });
  }, [theory, selectedCategory, searchQuery]);

  const activeTopic = useMemo(() => {
    return theory.find(t => t.id === activeTopicId) || filteredTopics[0] || null;
  }, [theory, activeTopicId, filteredTopics]);

  const padPage = (p) => String(p).padStart(3, '0');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Category Tabs & Search Bar */}
      <div className="academic-card rounded-[20px] p-4 sm:p-5 mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                  style={
                    isSelected
                      ? { backgroundColor: 'var(--clay)', color: '#fffdfa', boxShadow: 'var(--shadow-sm)' }
                      : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-faint)' }} />
            <input
              type="text"
              placeholder="Buscar patología, síntoma, fármaco..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm rounded-xl pl-9 pr-4 py-2.5 border focus:outline-hidden transition-all"
              style={{
                backgroundColor: 'var(--cream)',
                borderColor: 'var(--line-strong)',
                color: 'var(--ink)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: 'var(--ink-faint)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Topics List */}
        <div className="lg:col-span-4 academic-card rounded-[20px] p-4 max-h-[750px] overflow-y-auto space-y-1.5">
          <div
            className="flex items-center justify-between pb-3 px-2 border-b text-[11px] font-bold uppercase tracking-wider"
            style={{ borderColor: 'var(--line)', color: 'var(--ink-faint)' }}
          >
            <span>Temas ({filteredTopics.length})</span>
            <span>Apunte de Paz</span>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--ink-faint)' }}>
              No se encontraron temas con "{searchQuery}"
            </div>
          ) : (
            filteredTopics.map(t => {
              const isActive = t.id === activeTopic?.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setActiveTopicId(t.id); setShowOcrText(false); }}
                  className="w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--clay-tint)',
                          borderColor: 'var(--clay-tint-2)',
                          color: 'var(--ink)',
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: 'transparent',
                          borderColor: 'transparent',
                          color: 'var(--ink-soft)',
                        }
                  }
                >
                  <div className="pr-2 truncate">
                    <span
                      className="block text-[10px] uppercase tracking-wider font-bold mb-0.5"
                      style={{ color: isActive ? 'var(--clay-deep)' : 'var(--ink-faint)' }}
                    >
                      {t.category}
                    </span>
                    <span className="text-sm truncate block">
                      {t.title}
                    </span>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 shrink-0 transition-transform"
                    style={{ color: isActive ? 'var(--clay-deep)' : 'var(--line-strong)' }}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Right Content Area: Original Cropped Pages + Optional OCR Text */}
        <div className="lg:col-span-8 academic-card-elevated rounded-[20px] p-5 sm:p-8 min-h-[500px]">
          {activeTopic ? (
            <div className="space-y-6">
              <div className="pb-5 border-b" style={{ borderColor: 'var(--line)' }}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={AREA_STYLES[activeTopic.category] || { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
                  >
                    {activeTopic.category}
                  </span>

                  {activeTopic.pages && activeTopic.pages.length > 0 && (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
                    >
                      Páginas del PDF: {activeTopic.pages.join(', ')}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--ink)' }}>
                  {activeTopic.title}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => onGoToQuizArea(activeTopic.category)}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                    style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' }}
                  >
                    <span>⚡ Practicar choices de {activeTopic.category}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setShowOcrText(prev => !prev)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors"
                    style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
                  >
                    {showOcrText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showOcrText ? 'Ocultar texto OCR' : 'Ver texto OCR (para copiar)'}</span>
                  </button>
                </div>
              </div>

              {/* Cropped Apunte Images */}
              <div className="space-y-6">
                {(activeTopic.pages || []).map((pageNum) => {
                  const imgSrc = `/theory-pages/page_${padPage(pageNum)}.webp`;
                  return (
                    <div
                      key={pageNum}
                      className="rounded-2xl border overflow-hidden"
                      style={{ borderColor: 'var(--line)', backgroundColor: 'var(--cream)' }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2 border-b text-xs"
                        style={{ backgroundColor: 'var(--cream-2)', borderColor: 'var(--line)', color: 'var(--ink-soft)' }}
                      >
                        <span className="font-semibold">Página {pageNum} del Apunte original</span>
                        <button
                          onClick={() => setLightboxPage(pageNum)}
                          className="inline-flex items-center space-x-1 font-bold"
                          style={{ color: 'var(--clay-deep)' }}
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Ampliar</span>
                        </button>
                      </div>
                      <img
                        src={imgSrc}
                        alt={`${activeTopic.title} - Página ${pageNum}`}
                        loading="lazy"
                        onClick={() => setLightboxPage(pageNum)}
                        className="w-full h-auto cursor-zoom-in bg-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Optional OCR Text Drawer */}
              {showOcrText && (
                <div className="mt-6 pt-6 border-t space-y-2" style={{ borderColor: 'var(--line)' }}>
                  <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                    Transcripción OCR de referencia (útil para copiar texto)
                  </h4>
                  <div
                    className="p-4 rounded-2xl border text-xs sm:text-sm whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto"
                    style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line)', color: 'var(--ink-soft)' }}
                  >
                    {activeTopic.content}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20" style={{ color: 'var(--ink-faint)' }}>
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Selecciona un tema para comenzar a estudiar</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Zoomed Reading */}
      {lightboxPage !== null && (
        <div
          className="fixed inset-0 z-50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6"
          style={{ backgroundColor: 'rgba(47, 36, 28, 0.85)' }}
          onClick={() => setLightboxPage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl p-2"
            style={{ backgroundColor: 'var(--surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b rounded-t-xl"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)' }}
            >
              <span className="font-display text-sm font-bold" style={{ color: 'var(--ink)' }}>
                {activeTopic?.title} — Página {lightboxPage}
              </span>
              <div className="flex items-center space-x-2">
                {activeTopic?.pages && activeTopic.pages.indexOf(lightboxPage) > 0 && (
                  <button
                    onClick={() => setLightboxPage(activeTopic.pages[activeTopic.pages.indexOf(lightboxPage) - 1])}
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink)' }}
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                {activeTopic?.pages && activeTopic.pages.indexOf(lightboxPage) < activeTopic.pages.length - 1 && (
                  <button
                    onClick={() => setLightboxPage(activeTopic.pages[activeTopic.pages.indexOf(lightboxPage) + 1])}
                    className="p-1.5 rounded-lg"
                    style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink)' }}
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setLightboxPage(null)}
                  className="p-1.5 rounded-lg text-white"
                  style={{ backgroundColor: 'var(--ink)' }}
                  title="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={`/theory-pages/page_${padPage(lightboxPage)}.webp`}
              alt={`Página ${lightboxPage}`}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
