import React from 'react';
import { BookOpen, CheckCircle2, Activity, Brain, Stethoscope, RefreshCw, HelpCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onResetStats }) {
  const navItems = [
    { id: 'quiz', label: 'Exámenes IAR', shortLabel: 'Exámenes', icon: CheckCircle2 },
    { id: 'bank', label: 'Mega Rejunte (Banco)', shortLabel: 'Mega Rejunte', icon: HelpCircle },
    { id: 'theory', label: 'Teoría Completa', shortLabel: 'Teoría', icon: BookOpen },
    { id: 'milestones', label: 'Neurodesarrollo', shortLabel: 'Neurodesarrollo', icon: Brain },
    { id: 'labs', label: 'Laboratorio', shortLabel: 'Laboratorio', icon: Activity },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'rgba(255, 249, 241, 0.94)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer min-w-0" onClick={() => setActiveTab('quiz')}>
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shrink-0"
              style={{
                backgroundColor: 'var(--clay)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span
                  className="font-display font-extrabold text-lg sm:text-xl tracking-tight truncate"
                  style={{ color: 'var(--ink)' }}
                >
                  Choices IAR
                </span>
                <span
                  className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0"
                  style={{
                    backgroundColor: 'var(--clay-tint)',
                    color: 'var(--clay-deep)',
                  }}
                >
                  Apuntes de Paz
                </span>
              </div>
              <p className="text-xs hidden lg:block" style={{ color: 'var(--ink-faint)' }}>
                Internado Anual Rotatorio • 26 Exámenes • 516 Choices
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--clay)',
                          color: '#fffdfa',
                          boxShadow: 'var(--shadow-sm)',
                        }
                      : {
                          color: 'var(--ink-soft)',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--cream-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mini-stats pill (visible on both mobile & desktop) */}
          <div
            className="flex items-center space-x-1.5 sm:space-x-2 pl-2 sm:pl-3 sm:border-l text-xs shrink-0"
            style={{ borderColor: 'var(--line)' }}
          >
            <span
              className="font-semibold px-2 py-1 rounded-lg"
              style={{ backgroundColor: 'var(--sage-tint)', color: 'var(--sage-deep)' }}
            >
              ✓ {stats.correct}
            </span>
            <span
              className="font-semibold px-2 py-1 rounded-lg"
              style={{ backgroundColor: 'var(--clay-tint)', color: 'var(--clay-deep)' }}
            >
              ✗ {stats.incorrect}
            </span>
            <button
              title="Reiniciar estadísticas"
              onClick={onResetStats}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--ink-faint)' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip: all 5 sections easily reachable */}
        <nav className="flex md:hidden items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 border"
                style={
                  isActive
                    ? {
                        backgroundColor: 'var(--clay)',
                        color: '#fffdfa',
                        borderColor: 'var(--clay)',
                        boxShadow: 'var(--shadow-sm)',
                      }
                    : {
                        backgroundColor: 'var(--cream)',
                        color: 'var(--ink-soft)',
                        borderColor: 'var(--line)',
                      }
                }
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
