import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import QuizView from './components/QuizView';
import TheoryView from './components/TheoryView';
import MilestonesView from './components/MilestonesView';
import LabValuesView from './components/LabValuesView';
import QuestionBankView from './components/QuestionBankView';

import examsData from './data/exams.json';
import theoryData from './data/theory.json';
import milestonesData from './data/milestones.json';
import labValuesData from './data/lab_values.json';
import megaQuestionsData from './data/mega_question_bank.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('quiz');
  const [targetQuizArea, setTargetQuizArea] = useState('all');

  const getStatsFromStorage = () => {
    try {
      const userAnswers = JSON.parse(localStorage.getItem('iar_user_answers') || '{}');
      const values = Object.values(userAnswers);
      if (values.length > 0) {
        let correct = 0;
        let incorrect = 0;
        values.forEach(v => {
          if (v.isCorrect) correct++;
          else incorrect++;
        });
        return { correct, incorrect };
      }
      return JSON.parse(localStorage.getItem('iar_global_stats') || '{"correct": 0, "incorrect": 0}');
    } catch {
      return { correct: 0, incorrect: 0 };
    }
  };

  const [stats, setStats] = useState(getStatsFromStorage);

  // Keep navbar stats in sync with answers
  useEffect(() => {
    const handleStorageChange = () => {
      setStats(getStatsFromStorage());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      setStats(getStatsFromStorage());
    }, 1500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleResetStats = () => {
    if (window.confirm('¿Seguro que deseas reiniciar todas tus estadísticas, respuestas guardadas y marcadores?')) {
      const empty = { correct: 0, incorrect: 0 };
      setStats(empty);
      localStorage.setItem('iar_global_stats', JSON.stringify(empty));
      localStorage.removeItem('iar_user_answers');
      localStorage.removeItem('iar_bookmarks');
      window.location.reload();
    }
  };

  const handleGoToQuizArea = (areaName) => {
    setTargetQuizArea(areaName);
    setActiveTab('quiz');
  };

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#ffe1d1] selection:text-[#2f241c]"
      style={{ backgroundColor: 'var(--cream)', color: 'var(--ink)' }}
    >
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onResetStats={handleResetStats}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'quiz' && (
          <QuizView
            exams={examsData}
            megaQuestions={megaQuestionsData}
            initialArea={targetQuizArea}
          />
        )}

        {activeTab === 'theory' && (
          <TheoryView
            theory={theoryData}
            onGoToQuizArea={handleGoToQuizArea}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestonesView
            milestones={milestonesData}
          />
        )}

        {activeTab === 'labs' && (
          <LabValuesView
            labValues={labValuesData}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankView
            questions={megaQuestionsData}
          />
        )}
      </main>

      <footer
        className="border-t py-8 px-4 text-center text-xs"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--line)',
          color: 'var(--ink-faint)',
        }}
      >
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-display font-bold text-sm" style={{ color: 'var(--ink)' }}>
            Choices IAR • Plataforma de Estudio para el Internado Anual Rotatorio
          </p>
          <p>
            Digitalización integral basada en el <em>Apunte de Paz - IAR</em> (157 páginas).
            Incluye 26 exámenes choice (Septiembre 2020 a Diciembre 2023) y teoría médica con láminas originales.
          </p>
          <p className="text-[11px] pt-1">
            Nota: Las respuestas fueron cotejadas con las claves del apunte y consensos de estudiantes. Ante cualquier duda clínica, remitirse a la bibliografía médica oficial.
          </p>
        </div>
      </footer>
    </div>
  );
}
