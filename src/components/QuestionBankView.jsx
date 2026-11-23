import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  RotateCcw, Bookmark, BookmarkCheck, HelpCircle, Check,
  Search, AlertTriangle, Sparkles, Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AREA_STYLES = {
  'Clínica Médica': { backgroundColor: 'var(--dc-tint)', color: 'var(--dc)' },
  'Cirugía': { backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' },
  'Tocoginecología': { backgroundColor: 'var(--plum-tint)', color: 'var(--plum-deep)' },
  'Pediatría': { backgroundColor: 'var(--ochre-tint)', color: '#7a5a18' },
};

export default function QuestionBankView({ questions }) {
  const [selectedArea, setSelectedArea] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // all, marked, ai_suggested, failed, bookmarks
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iar_bank_answers') || '{}');
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iar_bank_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('iar_bank_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('iar_bank_answers', JSON.stringify(userAnswers));
  }, [userAnswers]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedArea !== 'all' && q.area !== selectedArea) return false;
      if (filterMode === 'marked' && !q.has_student_mark) return false;
      if (filterMode === 'ai_suggested' && q.has_student_mark) return false;
      if (filterMode === 'bookmarks' && !bookmarks.includes(q.id)) return false;
      if (filterMode === 'failed' && userAnswers[q.id] && userAnswers[q.id].isCorrect) return false;
      if (filterMode === 'failed' && !userAnswers[q.id]) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesPrompt = q.prompt.toLowerCase().includes(query);
        const matchesOptions = q.options.some(o => o.text.toLowerCase().includes(query));
        if (!matchesPrompt && !matchesOptions) return false;
      }

      return true;
    });
  }, [questions, selectedArea, filterMode, bookmarks, userAnswers, searchQuery]);

  const currentQ = filteredQuestions[currentIndex] || null;

  // Sync state when moving between questions
  useEffect(() => {
    if (!currentQ) return;
    const recorded = userAnswers[currentQ.id];
    if (recorded) {
      setSelectedOptions(recorded.selected);
      setIsAnswered(true);
    } else {
      setSelectedOptions([]);
      setIsAnswered(false);
    }
  }, [currentIndex, currentQ?.id]);

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (filteredQuestions.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredQuestions.length]);

  const handleSelectOption = (optId) => {
    if (isAnswered) return;
    if (currentQ?.is_multiple) {
      setSelectedOptions(prev =>
        prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId]
      );
    } else {
      setSelectedOptions([optId]);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentQ || selectedOptions.length === 0) return;

    const correctSet = new Set(currentQ.correct_answers);
    const selectedSet = new Set(selectedOptions);

    let isCorrect = false;
    if (correctSet.size === selectedSet.size) {
      isCorrect = [...correctSet].every(item => selectedSet.has(item));
    }

    const answerRecord = {
      selected: selectedOptions,
      isCorrect,
      timestamp: Date.now()
    };

    setUserAnswers(prev => ({ ...prev, [currentQ.id]: answerRecord }));
    setIsAnswered(true);

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#729f7b', '#d7b16a', '#b95931', '#a3689e']
      });
    }
  };

  const toggleBookmark = (qId) => {
    setBookmarks(prev =>
      prev.includes(qId) ? prev.filter(x => x !== qId) : [...prev, qId]
    );
  };

  const resetCurrentQuiz = () => {
    if (window.confirm('¿Deseas reiniciar las respuestas respondidas de este banco?')) {
      setUserAnswers({});
      setIsAnswered(false);
      setSelectedOptions([]);
      localStorage.removeItem('iar_bank_answers');
    }
  };

  const answeredInFilter = filteredQuestions.filter(q => userAnswers[q.id]);
  const correctInFilter = answeredInFilter.filter(q => userAnswers[q.id].isCorrect);
  const totalInFilter = filteredQuestions.length;
  const scorePercent = answeredInFilter.length > 0
    ? Math.round((correctInFilter.length / answeredInFilter.length) * 100)
    : 0;

  if (!currentQ) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <HelpCircle className="w-12 h-12 mx-auto text-[var(--clay)]" />
        <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--ink)' }}>
          No se encontraron preguntas con los filtros seleccionados
        </h2>
        <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto">
          Probá modificando la búsqueda por texto o restableciendo los filtros de especialidad y estado.
        </p>
        <button
          onClick={() => { setSelectedArea('all'); setFilterMode('all'); setSearchQuery(''); setCurrentIndex(0); }}
          className="px-5 py-2.5 text-white font-semibold rounded-xl transition-all"
          style={{ backgroundColor: 'var(--clay)', boxShadow: 'var(--shadow-sm)' }}
        >
          Restablecer Filtros
        </button>
      </div>
    );
  }

  const recordedState = userAnswers[currentQ?.id];
  const areaStyle = AREA_STYLES[currentQ.area] || { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Mega Rejunte Notice Banner */}
      <div
        className="rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{
          backgroundColor: '#fffdf9',
          borderColor: 'var(--ochre)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="flex items-start space-x-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: 'var(--ochre-tint)', color: '#7a5a18' }}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm" style={{ color: 'var(--ink)' }}>
              Banco de Preguntas • Mega Rejunte ({questions.length} Choices)
            </h3>
            <p className="text-xs leading-relaxed text-[var(--ink-soft)] mt-0.5">
              Preguntas tomadas en exámenes IAR extraídas de apuntes y consensos estudiantiles. Las respuestas marcadas o sugeridas deben ser verificadas con bibliografía médica oficial.
            </p>
          </div>
        </div>
      </div>

      {/* Top Filter Controls Bar */}
      <div className="academic-card rounded-[20px] p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-faint)' }}>
              Buscar por palabra clave / patología
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
                placeholder="Ej: neumonía, cetoacidosis, metformina, apendicitis..."
                className="w-full text-sm font-medium rounded-xl pl-10 pr-4 py-2.5 border focus:outline-hidden transition-all"
                style={{
                  backgroundColor: 'var(--cream)',
                  borderColor: 'var(--line-strong)',
                  color: 'var(--ink)'
                }}
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div className="w-full md:w-56">
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-faint)' }}>
              Especialidad
            </label>
            <select
              value={selectedArea}
              onChange={(e) => { setSelectedArea(e.target.value); setCurrentIndex(0); }}
              className="w-full text-sm font-medium rounded-xl px-3.5 py-2.5 border focus:outline-hidden transition-all"
              style={{
                backgroundColor: 'var(--cream)',
                borderColor: 'var(--line-strong)',
                color: 'var(--ink)',
              }}
            >
              <option value="all">Todas las Especialidades ({questions.length})</option>
              <option value="Clínica Médica">Clínica Médica</option>
              <option value="Cirugía">Cirugía</option>
              <option value="Tocoginecología">Tocoginecología</option>
              <option value="Pediatría">Pediatría</option>
            </select>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={filterMode === 'all'
                ? { backgroundColor: 'var(--ink)', color: 'var(--surface)' }
                : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
            >
              Todas ({totalInFilter})
            </button>
            <button
              onClick={() => { setFilterMode('marked'); setCurrentIndex(0); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={filterMode === 'marked'
                ? { backgroundColor: 'var(--ochre)', color: 'var(--ink)' }
                : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
            >
              ⚠️ Con marca estudiantil
            </button>
            <button
              onClick={() => { setFilterMode('ai_suggested'); setCurrentIndex(0); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={filterMode === 'ai_suggested'
                ? { backgroundColor: 'var(--dc)', color: '#fff' }
                : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
            >
              💡 Solo sugeridas IA
            </button>
            <button
              onClick={() => { setFilterMode('failed'); setCurrentIndex(0); }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={filterMode === 'failed'
                ? { backgroundColor: 'var(--clay)', color: 'var(--surface)' }
                : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
            >
              Falladas
            </button>
            <button
              onClick={() => { setFilterMode('bookmarks'); setCurrentIndex(0); }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={filterMode === 'bookmarks'
                ? { backgroundColor: 'var(--plum)', color: '#fff' }
                : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Guardadas ({bookmarks.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <span>Respondidas: <strong style={{ color: 'var(--ink)' }}>{answeredInFilter.length} / {totalInFilter}</strong></span>
            {answeredInFilter.length > 0 && (
              <span>
                Precisión:{' '}
                <strong style={{ color: scorePercent >= 70 ? 'var(--sage-deep)' : 'var(--clay-deep)' }}>
                  {scorePercent}%
                </strong>
              </span>
            )}
            <button
              onClick={resetCurrentQuiz}
              className="flex items-center space-x-1 font-medium text-[var(--ink-soft)] hover:opacity-80"
              title="Reiniciar respuestas guardadas del banco"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="academic-card-elevated rounded-[20px] px-6 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-3 transition-all">
        <div
          className="sticky top-16 z-30 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-3 pb-3 border-b backdrop-blur-md rounded-t-[20px] flex items-center justify-between gap-2"
          style={{
            backgroundColor: 'rgba(255, 253, 250, 0.96)',
            borderColor: 'var(--line)',
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink)' }}
            >
              Pregunta {currentIndex + 1} de {totalInFilter}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={areaStyle}>
              {currentQ.area}
            </span>
            {currentQ.has_student_mark ? (
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center space-x-1"
                style={{
                  backgroundColor: 'var(--ochre-tint)',
                  color: '#7a5a18',
                  borderColor: '#e8cb8d'
                }}
              >
                <span>⚠️ Marcada en apunte</span>
              </span>
            ) : (
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-md border flex items-center space-x-1"
                style={{
                  backgroundColor: 'var(--dc-tint)',
                  color: 'var(--dc)',
                  borderColor: '#b4c9dc'
                }}
              >
                <span>💡 Sugerencia IA</span>
              </span>
            )}
            {currentQ.is_multiple && (
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--plum-tint)',
                  color: 'var(--plum-deep)',
                  borderColor: '#e4c7e1',
                }}
              >
                Selección Múltiple
              </span>
            )}
          </div>

          <button
            onClick={() => toggleBookmark(currentQ.id)}
            className="p-2 rounded-xl transition-all"
            style={
              bookmarks.includes(currentQ.id)
                ? { backgroundColor: 'var(--ochre-tint)', color: '#7a5a18' }
                : { color: 'var(--ink-faint)' }
            }
            title="Guardar para repasar"
          >
            {bookmarks.includes(currentQ.id) ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Question Prompt */}
        <div className="py-6">
          <p className="font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink)' }}>
            {currentQ.prompt}
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptions.includes(opt.id);
            const isCorrect = currentQ.correct_answers.includes(opt.id);

            let cardStyle = {
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--line)',
              color: 'var(--ink)',
            };
            let badgeStyle = {
              backgroundColor: 'var(--cream-2)',
              color: 'var(--ink)',
              borderColor: 'var(--line)',
            };

            if (!isAnswered) {
              if (isSelected) {
                cardStyle = {
                  backgroundColor: 'var(--cream-2)',
                  borderColor: 'var(--ink)',
                  color: 'var(--ink)',
                  boxShadow: 'var(--shadow-sm)',
                };
                badgeStyle = {
                  backgroundColor: 'var(--ink)',
                  color: 'var(--surface)',
                  borderColor: 'var(--ink)',
                };
              }
            } else {
              if (isCorrect) {
                cardStyle = {
                  backgroundColor: '#edf6ee',
                  borderColor: 'var(--sage-deep)',
                  color: '#1e4624',
                };
                badgeStyle = {
                  backgroundColor: 'var(--sage-deep)',
                  color: '#ffffff',
                  borderColor: 'var(--sage-deep)',
                };
              } else if (isSelected && !isCorrect) {
                cardStyle = {
                  backgroundColor: '#faece8',
                  borderColor: 'var(--clay)',
                  color: 'var(--clay-deep)',
                };
                badgeStyle = {
                  backgroundColor: 'var(--clay)',
                  color: '#ffffff',
                  borderColor: 'var(--clay)',
                };
              }
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-4 rounded-xl border flex items-start space-x-3.5 transition-all select-none ${
                  !isAnswered ? 'cursor-pointer hover:border-[var(--line-strong)] active:scale-[0.995]' : ''
                }`}
                style={cardStyle}
              >
                <div
                  className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all"
                  style={badgeStyle}
                >
                  {opt.id}
                </div>

                <div className="flex-1 text-sm sm:text-base leading-snug">
                  <span>{opt.text}</span>
                  {isAnswered && opt.was_marked_in_doc && (
                    <span
                      className="ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: 'var(--ochre-tint)',
                        color: '#7a5a18',
                        borderColor: '#e8cb8d'
                      }}
                    >
                      Marcada en apunte
                    </span>
                  )}
                </div>

                {isAnswered && (
                  <div className="shrink-0 self-center">
                    {isCorrect && <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--sage-deep)' }} />}
                    {isSelected && !isCorrect && <XCircle className="w-5 h-5" style={{ color: 'var(--clay)' }} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button: Comprobar */}
        {!isAnswered && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOptions.length === 0}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{
                backgroundColor: 'var(--clay)',
                boxShadow: selectedOptions.length > 0 ? 'var(--shadow-md)' : 'none',
              }}
            >
              Comprobar Respuesta
            </button>
          </div>
        )}

        {/* Feedback Card */}
        {isAnswered && (
          <div
            className="mt-6 p-5 sm:p-6 rounded-2xl border space-y-3 transition-all"
            style={{
              backgroundColor: recordedState?.isCorrect ? '#f2f8f3' : '#fcf1ee',
              borderColor: recordedState?.isCorrect ? 'var(--sage)' : '#ecc8bd',
            }}
          >
            <div className="flex items-center space-x-2">
              {recordedState?.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--sage-deep)' }} />
                  <span className="font-display font-bold text-base" style={{ color: 'var(--sage-deep)' }}>
                    ¡Correcto!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" style={{ color: 'var(--clay-deep)' }} />
                  <span className="font-display font-bold text-base" style={{ color: 'var(--clay-deep)' }}>
                    Respuesta incorrecta
                  </span>
                </>
              )}
            </div>

            <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--ink)' }}>
              <p>{currentQ.explanation}</p>
              <p className="text-xs text-[var(--ink-soft)] italic pt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                💡 Tip de estudio: Si tenés una fundamentación médica distinta o detectás discrepancias con las guías oficiales, podés anotar tus observaciones o cotejar directamente con el módulo de Teoría Completa.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="mt-8 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink)' }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 overflow-x-auto max-w-xs py-1 px-2">
            {filteredQuestions.slice(Math.max(0, currentIndex - 4), currentIndex + 5).map((q) => {
              const globalIdx = filteredQuestions.indexOf(q);
              const ans = userAnswers[q.id];
              let dotStyle = { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' };
              if (ans) {
                dotStyle = ans.isCorrect
                  ? { backgroundColor: 'var(--sage-deep)', color: '#fff' }
                  : { backgroundColor: 'var(--clay)', color: '#fff' };
              }
              if (globalIdx === currentIndex) {
                dotStyle = { ...dotStyle, outline: '2px solid var(--ink)', outlineOffset: '2px' };
              }
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(globalIdx)}
                  className="w-6 h-6 rounded-md text-[11px] font-bold shrink-0 transition-all"
                  style={dotStyle}
                >
                  {globalIdx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
            disabled={currentIndex === filteredQuestions.length - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: 'var(--clay)', boxShadow: 'var(--shadow-sm)' }}
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
