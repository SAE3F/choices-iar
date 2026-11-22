import React from 'react';
import { BookOpen, CheckCircle2, Activity, Brain, Stethoscope, RefreshCw, HelpCircle } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats, onResetStats }) {
  const navItems = [
    { id: 'quiz', label: 'Exámenes IAR', icon: CheckCircle2 },
    { id: 'bank', label: 'Mega Rejunte (Banco)', icon: HelpCircle },
    { id: 'theory', label: 'Teoría Completa', icon: BookOpen },
    { id: 'milestones', label: 'Neurodesarrollo', icon: Brain, hideOnMobile: 'hidden md:flex' },
    { id: 'labs', label: 'Laboratorio', icon: Activity, hideOnMobile: 'hidden lg:flex' },
  ];

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'rgba(255, 249, 241, 0.92)',
        borderColor: 'var(--line)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('quiz')}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              style={{
                backgroundColor: 'var(--clay)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className="font-display font-extrabold text-xl tracking-tight"
                  style={{ color: 'var(--ink)' }}
                >
                  Choices IAR
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    backgroundColor: 'var(--clay-tint)',
                    color: 'var(--clay-deep)',
                  }}
                >
                  Apuntes de Paz
                </span>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--ink-faint)' }}>
                Internado Anual Rotatorio • 26 Exámenes • 483 Choices
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${item.hideOnMobile || ''}`}
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
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Quick mini-stats pill */}
            <div
              className="hidden sm:flex items-center space-x-2 pl-3 ml-2 border-l text-xs"
              style={{ borderColor: 'var(--line)' }}
            >
              <span
                className="font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: 'var(--sage-tint)', color: 'var(--sage-deep)' }}
              >
                ✓ {stats.correct}
              </span>
              <span
                className="font-semibold px-2.5 py-1 rounded-lg"
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
          </nav>
        </div>
      </div>
    </header>
  );
}
