import React, { useState, useEffect } from "react";
import { 
  Award, 
  BookOpen, 
  Sliders, 
  ExternalLink, 
  ArrowRight, 
  ChevronRight, 
  GraduationCap, 
  CheckSquare, 
  FileCheck2,
  Bookmark
} from "lucide-react";
import Navbar from "./components/Navbar";
import Auth from "./components/Auth";
import SyllabusReader from "./components/SyllabusReader";
import Calculators from "./components/Calculators";
import Dashboard from "./components/Dashboard";
import TestsManager from "./components/TestsManager";
import { User, Chapter, QuizTest } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "syllabus" | "tests" | "calculators" | "resources">("dashboard");
  const [selectedTopicPath, setSelectedTopicPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Syllabus state
  const [syllabus, setSyllabus] = useState<Chapter[]>([]);
  // Olympiad tests state
  const [tests, setTests] = useState<QuizTest[]>([]);

  // Always light theme as requested by the user
  const theme = "light";
  const toggleTheme = () => {};

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("myfmt_theme", "light");
  }, []);

  // Restore session & Fetch dynamic elements from the server
  useEffect(() => {
    const stored = localStorage.getItem("myfmt_user_session");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error("Stale session decode error:", e);
      }
    }

    // Fetch syllabus from server
    fetch("/api/syllabus")
      .then(res => res.json())
      .then(data => {
        if (data.syllabus) {
          setSyllabus(data.syllabus);
        }
      })
      .catch(uErr => console.error("Syllabus fetch error:", uErr));

    // Fetch tests from server
    fetch("/api/tests")
      .then(res => res.json())
      .then(data => {
        if (data.tests) {
          setTests(data.tests);
        }
      })
      .catch(tErr => console.error("Tests fetch error:", tErr));
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("myfmt_user_session", JSON.stringify(user));
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("myfmt_user_session");
  };

  // Synchronise stats update to Node database
  const handleUpdateStats = async (stats: { 
    completedChapters: string[]; 
    bookmarkedSubsections: string[]; 
    quizzesTaken?: number; 
    correctAnswers?: number; 
    streakDays?: number; 
    testScores?: any;
  }) => {
    if (!currentUser) return;

    try {
      const response = await fetch("/api/user/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          ...stats
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const updatedUser: User = {
          ...currentUser,
          studyStats: data.studyStats
        };
        setCurrentUser(updatedUser);
        localStorage.setItem("myfmt_user_session", JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Error communicating status update with backend Database:", e);
    }
  };

  // CMS Textbook handlers
  const handleSaveSyllabus = async (newSyllabus: Chapter[]) => {
    try {
      const res = await fetch("/api/syllabus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabus: newSyllabus })
      });
      const data = await res.json();
      if (data.success && data.syllabus) {
        setSyllabus(data.syllabus);
      }
    } catch (err) {
      console.error("Error updating textbook data:", err);
    }
  };

  // CMS Dynamic tests handlers
  const handleAddOrUpdateTest = async (test: Partial<QuizTest>) => {
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test })
      });
      const data = await res.json();
      if (data.success && data.tests) {
        setTests(data.tests);
      }
    } catch (err) {
      console.error("Error publishing test update:", err);
    }
  };

  const handleDeleteTest = async (id: string) => {
    try {
      const res = await fetch(`/api/tests/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success && data.tests) {
        setTests(data.tests);
      }
    } catch (err) {
      console.error("Error deleting test item:", err);
    }
  };

  const isDark = false;

  // Resources Data Setup
  const resourcesList = [
    {
      title: "Официальный сайт Олимпиад МО",
      desc: "Регламенты, списки приглашенных на туры РЭ и результаты оценки.",
      url: "https://olympmo.ru/olympiad-tasks.html",
      badge: "Официальный"
    },
    {
      title: "Задания ВсОШ заключительного тура по технологии",
      desc: "Актуальный архив теоретических, творческих и практических заданий по профилю ТТиТТ.",
      url: "https://vos.olimpiada.ru/tech/2025_2026",
      badge: "Архив 2025/26"
    },
    {
      title: "Официальные материалы ЦПМК",
      desc: "Методические рекомендации, требования к этапам, задания и критерии оценивания ВсОШ.",
      url: "https://vserosolimp.edsoo.ru/tehnologiya",
      badge: "Методические материалы"
    },
    {
      title: "Методическое Объединение Учителей МО",
      desc: "Стандарты ведения учебных проектов (ПЗ), пояснительных записок, патентов.",
      url: "https://t.me/uchebnik_TTTT_MO",
      badge: "Telegram-сообщество"
    },
    {
      title: "Подготовительный тренажер Quizlet",
      desc: "Экспресс-карточки заучивания типов цоколей, обозначений ГОСТов металлов.",
      url: "https://quizlet.com/join/f85t2RqdZ",
      badge: "Самопроверка"
    }
  ];

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white transition-colors duration-200 ${
      isDark ? "bg-slate-950 text-white dark" : "bg-slate-50 text-slate-800"
    }`}>
      {/* Header / Navbar */}
      <Navbar 
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTopic={setSelectedTopicPath}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Core Area */}
      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10">
        {!currentUser ? (
          <div className="flex flex-col items-center justify-center py-6 sm:py-12">
            
            {/* Header branding on landing */}
            <div className="text-center max-w-xl mb-6 select-none animate-fade-in space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-blue-500)] font-bold block">Система Теоретической Подготовки</span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                ВсОШ по Технологии
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 px-4 leading-relaxed">
                Сводная интерактивная база знаний (Портал Московской Области, Версия 2.0.1) для подготовки ко ВсОШ. Практикуйте интерактивные тесты с автоматическим разбором ошибок.
              </p>
            </div>
            
            <Auth onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dashboard Workspace */}
            {activeTab === "dashboard" && (
              <Dashboard 
                currentUser={currentUser}
                onUpdateStats={handleUpdateStats}
                setActiveTab={setActiveTab}
                setSelectedTopicPath={setSelectedTopicPath}
                tests={tests}
              />
            )}

            {/* Syllabus Book text Reader */}
            {activeTab === "syllabus" && (
              <SyllabusReader 
                currentUser={currentUser}
                syllabus={syllabus}
                onSaveSyllabus={handleSaveSyllabus}
                onUpdateStats={handleUpdateStats}
                selectedTopicPath={selectedTopicPath}
                setSelectedTopicPath={setSelectedTopicPath}
                searchQuery={searchQuery}
              />
            )}

            {/* Olympiad Test Simulator - Dynamic Complex Tests taker */}
            {activeTab === "tests" && (
              <TestsManager
                currentUser={currentUser}
                tests={tests}
                onAddOrUpdateTest={handleAddOrUpdateTest}
                onDeleteTest={handleDeleteTest}
                onUpdateStats={handleUpdateStats}
                onOpenMaterial={(subsectionId) => {
                  setSelectedTopicPath(subsectionId);
                  setActiveTab("syllabus");
                }}
              />
            )}

            {/* Inbuilt interactive calculators */}
            {activeTab === "calculators" && (
              <Calculators />
            )}

            {/* Training resources catalog links */}
            {activeTab === "resources" && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-slate-800 dark:text-slate-100 shadow-sm max-w-6xl mx-auto space-y-8 animate-fade-in">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-5.5 w-5.5 text-blue-500" />
                    Методические материалы и Регламент ВсОШ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed font-sans">
                    Сводка официальных интернет-платформ для подготовки к олимпиаде по технологии, интерактивные веяния БПЛА/Нейросети и пояснительные записки.
                  </p>
                </div>

                {/* Grid of preparation platforms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resourcesList.map((res, rIdx) => (
                    <a
                      key={rIdx}
                      href={res.url}
                      target="_blank"
                      rel="no-referrer"
                      className="p-5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 duration-200 border border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-700 rounded-lg group block text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/40">
                          {res.badge}
                        </span>
                        <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-500 transition" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-slate-900 dark:group-hover:text-white transition">
                        {res.title}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1.5 leading-relaxed">
                        {res.desc}
                      </p>
                    </a>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-6 text-center select-none text-xs text-slate-500 dark:text-slate-410 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <p className="font-sans leading-relaxed">
            © {new Date().getFullYear()} Олимпиадный портал «ВсОШ Технология». Создано при поддержке сборной Московской области.
          </p>
          <p className="font-mono text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-1">
            Координатор: Кондратьев А.А. • Версия Сборника 2.0.1 • ГОСТ РФ Стандарты
          </p>
        </div>
      </footer>
    </div>
  );
}
