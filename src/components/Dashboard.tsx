import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Trash2, 
  Flame, 
  GraduationCap, 
  Bookmark, 
  BookOpen, 
  Award,
  ExternalLink,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  FileText,
  Edit2,
  Save,
  X
} from "lucide-react";
import { User, RegistrationRequest, QuizTest } from "../types";

interface DashboardProps {
  currentUser: User | null;
  onUpdateStats: (stats: { 
    completedChapters: string[]; 
    bookmarkedSubsections: string[]; 
    quizzesTaken?: number; 
    correctAnswers?: number; 
    streakDays?: number; 
    testScores?: any;
  }) => void;
  setActiveTab: (tab: "syllabus" | "dashboard" | "tests" | "calculators" | "resources") => void;
  setSelectedTopicPath: (path: string) => void;
  tests?: QuizTest[];
}

export default function Dashboard({
  currentUser,
  onUpdateStats,
  setActiveTab,
  setSelectedTopicPath,
  tests = []
}: DashboardProps) {
  // Admin Lists
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [usersList, setUsersList] = useState<Omit<User, "passwordHash">[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // News States
  const [news, setNews] = useState<{
    title: string;
    content: string;
    documentUrl?: string;
    documentName?: string;
    updatedAt: string;
  } | null>(null);
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [newsEditBuffer, setNewsEditBuffer] = useState<{
    title: string;
    content: string;
    documentUrl?: string;
    documentName?: string;
    updatedAt: string;
  } | null>(null);

  // Fetch News Announcement
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (data.news) {
          setNews(data.news);
        }
      })
      .catch((err) => console.error("Error reading news:", err));
  }, []);

  const handleSaveNews = async () => {
    if (!newsEditBuffer) return;
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: newsEditBuffer })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNews(data.news);
        setIsEditingNews(false);
        setNewsEditBuffer(null);
        setSuccessMsg("Главная актуальная новость успешно сохранена!");
      } else {
        setErrorMsg("Ошибка при сохранении новости");
      }
    } catch (e) {
      setErrorMsg("Ошибка связи при сохранении новости.");
    }
  };

  // Live Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizActiveFinished] = useState(false);

  const mockQuizQuestions = [
    {
      q: "Какое процентное содержание углерода отличает чугун от стали?",
      options: ["Менее 0.8%", "От 0.8% до 2.0%", "Более 2.14% до 6.67%", "Чугун не содержит углерода"],
      correct: 2,
      explanation: "Согласно ГОСТу, чугун — железоуглеродистый сплав, содержащий более 2.14% углерода до предела 6.67%."
    },
    {
      q: "Какой буквой в обозначении марок конструкционных сталей маркируется Марганец?",
      options: ["М", "Г", "Мн", "Р"],
      correct: 1,
      explanation: "Марганец в марках легированных сталей по ГОСТУ обозначается буквой 'Г' (например, сталь Г13)."
    },
    {
      q: "Какой класс эмиссии формальдегида у древесных плит ОСП (OSB) является наиболее экологичным?",
      options: ["Класс E0 (менее 0.04 мг / 100г)", "Класс E1", "Класс E2", "Класс E3"],
      correct: 0,
      explanation: "Класс Е0 гарантирует минимальные испарения формальдегида (0.03-0.04 мг на 100 гр сухого материала)."
    },
    {
      q: "Какой тип резьбы обозначается латинской буквой 'G'?",
      options: ["Метрическая", "Упорная", "Трубная цилиндрическая", "Круглая"],
      correct: 2,
      explanation: "По ГОСТу буква 'G' используется для обозначения трубной цилиндрической резьбы."
    },
    {
      q: "В чем разница приборов штангенциркуля ШЦ-I и ШЦ-II по конструкции?",
      options: ["ШЦ-I не имеет нониуса", "ШЦ-II оснащен рамкой микрометрической подачи для точной фиксации и не имеет глубиномера", "ШЦ-II длиннее на 300 мм", "ШЦ-I не имеет нижних губок"],
      correct: 1,
      explanation: "У ШЦ-II отсутствуют выдвижные измерительные штанги глубиномера в пользу губок с закруглением на промеры и дополнительной рамки точной подачи."
    }
  ];

  // Fetch lists for administrators
  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchAdminData();
    }
  }, [currentUser]);

  const fetchAdminData = async () => {
    try {
      const respReq = await fetch("/api/admin/requests");
      const dataReq = await respReq.json();
      setRequests(dataReq.requests || []);

      const respUsers = await fetch("/api/admin/users");
      const dataUsers = await respUsers.json();
      setUsersList(dataUsers.users || []);
    } catch (e) {
      console.error("Error fetching administrative profiles list:", e);
    }
  };

  const handleResolveRequest = async (id: string, decision: "approved" | "rejected") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await fetch("/api/admin/requests/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: decision })
      });

      const result = await response.json();
      if (response.ok) {
        setSuccessMsg(
          decision === "approved" 
            ? "Ученик успешно зарегистрирован и получил доступ к материалам портала!" 
            : "Заявка на добавление ученика в систему была отклонена"
        );
        fetchAdminData();
      } else {
        setErrorMsg(result.error || "Произошла непредвиденная ошибка");
      }
    } catch (e) {
      setErrorMsg("Ошибка связи с сервером.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!window.confirm("Вы уверены, что хотите лишить этого участника доступа к порталу?")) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg("Доступ участника к олимпиадному порталу успешно заблокирован");
        fetchAdminData();
      } else {
        setErrorMsg(data.error || "Не удалось исключить пользователя");
      }
    } catch (e) {
      setErrorMsg("Ошибка исключения пользователя.");
    }
  };

  const handleQuizAnswer = (idx: number) => {
    setSelectedAnswerIndex(idx);
    if (idx === mockQuizQuestions[currentQuestionIndex].correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswerIndex(null);
    if (currentQuestionIndex + 1 < mockQuizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizActiveFinished(true);
      // Persist results to backend!
      if (currentUser?.studyStats) {
        const prevTaken = currentUser.studyStats.quizzesTaken || 0;
        const prevAnswers = currentUser.studyStats.correctAnswers || 0;
        onUpdateStats({
          completedChapters: currentUser.studyStats.completedChapters || [],
          bookmarkedSubsections: currentUser.studyStats.bookmarkedSubsections || [],
          quizzesTaken: prevTaken + 1,
          correctAnswers: prevAnswers + score,
          testScores: currentUser.studyStats.testScores || {}
        });
      }
    }
  };

  const resetQuiz = () => {
    setQuizActive(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setScore(0);
    setQuizActiveFinished(false);
  };

  const completedCount = currentUser?.studyStats?.completedChapters?.length || 0;
  const bookmarksCount = currentUser?.studyStats?.bookmarkedSubsections?.length || 0;
  const streak = currentUser?.studyStats?.streakDays || 1;
  const testScores = currentUser?.studyStats?.testScores || {};
  const testIdsTaken = Object.keys(testScores);

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-container">
      {/* Alert logs */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* One primary information surface: annual theme and current news */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" id="news-hero-block">
        <button
          type="button"
          onClick={() => {
            setSelectedTopicPath("project.1.1");
            setActiveTab("syllabus");
          }}
          className="w-full px-6 py-5 text-left transition hover:bg-slate-50"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-700">Тема творческого проекта 2026/2027</span>
              <h2 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">«Технологии прошлого — традиции будущего»</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">Обязательная тема на всех этапах олимпиады.</p>
            </div>
            <span className="shrink-0 text-sm font-medium text-blue-700">Открыть требования →</span>
          </div>
        </button>

        {/* Main news shares the same information surface */}
        {news && (
        <div className="border-t border-slate-200 px-6 py-5" id="news-content-block">

          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-700">Главная новость сборной</span>
              <p className="mt-1 text-xs text-slate-400">Обновлено {new Date(news.updatedAt || Date.now()).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            {currentUser?.role === "admin" && !isEditingNews && (
              <button
                onClick={() => {
                  setNewsEditBuffer({ ...news });
                  setIsEditingNews(true);
                }}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Редактировать</span>
              </button>
            )}
          </div>

          {isEditingNews && newsEditBuffer ? (
            <div className="mt-2 space-y-4 rounded-lg bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-800">Редактирование главной новости</h4>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1">Заголовок новости</label>
                <input
                  type="text"
                  value={newsEditBuffer.title}
                  onChange={(e) => setNewsEditBuffer({ ...newsEditBuffer, title: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded p-2 text-sm focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1">Текст новости</label>
                <textarea
                  rows={4}
                  value={newsEditBuffer.content}
                  onChange={(e) => setNewsEditBuffer({ ...newsEditBuffer, content: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded p-2 text-xs leading-relaxed focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1">Ссылка на документ / Yandex Диск (необязательно)</label>
                  <input
                    type="text"
                    value={newsEditBuffer.documentUrl || ""}
                    onChange={(e) => setNewsEditBuffer({ ...newsEditBuffer, documentUrl: e.target.value })}
                    placeholder="https://example.com/info.pdf"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded p-2 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1">Название ссылки / документа</label>
                  <input
                    type="text"
                    value={newsEditBuffer.documentName || ""}
                    onChange={(e) => setNewsEditBuffer({ ...newsEditBuffer, documentName: e.target.value })}
                    placeholder="Скачать регламент ВсОШ"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded p-2 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => {
                    setIsEditingNews(false);
                    setNewsEditBuffer(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Отмена</span>
                </button>
                <button
                  onClick={async () => {
                    const finalBuffer = {
                      ...newsEditBuffer,
                      updatedAt: new Date().toISOString()
                    };
                    try {
                      const res = await fetch("/api/news", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ news: finalBuffer })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        setNews(data.news);
                        setIsEditingNews(false);
                        setNewsEditBuffer(null);
                        setSuccessMsg("Главная актуальная новость успешно сохранена!");
                      } else {
                        setErrorMsg("Ошибка при сохранении новости");
                      }
                    } catch (e) {
                      setErrorMsg("Ошибка связи при сохранении новости.");
                    }
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Сохранить новость</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {news.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {news.content}
              </p>

              {news.documentUrl && (
                <div className="flex items-start pt-1">
                  <a 
                    href={news.documentUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-900"
                  >
                    <FileText className="h-4.5 w-4.5 shrink-0" />
                    <span>{news.documentName || "Открыть прикрепленный файл"}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-60 ml-0.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </section>

      {/* Grid of Profile Metadata and Progress */}
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:grid-cols-12">
        
        {/* Left Column: User details and Stats */}
        <div className="flex flex-col justify-between p-6 text-slate-800 md:col-span-8">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="text-blue-600">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Привет, {currentUser?.firstName}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                  Твой статус в проекте: <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono">
                    {currentUser?.role === "admin" ? "Куратор Сборной МО" : "Участник олимпиадной сборной"}
                  </span>
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Продолжайте подготовку в справочнике, калькуляторах и тестах. Основные показатели сохраняются в профиле.
            </p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-4 sm:divide-y-0">
            <div className="px-3 py-3 text-center">
              <span className="block text-xs text-slate-500">Активность</span>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-slate-800">
                <Flame className="h-4 w-4 text-slate-400" />
                <span className="text-base font-semibold">{streak} дней</span>
              </div>
            </div>
            <div className="px-3 py-3 text-center">
              <span className="block text-xs text-slate-500">Изучено</span>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-slate-800">
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span className="text-base font-semibold">{completedCount} / 10</span>
              </div>
            </div>
            <div className="px-3 py-3 text-center">
              <span className="block text-xs text-slate-500">Закладки</span>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-slate-800">
                <Bookmark className="h-4 w-4 text-slate-400" />
                <span className="text-base font-semibold">{bookmarksCount}</span>
              </div>
            </div>
            <div className="px-3 py-3 text-center">
              <span className="block text-xs text-slate-500">Верные ответы</span>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-slate-800">
                <Award className="h-4 w-4 text-slate-400" />
                <span className="text-base font-semibold">
                  {currentUser?.studyStats?.correctAnswers || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fast Prep Resources Links */}
        <div className="flex flex-col justify-between border-t border-slate-200 p-6 text-slate-850 md:col-span-4 md:border-l md:border-t-0">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Быстрые ресурсы</h3>
            
            <div className="divide-y divide-slate-200">
              <a 
                href="https://disk.yandex.ru/d/sIpnUO5KKz9ibA" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 py-3 text-left transition hover:text-blue-700"
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Яндекс.Диск Сборной</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Чертежи, образцы ПЗ, технологические карты</span>
                </div>
              </a>

              <a 
                href="https://quizlet.com/join/f85t2RqdZ" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 py-3 text-left transition hover:text-blue-700"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Карточки подготовки</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Терминология металлургии, древесины и БПЛА</span>
                </div>
              </a>

              <a 
                href="https://t.me/uchebnik_TTTT_MO" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3 py-3 text-left transition hover:text-blue-700"
              >
                <Users className="h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">Региональный методист</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Задания Московской области и вопросы кураторам</span>
                </div>
              </a>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-400">
            <span>Автор: Кондратьев А. @Kondratiev_AA</span>
          </div>
        </div>
      </div>

      {/* STUDENT'S METRICS: DETAILED TEST RESULTS FROM OLYMPIAD SIMULATOR */}
      {currentUser && (
        <div className="space-y-4 border-t border-slate-200 pt-6 text-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Дневник результатов олимпиадных тестов куратора
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Подробные оценки по итогам каждого решенного теста из системы симуляции.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("tests")}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Перейти к тестам →
            </button>
          </div>

          {testIdsTaken.length === 0 ? (
            <div className="rounded-lg bg-slate-100 p-6 text-center">
              <Award className="h-10 w-10 text-slate-400 mx-auto mb-2.5" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Вы пока не проходили симуляционные тесты</p>
              <p className="text-[10px] text-slate-400 mt-1">Откройте вкладку «Тест-тренажер» в верхнем меню, решите один из тестов, и ваш балл появится здесь.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testIdsTaken.map((tId) => {
                const info = testScores[tId];
                const matchedTest = tests.find((t) => t.id === tId);
                const percentage = info.total > 0 ? Math.round((info.score / info.total) * 100) : 0;
                
                return (
                  <div key={tId} className="space-y-3 rounded-lg bg-white p-4 shadow-sm">
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white line-clamp-1 leading-snug">
                        {matchedTest ? matchedTest.title : `Тест: ID ${tId}`}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Решен: {info.takenAt || "Недавно"}
                      </span>
                    </div>

                    <div className="flex justify-between items-end pt-1">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Оценка за тест</span>
                        <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {info.score} / {info.total}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        percentage >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25" :
                        percentage >= 50 ? "bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-500/25" :
                        "bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-500/25"
                      }`}>
                        {percentage}% верно
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin registration requests & users management list */}
      {currentUser?.role === "admin" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 text-slate-800 dark:text-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-150 dark:border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Административная панель куратора
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Одобрение заявок на вход и аудит результатов</p>
            </div>
            <span className="font-mono text-[9px] px-2.5 py-1 rounded bg-amber-550/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800">
              РЕЖИМ КУРАТОРА
            </span>
          </div>

          {/* Pending registration requests queue */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs text-slate-500 dark:text-slate-350 block uppercase tracking-wider">
              Заявки на регистрацию ({requests.filter(r => r.status === "pending").length})
            </h4>

            {requests.filter(r => r.status === "pending").length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850">
                Новых заявок на регистрацию нет. Попросите учащихся зарегистрироваться на портале с указанием имени и фамилии.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.filter(r => r.status === "pending").map((req) => (
                  <div key={req.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-855 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-105 block">
                        {req.lastName} {req.firstName}
                      </span>
                      <span className="text-[11px] text-slate-450 dark:text-slate-400 font-mono block mt-0.5">
                        {req.email}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-1 font-mono">
                        Подана: {new Date(req.createdAt).toLocaleDateString("ru-RU")}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleResolveRequest(req.id, "approved")}
                        className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-800 rounded-md transition cursor-pointer"
                        title="Подтвердить и внести в систему"
                      >
                        <UserCheck className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleResolveRequest(req.id, "rejected")}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 border border-rose-300 dark:border-rose-800 rounded-md transition cursor-pointer"
                        title="Отклонить"
                      >
                        <UserX className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active system users statistics monitor */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-sans font-bold text-xs text-slate-450 dark:text-slate-350 block uppercase tracking-wider">
              Зарегистрированные участники сборной ({usersList.length})
            </h4>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-850 rounded-lg">
              <table className="min-w-full divide-y divide-slate-150 dark:divide-slate-800 text-left text-xs bg-slate-50 dark:bg-slate-950">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <th className="px-4 py-2.5 font-semibold">Участник</th>
                    <th className="px-4 py-2.5 font-semibold">Электронная почта</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Олимпиады (Разделы)</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Тесты (Верно)</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Стрейк</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Управление</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-155 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300">
                      <td className="px-4 py-2.5 font-bold">
                        {user.lastName} {user.firstName}
                        {user.role === "admin" && (
                          <span className="ml-1.5 text-[8px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-305 dark:border-amber-800 rounded px-1 uppercase shrink-0 font-mono font-bold">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{user.email}</td>
                      <td className="px-4 py-2.5 text-center text-blue-600 dark:text-blue-400 font-bold font-mono">
                        {user.studyStats?.completedChapters?.length || 0} / 10
                      </td>
                      <td className="px-4 py-2.5 text-center text-green-600 dark:text-green-450 font-bold font-mono">
                        {user.studyStats?.quizzesTaken || 0} ({user.studyStats?.correctAnswers || 0})
                      </td>
                      <td className="px-4 py-2.5 text-center text-orange-505 dark:text-orange-400 font-bold font-mono">
                        {user.studyStats?.streakDays || 1}д.
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {user.role !== "admin" ? (
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            className="p-1 hover:bg-rose-50 dark:hover:bg-red-950 text-red-500 hover:text-red-600 rounded cursor-pointer transition-colors"
                            title="Исключить из сборной"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-650 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive training simulator based on Section 5 & 6 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl p-6 text-slate-800 dark:text-slate-105 shadow-sm">
        {!quizActive ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-blue-500" />
                Олимпиадная блиц-проверка (ГОСТы и основы)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans max-w-xl">
                Быстрая оценка базовой подготовки! Тест в реальном времени содержит 5 вопросов по порокам древесины, кристаллической структуре чугунов и ГОСТ-обозначениям.
              </p>
            </div>
            <button
              onClick={() => setQuizActive(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-lg shadow-md hover:shadow-blue-500/25 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <PlayCircle className="h-4.5 w-4.5" />
              Запустить блиц-тест
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3 mb-2 animate-fade-in">
              <span className="font-mono text-[10px] text-slate-400 block uppercase">
                Вопрос {currentQuestionIndex + 1} из {mockQuizQuestions.length}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
                Правильных ответов: {score}
              </span>
            </div>

            {!quizFinished ? (
              <div className="space-y-4">
                <h4 className="text-sm sm:text-base font-bold text-slate-850 dark:text-slate-100 font-sans">
                  {mockQuizQuestions[currentQuestionIndex].q}
                </h4>

                <div className="space-y-2">
                  {mockQuizQuestions[currentQuestionIndex].options.map((option, oIdx) => {
                    let btnClass = "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-350 text-slate-700 dark:text-slate-200";
                    if (selectedAnswerIndex !== null) {
                      if (oIdx === mockQuizQuestions[currentQuestionIndex].correct) {
                        btnClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold";
                      } else if (oIdx === selectedAnswerIndex) {
                        btnClass = "bg-rose-500/10 border-rose-500/30 text-rose-650 dark:text-rose-455";
                      } else {
                        btnClass = "opacity-55 bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={selectedAnswerIndex !== null}
                        onClick={() => handleQuizAnswer(oIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between cursor-pointer ${btnClass}`}
                      >
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedAnswerIndex !== null && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl animate-fade-in space-y-1.5 text-xs text-slate-700 dark:text-slate-305">
                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold block">Инженерное разбор-объяснение:</span>
                    <p className="leading-relaxed font-sans font-medium">
                      {mockQuizQuestions[currentQuestionIndex].explanation}
                    </p>
                    <button
                      onClick={handleNextQuizQuestion}
                      className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-750 rounded-lg text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Далее</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <span className="font-mono text-3xl font-extrabold text-blue-600 dark:text-blue-400 block">
                  {score} / {mockQuizQuestions.length}
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-850 dark:text-white font-sans">Тестирование успешно завершено!</h4>
                  <p className="text-xs text-slate-450 dark:text-slate-400 font-sans mt-1">
                    Ваши правильные варианты учтены и сохранены в общей статистике подготовки. Так держать!
                  </p>
                </div>
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl text-xs text-slate-700 dark:text-slate-305 transition cursor-pointer"
                >
                  Пройти тест заново
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
