import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  RotateCcw, Bookmark, BookmarkCheck, HelpCircle, Check,
  FileText, X, ZoomIn, Shuffle, Timer, Award, AlertCircle,
  Filter, Sparkles, BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

const AREA_STYLES = {
  'Clínica Médica': { backgroundColor: 'var(--dc-tint)', color: 'var(--dc)' },
  'Cirugía': { backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' },
  'Tocoginecología': { backgroundColor: 'var(--plum-tint)', color: 'var(--plum-deep)' },
  'Pediatría': { backgroundColor: 'var(--ochre-tint)', color: '#7a5a18' },
};

export default function QuizView({ exams, megaQuestions = [], initialArea = 'all' }) {
  // Navigation & Filter states
  const [selectedExamId, setSelectedExamId] = useState('all');
  const [selectedArea, setSelectedArea] = useState(initialArea);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'pending', 'failed', 'bookmarks'
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simulacro (Random Exam) states
  const [isSimulacroActive, setIsSimulacroActive] = useState(false);
  const [showSimulacroModal, setShowSimulacroModal] = useState(false);
  const [simulacroQuestions, setSimulacroQuestions] = useState([]);
  const [simulacroTargetCount, setSimulacroTargetCount] = useState(20);
  const [simulacroArea, setSimulacroArea] = useState('all');
  const [simulacroIncludeBank, setSimulacroIncludeBank] = useState(true);
  const [simulacroOnlyPending, setSimulacroOnlyPending] = useState(false);
  const [simulacroTimerSeconds, setSimulacroTimerSeconds] = useState(0);
  const [showSimulacroSummary, setShowSimulacroSummary] = useState(false);

  // Lightbox for PDF preview
  const [lightboxPage, setLightboxPage] = useState(null);

  // Persistent user answers in localStorage
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iar_user_answers') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('iar_user_answers', JSON.stringify(userAnswers));
  }, [userAnswers]);

  // Bookmarks in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('iar_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('iar_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (initialArea && initialArea !== 'all') {
      setSelectedArea(initialArea);
    }
  }, [initialArea]);

  // Stopwatch timer for Simulacro
  useEffect(() => {
    let interval = null;
    if (isSimulacroActive && !showSimulacroSummary) {
      interval = setInterval(() => {
        setSimulacroTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isSimulacroActive, showSimulacroSummary]);

  // Current question interaction
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);

  // Build canonical flat list of questions from exams
  const allExamQuestions = useMemo(() => {
    let list = [];
    exams.forEach(exam => {
      (exam.questions || []).forEach(q => {
        list.push({
          ...q,
          examTitle: exam.title,
          examYear: exam.year,
          examMonth: exam.month,
          examId: exam.id,
          source: 'exam',
          pdf_page: q.pdf_page || exam.page_start || 4,
          examPages: exam.pages || [exam.page_start || 4],
          examPageStart: exam.page_start || 4,
          examPageEnd: exam.page_end || 4
        });
      });
    });
    return list;
  }, [exams]);

  // Formatted mega bank questions
  const formattedBankQuestions = useMemo(() => {
    return (megaQuestions || []).map(q => ({
      ...q,
      examTitle: 'Mega Rejunte (Banco)',
      examYear: 2024,
      examMonth: 'Varios',
      examId: 'mega_bank',
      source: 'bank',
      area: q.specialty || 'Clínica Médica',
      group_id: q.id,
      pdf_page: null
    }));
  }, [megaQuestions]);

  // Active question pool: normal filter OR active simulacro
  const activeQuestions = useMemo(() => {
    if (isSimulacroActive) {
      return simulacroQuestions;
    }

    return allExamQuestions.filter(q => {
      // 1. Exam filter
      if (selectedExamId !== 'all' && q.examId !== selectedExamId) return false;
      // 2. Specialty filter
      if (selectedArea !== 'all' && q.area !== selectedArea) return false;
      // 3. Status filter
      if (filterMode === 'bookmarks' && !bookmarks.includes(q.id)) return false;
      if (filterMode === 'pending' && userAnswers[q.id]) return false;
      if (filterMode === 'failed') {
        const recorded = userAnswers[q.id];
        if (!recorded || recorded.isCorrect) return false;
      }
      return true;
    });
  }, [isSimulacroActive, simulacroQuestions, allExamQuestions, selectedExamId, selectedArea, filterMode, bookmarks, userAnswers]);

  // Statistics calculation for the current filter
  const countsByFilter = useMemo(() => {
    let base = allExamQuestions.filter(q => {
      if (selectedExamId !== 'all' && q.examId !== selectedExamId) return false;
      if (selectedArea !== 'all' && q.area !== selectedArea) return false;
      return true;
    });

    const total = base.length;
    let pending = 0;
    let failed = 0;
    let bookmarked = 0;

    base.forEach(q => {
      const rec = userAnswers[q.id];
      if (!rec) {
        pending++;
      } else if (!rec.isCorrect) {
        failed++;
      }
      if (bookmarks.includes(q.id)) {
        bookmarked++;
      }
    });

    return { total, pending, failed, bookmarked };
  }, [allExamQuestions, selectedExamId, selectedArea, userAnswers, bookmarks]);

  const currentQ = activeQuestions[currentIndex] || null;

  // Sync selection state when moving between questions
  useEffect(() => {
    if (currentQ) {
      const recorded = userAnswers[currentQ.id];
      if (recorded) {
        setSelectedOptions(recorded.selected || []);
        setIsAnswered(true);
      } else {
        setSelectedOptions([]);
        setIsAnswered(false);
      }
    }
  }, [currentIndex, currentQ, userAnswers]);

  // Mobile: clinical case banner collapsed by default; auto-expanded when a new case starts
  const [caseExpanded, setCaseExpanded] = useState(false);
  const [filtersOpenMobile, setFiltersOpenMobile] = useState(false);
  useEffect(() => {
    setCaseExpanded(!currentQ?.is_case_followup);
  }, [currentQ?.case_vignette]);

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (showSimulacroModal || showSimulacroSummary || lightboxPage !== null) return;
      if (activeQuestions.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(prev => Math.min(activeQuestions.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestions.length, showSimulacroModal, showSimulacroSummary, lightboxPage]);

  // Option selection handler
  const toggleOption = (optId) => {
    if (isAnswered) return;
    if (currentQ.is_multiple) {
      if (selectedOptions.includes(optId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optId));
      } else {
        setSelectedOptions([...selectedOptions, optId]);
      }
    } else {
      // Single choice: only select (can be changed); user must confirm explicitly
      setSelectedOptions([optId]);
    }
  };

  // Submit and grade answer
  const submitAnswer = (optionsToValidate = selectedOptions) => {
    if (optionsToValidate.length === 0 || !currentQ) return;

    const correctArr = (currentQ.correct_options || currentQ.correct_answers || []).map(a => a.trim().toUpperCase());
    const userArr = optionsToValidate.map(a => a.trim().toUpperCase());

    const isCorrect = correctArr.length > 0 &&
      correctArr.length === userArr.length &&
      correctArr.sort().every((val, idx) => val === userArr.sort()[idx]);

    if (isCorrect) {
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#729f7b', '#b95931', '#d7b16a']
        });
      } catch (e) {}
    }

    setUserAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        selected: optionsToValidate,
        isCorrect: isCorrect,
        timestamp: Date.now()
      }
    }));
    setIsAnswered(true);
  };

  const toggleBookmark = (id) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const resetCurrentScope = () => {
    if (window.confirm('¿Deseas reiniciar las respuestas guardadas en este filtro?')) {
      const qIds = activeQuestions.map(q => q.id);
      setUserAnswers(prev => {
        const next = { ...prev };
        qIds.forEach(id => delete next[id]);
        return next;
      });
      setCurrentIndex(0);
      setIsAnswered(false);
      setSelectedOptions([]);
    }
  };

  // ==========================================
  // SIMULACRO AL AZAR (CASE-CHAINING ENGINE)
  // ==========================================
  const startRandomSimulacro = () => {
    // 1. Build initial candidate pool
    let candidatePool = [...allExamQuestions];
    if (simulacroIncludeBank) {
      candidatePool = candidatePool.concat(formattedBankQuestions);
    }

    // Filter by specialty if selected
    if (simulacroArea !== 'all') {
      candidatePool = candidatePool.filter(q => q.area === simulacroArea);
    }

    // Filter by pending if requested
    if (simulacroOnlyPending) {
      candidatePool = candidatePool.filter(q => !userAnswers[q.id]);
    }

    if (candidatePool.length === 0) {
      alert('No hay preguntas disponibles con los criterios seleccionados para el simulacro.');
      return;
    }

    // 2. Group candidates by group_id so cases are ATOMIC
    const groups = {};
    candidatePool.forEach(q => {
      const gid = q.group_id || q.id;
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(q);
    });

    // 3. Shuffle group keys randomly
    const groupKeys = Object.keys(groups).sort(() => 0.5 - Math.random());

    // 4. Fill exam up to target count by adding full case groups in sequence
    let chosenQuestions = [];
    for (const gid of groupKeys) {
      if (chosenQuestions.length >= simulacroTargetCount) break;
      // Add ALL questions belonging to this case in their natural order!
      chosenQuestions.push(...groups[gid]);
    }

    // Fallback if target count couldn't be filled
    if (chosenQuestions.length === 0) {
      chosenQuestions = candidatePool.slice(0, simulacroTargetCount);
    }

    setSimulacroQuestions(chosenQuestions);
    setIsSimulacroActive(true);
    setShowSimulacroModal(false);
    setShowSimulacroSummary(false);
    setCurrentIndex(0);
    setSimulacroTimerSeconds(0);
    setIsAnswered(false);
    setSelectedOptions([]);
  };

  const exitSimulacro = () => {
    if (window.confirm('¿Seguro que deseas salir del simulacro?')) {
      setIsSimulacroActive(false);
      setShowSimulacroSummary(false);
      setCurrentIndex(0);
    }
  };

  // Format timer seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Score metrics
  const totalInFilter = activeQuestions.length;
  const answeredInFilter = activeQuestions.filter(q => userAnswers[q.id]);
  const correctInFilter = answeredInFilter.filter(q => userAnswers[q.id]?.isCorrect).length;
  const scorePercent = answeredInFilter.length > 0
    ? Math.round((correctInFilter / answeredInFilter.length) * 100)
    : 0;

  const recordedState = userAnswers[currentQ?.id];
  const areaStyle = AREA_STYLES[currentQ?.area] || { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' };

  // ==========================================
  // NO QUESTIONS FOUND VIEW
  // ==========================================
  if (activeQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--ochre-tint)', color: '#7a5a18' }}
        >
          <HelpCircle className="w-8 h-8" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
          No se encontraron preguntas con estos filtros
        </h3>
        <p className="mb-6 text-sm max-w-md mx-auto" style={{ color: 'var(--ink-soft)' }}>
          {filterMode === 'failed' && '¡Excelente! No tienes preguntas marcadas como incorrectas en este criterio de búsqueda.'}
          {filterMode === 'pending' && '¡Completaste todas las preguntas de este examen/área! Prueba cambiando de filtro o iniciando un simulacro.'}
          {filterMode === 'bookmarks' && 'No has guardado preguntas con marcador en esta sección.'}
          {filterMode === 'all' && 'Prueba seleccionando "Todos los exámenes" o quitando filtros.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => { setSelectedExamId('all'); setSelectedArea('all'); setFilterMode('all'); }}
            className="px-5 py-2.5 text-white font-semibold rounded-xl transition-all"
            style={{ backgroundColor: 'var(--clay)', boxShadow: 'var(--shadow-sm)' }}
          >
            Ver Todas las Preguntas
          </button>
          <button
            onClick={() => setShowSimulacroModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold border transition-all"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
          >
            <Shuffle className="w-4 h-4" style={{ color: 'var(--clay)' }} />
            <span>Generar Simulacro al Azar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* SIMULACRO ACTIVE BANNER */}
      {isSimulacroActive && (
        <div
          className="rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--clay)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' }}
            >
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-sm sm:text-base" style={{ color: 'var(--ink)' }}>
                  Simulacro al Azar en Curso
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: 'var(--sage-tint)', color: 'var(--sage-deep)' }}
                >
                  Casos Clínicos Encadenados ✓
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                Pregunta {currentIndex + 1} de {totalInFilter} • Respondidas: {answeredInFilter.length} • Aciertos: {correctInFilter}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-end sm:self-auto">
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold"
              style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              <Timer className="w-3.5 h-3.5" style={{ color: 'var(--clay)' }} />
              <span>{formatTime(simulacroTimerSeconds)}</span>
            </div>
            <button
              onClick={() => setShowSimulacroSummary(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all"
              style={{ backgroundColor: 'var(--cream-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              Resumen
            </button>
            <button
              onClick={exitSimulacro}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
              style={{ backgroundColor: 'var(--clay)' }}
            >
              Finalizar Simulacro
            </button>
          </div>
        </div>
      )}

      {/* TOP FILTERS & SELECTION BAR (When not in Simulacro) */}
      {!isSimulacroActive && (
        <div className="academic-card rounded-[20px] p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          {/* Mobile compact toggle header */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpenMobile(v => !v)}
              className="flex-1 flex items-center justify-between text-left px-3 py-2 rounded-xl border text-xs font-semibold"
              style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              <span className="truncate">
                {selectedExamId === 'all' ? 'Todos los exámenes' : exams.find(e => e.id === selectedExamId)?.title}
                {selectedArea !== 'all' ? ` • ${selectedArea}` : ''}
                {` (${totalInFilter})`}
              </span>
              <span className="ml-2 shrink-0" style={{ color: 'var(--clay-deep)' }}>
                {filtersOpenMobile ? 'Ocultar ▴' : 'Filtros ▾'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowSimulacroModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shrink-0"
              style={{ backgroundColor: 'var(--clay)' }}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Simulacro</span>
            </button>
          </div>

          <div className={`${filtersOpenMobile ? 'flex' : 'hidden'} sm:flex flex-col md:flex-row md:items-center justify-between gap-4`}>
            {/* Exam selector */}
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--ink-faint)' }}>
                Examen a Practicar
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => { setSelectedExamId(e.target.value); setCurrentIndex(0); }}
                className="w-full text-sm font-medium rounded-xl px-3.5 py-2.5 border focus:outline-hidden transition-all"
                style={{
                  backgroundColor: 'var(--cream)',
                  borderColor: 'var(--line-strong)',
                  color: 'var(--ink)',
                }}
              >
                <option value="all">Todos los Exámenes ({allExamQuestions.length} Choices)</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.questions?.length || 0} preguntas)
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty selector */}
            <div className="w-full md:w-52">
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
                <option value="all">Todas las Especialidades</option>
                <option value="Clínica Médica">Clínica Médica</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Tocoginecología">Tocoginecología</option>
                <option value="Pediatría">Pediatría</option>
              </select>
            </div>

            {/* Random Simulacro Button */}
            <div className="pt-2 md:pt-5">
              <button
                onClick={() => setShowSimulacroModal(true)}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-95"
                style={{ backgroundColor: 'var(--clay)' }}
              >
                <Shuffle className="w-4 h-4" />
                <span>Simulacro al Azar</span>
              </button>
            </div>
          </div>

          {/* FILTER MODES (Todas, Pendientes, Errores, Guardadas) */}
          <div className={`${filtersOpenMobile ? 'flex' : 'hidden'} sm:flex flex-wrap items-center justify-between gap-3 pt-3 border-t`} style={{ borderColor: 'var(--line)' }}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={filterMode === 'all'
                  ? { backgroundColor: 'var(--ink)', color: 'var(--surface)' }
                  : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
              >
                Todas ({countsByFilter.total})
              </button>

              <button
                onClick={() => { setFilterMode('pending'); setCurrentIndex(0); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                style={filterMode === 'pending'
                  ? { backgroundColor: 'var(--clay-deep)', color: 'var(--surface)' }
                  : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
              >
                <span>Pendientes</span>
                <span className="opacity-80">({countsByFilter.pending})</span>
              </button>

              <button
                onClick={() => { setFilterMode('failed'); setCurrentIndex(0); }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                style={filterMode === 'failed'
                  ? { backgroundColor: 'var(--clay)', color: 'var(--surface)' }
                  : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Practicar Errores</span>
                <span className="opacity-80">({countsByFilter.failed})</span>
              </button>

              <button
                onClick={() => { setFilterMode('bookmarks'); setCurrentIndex(0); }}
                className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={filterMode === 'bookmarks'
                  ? { backgroundColor: 'var(--ochre)', color: 'var(--ink)' }
                  : { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' }}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Guardadas ({countsByFilter.bookmarked})</span>
              </button>
            </div>

            <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--ink-faint)' }}>
              <span>
                Respondidas: <strong style={{ color: 'var(--ink)' }}>{answeredInFilter.length} / {totalInFilter}</strong>
              </span>
              {answeredInFilter.length > 0 && (
                <span>
                  Aciertos: <strong style={{ color: scorePercent >= 70 ? 'var(--sage-deep)' : 'var(--clay-deep)' }}>
                    {correctInFilter} ({scorePercent}%)
                  </strong>
                </span>
              )}
              <button
                onClick={resetCurrentScope}
                className="flex items-center space-x-1 font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--ink-soft)' }}
                title="Reiniciar respuestas guardadas de este grupo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar grupo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN QUESTION CARD */}
      <div className="academic-card-elevated rounded-[20px] px-6 pb-6 pt-2 sm:px-8 sm:pb-8 sm:pt-3 transition-all">
        {/* Sticky Header: Question Number, Badges & Clinical Case Vignette */}
        <div
          className="sticky top-[102px] md:top-16 z-30 -mx-6 sm:-mx-8 px-6 sm:px-8 pt-3 pb-3 border-b backdrop-blur-md rounded-t-[20px]"
          style={{
            backgroundColor: 'rgba(255, 253, 250, 0.96)',
            borderColor: 'var(--line)',
          }}
        >
          {/* Header badges & actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink)' }}
              >
                Pregunta {currentIndex + 1} de {totalInFilter}
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg border"
                style={{
                  backgroundColor: 'var(--cream)',
                  borderColor: 'var(--line)',
                  color: 'var(--ink-soft)',
                }}
              >
                {currentQ.examTitle}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={areaStyle}>
                {currentQ.area}
              </span>
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

            <div className="flex items-center space-x-2">
              {currentQ.pdf_page && (
                <button
                  onClick={() => setLightboxPage(currentQ.pdf_page)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--cream)',
                    borderColor: 'var(--line-strong)',
                    color: 'var(--ink)',
                  }}
                  title="Ver lámina original escaneada del apunte"
                >
                  <FileText className="w-3.5 h-3.5" style={{ color: 'var(--clay)' }} />
                  <span className="hidden sm:inline">Ver Apunte (Pág. {Math.max(1, currentQ.pdf_page - 3)})</span>
                </button>
              )}

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
          </div>

          {/* CLINICAL CASE VIGNETTE CARD (WHEN CHAINED) */}
          {currentQ.case_vignette && (
            <div
              className="mt-3 rounded-2xl p-3.5 sm:p-4 border"
              style={{
                backgroundColor: 'var(--cream-2)',
                borderColor: 'var(--line-strong)',
              }}
            >
              <button
                type="button"
                onClick={() => setCaseExpanded(v => !v)}
                className="w-full flex items-center justify-between mb-1.5 text-left sm:cursor-default"
                aria-expanded={caseExpanded}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--clay)' }} />
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider truncate" style={{ color: 'var(--clay-deep)' }}>
                    {currentQ.case_title || 'Caso Clínico Asociado'}
                  </h4>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {currentQ.is_case_followup && (
                    <span
                      className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' }}
                    >
                      Pregunta Encadenada al Caso
                    </span>
                  )}
                  <span className="sm:hidden text-[11px] font-semibold" style={{ color: 'var(--clay-deep)' }}>
                    {caseExpanded ? 'Ocultar ▴' : 'Ver caso ▾'}
                  </span>
                </div>
              </button>
              <p className={`${caseExpanded ? 'block' : 'hidden'} sm:block text-sm leading-relaxed whitespace-pre-line max-h-[40vh] sm:max-h-40 overflow-y-auto pr-1`} style={{ color: 'var(--ink)' }}>
                {currentQ.case_vignette}
              </p>
            </div>
          )}
        </div>

        {/* Question Prompt */}
        <div className="py-5">
          <p className="font-medium text-base sm:text-lg leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink)' }}>
            {currentQ.prompt}
          </p>
        </div>

        {/* Options List */}
        {currentQ.options && currentQ.options.length > 0 ? (
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOptions.includes(opt.id);
              const correctArr = (currentQ.correct_options || currentQ.correct_answers || []).map(a => a.toUpperCase());
              const isCorrect = correctArr.includes(opt.id.toUpperCase());

              let cardStyle = {
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--line)',
                color: 'var(--ink)',
              };
              let badgeStyle = {
                backgroundColor: 'var(--cream-2)',
                borderColor: 'var(--line)',
                color: 'var(--ink-soft)',
              };

              if (isAnswered) {
                if (isCorrect) {
                  cardStyle = {
                    backgroundColor: 'var(--sage-tint)',
                    borderColor: 'var(--sage-deep)',
                    color: '#1e3a25',
                    fontWeight: 500,
                  };
                  badgeStyle = {
                    backgroundColor: 'var(--sage-deep)',
                    borderColor: 'var(--sage-deep)',
                    color: '#ffffff',
                  };
                } else if (isSelected && !isCorrect) {
                  cardStyle = {
                    backgroundColor: 'var(--clay-tint)',
                    borderColor: 'var(--clay-deep)',
                    color: '#5a1e09',
                  };
                  badgeStyle = {
                    backgroundColor: 'var(--clay-deep)',
                    borderColor: 'var(--clay-deep)',
                    color: '#ffffff',
                  };
                } else {
                  cardStyle = {
                    backgroundColor: 'var(--cream)',
                    borderColor: 'var(--line)',
                    color: 'var(--ink-faint)',
                    opacity: 0.65,
                  };
                }
              } else if (isSelected) {
                cardStyle = {
                  backgroundColor: 'var(--cream-2)',
                  borderColor: 'var(--clay)',
                  color: 'var(--ink)',
                  fontWeight: 500,
                };
                badgeStyle = {
                  backgroundColor: 'var(--clay)',
                  borderColor: 'var(--clay)',
                  color: '#ffffff',
                };
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  disabled={isAnswered}
                  className="w-full text-left p-4 min-h-[52px] rounded-2xl border transition-all flex items-start space-x-3.5 active:scale-[0.99]"
                  style={cardStyle}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border"
                    style={badgeStyle}
                  >
                    {isAnswered && isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : opt.id}
                  </div>
                  <div className="text-sm sm:text-base leading-snug pt-0.5 flex-1">
                    {opt.text}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl border text-sm text-center" style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line)' }}>
            Pregunta conceptual de razonamiento.
          </div>
        )}

        {/* Confirmation button (single and multiple choice) - sticky at bottom on mobile */}
        {currentQ.options?.length > 0 && !isAnswered && (
          <div
            className="sticky bottom-0 z-20 -mx-6 px-6 py-3 mt-5 sm:static sm:mx-0 sm:px-0 sm:py-0 flex justify-end"
            style={{ background: 'linear-gradient(to top, rgba(255,253,250,1) 70%, rgba(255,253,250,0))' }}
          >
            <button
              onClick={() => submitAnswer()}
              disabled={selectedOptions.length === 0}
              className="w-full sm:w-auto min-h-[48px] px-6 py-2.5 text-white font-semibold rounded-xl transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--clay)', boxShadow: 'var(--shadow-sm)' }}
            >
              {currentQ.is_multiple
                ? `Confirmar Selección (${selectedOptions.length})`
                : selectedOptions.length === 0
                  ? 'Elegí una opción'
                  : `Confirmar respuesta (${selectedOptions[0]})`}
            </button>
          </div>
        )}

        {/* Feedback box on answered */}
        {isAnswered && (
          <div className="mt-8 pt-6 border-t space-y-4" style={{ borderColor: 'var(--line)' }}>
            <div
              className="p-4 rounded-2xl flex items-start space-x-3 border"
              style={
                recordedState?.isCorrect
                  ? { backgroundColor: 'var(--sage-tint)', borderColor: 'var(--sage)', color: '#1e3a25' }
                  : { backgroundColor: 'var(--clay-tint)', borderColor: 'var(--clay)', color: '#5a1e09' }
              }
            >
              {recordedState?.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--sage-deep)' }} />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--clay-deep)' }} />
              )}
              <div className="text-sm">
                <p className="font-display font-bold">
                  {recordedState?.isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
                </p>
                <p className="mt-0.5 text-xs opacity-90 flex flex-wrap items-center gap-2">
                  <span>
                    {currentQ.key_status === 'suggested_no_official' ? 'Respuesta sugerida:' : 'Respuesta oficial del apunte:'}{' '}
                    <strong className="underline uppercase">
                      {(currentQ.correct_options || currentQ.correct_answers || []).join(', ')}
                    </strong>
                  </span>
                  {currentQ.key_status === 'possible_key_error' && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border"
                      style={{ backgroundColor: 'var(--ochre-tint)', color: '#7a5a18', borderColor: '#e8cb8d' }}
                    >
                      ⚠️ Posible error en la clave
                    </span>
                  )}
                  {currentQ.key_status === 'suggested_no_official' && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border"
                      style={{ backgroundColor: 'var(--cream)', color: 'var(--ink-soft)', borderColor: 'var(--line-strong)' }}
                    >
                      💡 Sugerida, no oficial
                    </span>
                  )}
                </p>
              </div>
            </div>

            {currentQ.explanation && (
              <div
                className="p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5"
                style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line)', color: 'var(--ink-soft)' }}
              >
                <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--ink-faint)' }}>
                  Razonamiento Clínico
                </span>
                <p className="leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination & Next/Previous navigation */}
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

          {/* Quick jump dot navigation */}
          <div className="hidden sm:flex items-center space-x-1.5 overflow-x-auto max-w-xs py-1 px-2">
            {activeQuestions.map((q, idx) => {
              const ans = userAnswers[q.id];
              let dotStyle = { backgroundColor: 'var(--cream-2)', color: 'var(--ink-soft)' };
              if (ans) {
                dotStyle = ans.isCorrect
                  ? { backgroundColor: 'var(--sage-deep)', color: '#fff' }
                  : { backgroundColor: 'var(--clay)', color: '#fff' };
              }
              if (idx === currentIndex) {
                dotStyle = { ...dotStyle, outline: '2px solid var(--ink)', outlineOffset: '2px' };
              }
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="w-6 h-6 rounded-md text-[11px] font-bold shrink-0 transition-all"
                  style={dotStyle}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(activeQuestions.length - 1, prev + 1))}
            disabled={currentIndex === activeQuestions.length - 1}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: 'var(--cream-2)', color: 'var(--ink)' }}
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==========================================
          MODAL: CONFIGURAR SIMULACRO AL AZAR
      ========================================== */}
      {showSimulacroModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="academic-card-elevated rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-6"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' }}
                >
                  <Shuffle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg" style={{ color: 'var(--ink)' }}>
                    Configurar Simulacro al Azar
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                    Casos clínicos encadenados preservados de forma atómica
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulacroModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Question Count */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-faint)' }}>
                  Cantidad de Preguntas
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setSimulacroTargetCount(cnt)}
                      className="py-2.5 rounded-xl font-display font-bold text-sm border transition-all"
                      style={simulacroTargetCount === cnt
                        ? { backgroundColor: 'var(--clay)', borderColor: 'var(--clay)', color: '#ffffff' }
                        : { backgroundColor: 'var(--cream)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-faint)' }}>
                  Especialidad
                </label>
                <select
                  value={simulacroArea}
                  onChange={(e) => setSimulacroArea(e.target.value)}
                  className="w-full text-sm font-medium rounded-xl px-3.5 py-2.5 border focus:outline-hidden"
                  style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                >
                  <option value="all">Todas las Especialidades</option>
                  <option value="Clínica Médica">Clínica Médica</option>
                  <option value="Cirugía">Cirugía</option>
                  <option value="Tocoginecología">Tocoginecología</option>
                  <option value="Pediatría">Pediatría</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center space-x-3 text-sm cursor-pointer" style={{ color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={simulacroIncludeBank}
                    onChange={(e) => setSimulacroIncludeBank(e.target.checked)}
                    className="rounded border-stone-300 text-stone-800 focus:ring-stone-400 w-4 h-4"
                  />
                  <span>Incluir también preguntas del <strong>Mega Rejunte (Banco)</strong></span>
                </label>

                <label className="flex items-center space-x-3 text-sm cursor-pointer" style={{ color: 'var(--ink)' }}>
                  <input
                    type="checkbox"
                    checked={simulacroOnlyPending}
                    onChange={(e) => setSimulacroOnlyPending(e.target.checked)}
                    className="rounded border-stone-300 text-stone-800 focus:ring-stone-400 w-4 h-4"
                  />
                  <span>Priorizar solo preguntas <strong>pendientes (no realizadas)</strong></span>
                </label>
              </div>

              {/* Informative alert about case chaining */}
              <div
                className="p-3.5 rounded-xl border text-xs space-y-1"
                style={{ backgroundColor: 'var(--cream-2)', borderColor: 'var(--line-strong)', color: 'var(--ink-soft)' }}
              >
                <div className="flex items-center space-x-1.5 font-bold" style={{ color: 'var(--clay-deep)' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Garantía de casos encadenados</span>
                </div>
                <p>
                  Si el algoritmo aleatorio selecciona un caso clínico compuesto por varias preguntas consecutivas (ej. Alexia o Dorita), traerá <strong>todas las preguntas del caso en su orden correcto</strong> para mantener la coherencia médica.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
              <button
                onClick={() => setShowSimulacroModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ color: 'var(--ink-soft)' }}
              >
                Cancelar
              </button>
              <button
                onClick={startRandomSimulacro}
                className="px-6 py-2.5 text-white font-bold rounded-xl text-sm transition-all shadow-sm hover:opacity-95"
                style={{ backgroundColor: 'var(--clay)' }}
              >
                Iniciar Simulacro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: RESUMEN DEL SIMULACRO
      ========================================== */}
      {showSimulacroSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div
            className="academic-card-elevated rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 text-center"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                backgroundColor: scorePercent >= 70 ? 'var(--sage-tint)' : 'var(--clay-tint)',
                color: scorePercent >= 70 ? 'var(--sage-deep)' : 'var(--clay-deep)'
              }}
            >
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl mb-1" style={{ color: 'var(--ink)' }}>
                Resultado del Simulacro
              </h3>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                Tiempo invertido: {formatTime(simulacroTimerSeconds)}
              </p>
            </div>

            <div
              className="grid grid-cols-3 gap-3 p-4 rounded-2xl border"
              style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line)' }}
            >
              <div>
                <span className="block text-xl font-bold" style={{ color: 'var(--ink)' }}>
                  {answeredInFilter.length} / {totalInFilter}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>Respondidas</span>
              </div>
              <div>
                <span className="block text-xl font-bold" style={{ color: 'var(--sage-deep)' }}>
                  {correctInFilter}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>Correctas</span>
              </div>
              <div>
                <span className="block text-xl font-bold" style={{ color: 'var(--clay-deep)' }}>
                  {answeredInFilter.length - correctInFilter}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--ink-faint)' }}>Incorrectas</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowSimulacroSummary(false);
                  setIsSimulacroActive(false);
                }}
                className="w-full py-2.5 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                style={{ backgroundColor: 'var(--clay)' }}
              >
                Volver al Modo Práctica
              </button>
              <button
                onClick={() => {
                  setShowSimulacroSummary(false);
                  setShowSimulacroModal(true);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all"
                style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
              >
                Iniciar Nuevo Simulacro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          LIGHTBOX PARA APUNTE ORIGINAL
      ========================================== */}
      {lightboxPage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between text-stone-200">
              <span className="text-xs font-semibold">
                Lámina Original Escaneada • Página {lightboxPage} (Apunte pág. {Math.max(1, lightboxPage - 3)})
              </span>
              <button
                onClick={() => setLightboxPage(null)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-950">
              <img
                src={`/scanned_pages/page_${lightboxPage.toString().padStart(3, '0')}.png`}
                alt={`Página ${lightboxPage}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-center text-stone-400 py-12 text-sm">
                No se pudo cargar la imagen escaneada de la página {lightboxPage}.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
