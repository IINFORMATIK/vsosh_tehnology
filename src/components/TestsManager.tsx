import React, { useState } from "react";
import { 
  FileCheck2, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Play, 
  Award, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  HelpCircle,
  Save,
  Check,
  RotateCcw,
  BookOpen,
  BarChart3,
  Target
} from "lucide-react";
import { User, QuizTest, QuizQuestion } from "../types";

interface TestsManagerProps {
  currentUser: User | null;
  tests: QuizTest[];
  onAddOrUpdateTest: (test: Partial<QuizTest>) => Promise<void>;
  onDeleteTest: (id: string) => Promise<void>;
  onUpdateStats: (updatedStats: any) => Promise<void>;
  onOpenMaterial: (subsectionId: string) => void;
}

export default function TestsManager({
  currentUser,
  tests,
  onAddOrUpdateTest,
  onDeleteTest,
  onUpdateStats,
  onOpenMaterial
}: TestsManagerProps) {
  const isAdmin = currentUser?.role === "admin";
  const userScores = currentUser?.studyStats?.testScores || {};

  // Navigation states: "list" | "active-test" | "edit-test"
  const [viewState, setViewState] = useState<"list" | "active-test" | "edit-test">("list");
  
  // Test playing states
  const [selectedTest, setSelectedTest] = useState<QuizTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completedTestResult, setCompletedTestResult] = useState<{ score: number; total: number } | null>(null);
  const [answerLog, setAnswerLog] = useState<Array<{ questionIndex: number; selected: number; correct: boolean }>>([]);
  const [topicFilter, setTopicFilter] = useState("Все темы");

  const topics = ["Все темы", ...Array.from(new Set(tests.map((test) => test.topic || "Общие")))];
  const visibleTests = topicFilter === "Все темы"
    ? tests
    : tests.filter((test) => (test.topic || "Общие") === topicFilter);

  // Admin Editing/Creation states
  const [editingTest, setEditingTest] = useState<Partial<QuizTest>>({
    title: "",
    description: "",
    questions: []
  });

  // Admin question edit index helper
  const [activeQuestionEditIndex, setActiveQuestionEditIndex] = useState<number | null>(null);

  // Start test playing session
  const startTest = (test: QuizTest) => {
    setSelectedTest(test);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setCompletedTestResult(null);
    setAnswerLog([]);
    setViewState("active-test");
  };

  // Submit response
  const handleAnswerSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
  };

  const checkAnswer = () => {
    if (selectedOption === null || isAnswered || !selectedTest) return;
    const isCorrect = selectedOption === selectedTest.questions[currentQuestionIndex].correct;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    setAnswerLog(prev => [...prev, { questionIndex: currentQuestionIndex, selected: selectedOption, correct: isCorrect }]);
    setIsAnswered(true);
  };

  const getQuestionLevel = (question: QuizQuestion, index: number, total: number) =>
    question.level || (index < Math.ceil(total / 2) ? "basic" : "advanced");

  const getLevelResult = (level: "basic" | "advanced") => {
    if (!selectedTest) return { score: 0, total: 0 };
    const indexes = selectedTest.questions
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => getQuestionLevel(question, index, selectedTest.questions.length) === level)
      .map(({ index }) => index);
    return {
      total: indexes.length,
      score: answerLog.filter((answer) => indexes.includes(answer.questionIndex) && answer.correct).length
    };
  };

  const handleNextQuestion = async () => {
    if (!selectedTest) return;
    
    if (currentQuestionIndex + 1 < selectedTest.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Test ended! Save stats
      const finalScore = correctCount;
      const totalQuestions = selectedTest.questions.length;
      setCompletedTestResult({ score: finalScore, total: totalQuestions });

      // Save to backend stats
      if (currentUser) {
        const nextTestScores = {
          ...userScores,
          [selectedTest.id]: {
            score: finalScore,
            total: totalQuestions,
            takenAt: new Date().toLocaleDateString("ru-RU"),
            levels: {
              basic: getLevelResult("basic"),
              advanced: getLevelResult("advanced")
            }
          }
        };

        const totalQuizzesTaken = (currentUser.studyStats?.quizzesTaken || 0) + 1;
        const totalCorrectAnswers = (currentUser.studyStats?.correctAnswers || 0) + finalScore;

        await onUpdateStats({
          quizzesTaken: totalQuizzesTaken,
          correctAnswers: totalCorrectAnswers,
          testScores: nextTestScores
        });
      }
    }
  };

  // Admin triggers: Create Test
  const handleCreateNewTestBtn = () => {
    setEditingTest({
      title: "",
      description: "",
      questions: [
        {
          q: "Новый вопрос по технологическим процессам?",
          options: ["Вариант А", "Вариант Б", "Вариант В", "Вариант Г"],
          correct: 0,
          explanation: "Пояснение с инженерной точки зрения..."
        }
      ]
    });
    setActiveQuestionEditIndex(0);
    setViewState("edit-test");
  };

  // Admin triggers: Edit Test
  const handleEditTestBtn = (test: QuizTest) => {
    setEditingTest(JSON.parse(JSON.stringify(test))); // Deep clone
    setActiveQuestionEditIndex(test.questions.length > 0 ? 0 : null);
    setViewState("edit-test");
  };

  // Add question to edited test
  const handleAddQuestionToEdit = () => {
    const newQ: QuizQuestion = {
      q: "Введите вопрос?",
      options: ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
      correct: 0,
      explanation: "ГОСТ или формула для аргументации..."
    };
    const nextQs = [...(editingTest.questions || []), newQ];
    setEditingTest({ ...editingTest, questions: nextQs });
    setActiveQuestionEditIndex(nextQs.length - 1);
  };

  // Remove question from edited test
  const handleRemoveQuestionFromEdit = (index: number) => {
    const nextQs = (editingTest.questions || []).filter((_, i) => i !== index);
    setEditingTest({ ...editingTest, questions: nextQs });
    if (activeQuestionEditIndex === index) {
      setActiveQuestionEditIndex(nextQs.length > 0 ? 0 : null);
    } else if (activeQuestionEditIndex !== null && activeQuestionEditIndex > index) {
      setActiveQuestionEditIndex(activeQuestionEditIndex - 1);
    }
  };

  // Save admin work
  const handleSaveTest = async () => {
    if (!editingTest.title) {
      alert("Пожалуйста, укажите название теста");
      return;
    }
    if (!editingTest.questions || editingTest.questions.length === 0) {
      alert("Тест должен содержать как минимум один вопрос");
      return;
    }
    await onAddOrUpdateTest(editingTest);
    setViewState("list");
  };

  return (
    <div id="tests-section" className="space-y-6 sm:py-2">
      {/* HEADER DESIGN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-blue-500" />
            Олимпиадный тест-тренажёр
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Интерактивный комплекс подготовки к теоретическому туру ВсОШ. Проверяйте свои силы на реальных вопросах с подробным анализом каждого ответа.
          </p>
        </div>
        {isAdmin && viewState === "list" && (
          <button
            onClick={handleCreateNewTestBtn}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all shadow-md shadow-blue-500/10 hover:shadow-lg cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Создать тест
          </button>
        )}
      </div>

      {/* VIEW: TEST LIST */}
      {viewState === "list" && (
        <div className="space-y-5">
          {topics.length > 2 && (
            <div className="flex flex-wrap gap-2" aria-label="Фильтр тестов по темам">
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTopicFilter(topic)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    topicFilter === topic
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {tests.length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-10 text-center">
              <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium text-base">Тестов пока нет</p>
              <p className="text-slate-400 text-xs mt-1">Добавьте тесты в качестве администратора, чтобы ученики могли проходить их.</p>
            </div>
          ) : (
            visibleTests.map((test) => {
              const playedInfo = userScores[test.id];
              return (
                <div 
                  key={test.id} 
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
                >
                  <div className="space-y-3">
                    <div>
                      {test.topic && (
                        <span className="mb-2 block text-xs font-medium text-blue-700">
                          {test.topic}
                        </span>
                      )}
                      <h3 className="text-base font-semibold leading-snug text-slate-900">
                        {test.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>{test.questions.length} вопросов</span>
                      {playedInfo ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Результат: {playedInfo.score}/{playedInfo.total} · {playedInfo.total ? Math.round((playedInfo.score / playedInfo.total) * 100) : 0}%
                        </span>
                      ) : (
                        <span>Прогресс: не начат</span>
                      )}
                    </div>
                    {(test.relatedSubsectionIds?.length || test.sourceLabel || test.coverageNote) ? <details className="text-xs text-slate-500"><summary className="w-fit cursor-pointer font-medium text-blue-700 hover:text-blue-800">Материалы</summary><div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">{test.relatedSubsectionIds?.length ? <div className="flex flex-wrap items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-blue-500" /><span>Повторить:</span>{test.relatedSubsectionIds.map((subsectionId) => <button key={subsectionId} type="button" onClick={() => onOpenMaterial(subsectionId)} className="rounded border border-blue-200 bg-white px-1.5 py-0.5 font-mono font-bold text-blue-700">{subsectionId}</button>)}</div> : null}{test.sourceLabel ? <p>Основа вопросов: {test.sourceLabel}</p> : null}{test.coverageNote ? <p className="text-amber-800">{test.coverageNote}</p> : null}</div></details> : null}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => startTest(test)}
                      className={`flex items-center gap-1.5 font-medium py-1.5 px-4 rounded-lg text-xs transition cursor-pointer ${
                        playedInfo 
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-250 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <Play className="h-3 w-3 fill-current" />
                      {playedInfo ? "Пройти повторно" : "Начать тренажер"}
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditTestBtn(test)}
                          title="Редактировать"
                          className="p-1.5 text-slate-450 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Вы уверены, что хотите удалить тест "${test.title}"?`)) {
                              await onDeleteTest(test.id);
                            }
                          }}
                          title="Удалить"
                          className="p-1.5 text-slate-450 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      )}

      {/* VIEW: PLAY ACTIVE TEST */}
      {viewState === "active-test" && selectedTest && (
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md">
          {/* Active Test Score Board on completion */}
          {completedTestResult ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-content justify-center mx-auto shadow-inner">
                <Award className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-850 dark:text-slate-100">Тест завершен!</h2>
                <p className="text-slate-550 dark:text-slate-400 text-sm">Мы записали ваш результат в дневник подготовки.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-100 dark:border-slate-850 max-w-sm mx-auto">
                <span className="text-slate-400 text-xs font-mono tracking-wider uppercase block">Итоговый результат</span>
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
                  {completedTestResult.score} / {completedTestResult.total}
                </span>
                <span className="text-xs text-slate-400 font-mono mt-1 block">
                  Правильных ответов: {Math.round((completedTestResult.score / completedTestResult.total) * 100)}%
                </span>
              </div>

              <div className="max-w-2xl mx-auto space-y-4 text-left">
                <div className="flex items-center gap-2 font-bold text-slate-900"><BarChart3 className="h-5 w-5 text-blue-600" />Анализ результатов</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["basic", "advanced"] as const).map((level) => {
                    const result = getLevelResult(level);
                    const percent = result.total ? Math.round(result.score / result.total * 100) : 0;
                    return <div key={level} className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 flex justify-between gap-3"><span className="font-bold text-slate-800">{level === "basic" ? "1. Базовые знания" : "2. Применение знаний"}</span><span className="font-mono text-blue-700">{result.score}/{result.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-slate-500">{percent >= 80 ? "Уровень усвоен уверенно." : percent >= 60 ? "Основа есть, но нужна тренировка." : "Темы этого уровня стоит повторить."}</p></div>;
                  })}
                </div>
                {answerLog.some((answer) => !answer.correct) ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="mb-3 flex items-center gap-2 font-bold text-amber-900"><Target className="h-4 w-4" />Ошибки для разбора</div><div className="space-y-3">{answerLog.filter((answer) => !answer.correct).map((answer) => { const question = selectedTest.questions[answer.questionIndex]; return <div key={answer.questionIndex} className="border-t border-amber-200 pt-3 first:border-0 first:pt-0"><p className="text-sm font-medium text-slate-800">{answer.questionIndex + 1}. {question.q}</p><p className="mt-1 text-xs text-rose-700">Ваш ответ: {question.options[answer.selected]}</p><p className="text-xs text-emerald-700">Правильный ответ: {question.options[question.correct]}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{question.explanation}</p></div>; })}</div>{selectedTest.relatedSubsectionIds?.length ? <div className="mt-4 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-amber-900">Повторить:</span>{selectedTest.relatedSubsectionIds.map((id) => <button key={id} type="button" onClick={() => onOpenMaterial(id)} className="rounded-md border border-blue-200 bg-white px-2 py-1 font-mono text-xs font-bold text-blue-700">{id}</button>)}</div> : null}</div> : <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Все ответы верны — пробелов по теме теста не обнаружено.</div>}
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => startTest(selectedTest)}
                  className="flex items-center gap-2 text-xs font-medium border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-2 px-5 rounded-lg transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Повторить тест
                </button>
                <button
                  onClick={() => setViewState("list")}
                  className="flex items-center gap-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg transition shadow"
                >
                  Вернуться к списку
                </button>
              </div>
            </div>
          ) : (
            // Quiz gameplay
            <div className="space-y-6">
              {/* Quiz Header Info */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <button
                  onClick={() => setViewState("list")}
                  className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Назад к списку
                </button>
                <div className="font-mono text-xs text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-850">
                  Вопрос {currentQuestionIndex + 1} из {selectedTest.questions.length}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / selectedTest.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono tracking-widest text-blue-600 dark:text-blue-400 uppercase font-bold block">Теоретический вопрос</span>
                <span className="inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  {getQuestionLevel(selectedTest.questions[currentQuestionIndex], currentQuestionIndex, selectedTest.questions.length) === "basic" ? "Уровень 1 · Базовые знания" : "Уровень 2 · Применение знаний"}
                </span>
                <h3 className="font-sans font-bold text-slate-900 dark:text-slate-100 text-lg leading-relaxed">
                  {selectedTest.questions[currentQuestionIndex].q}
                </h3>
              </div>

              {/* Four Multiple-Choice Options */}
              <div className="space-y-3 pt-2">
                {selectedTest.questions[currentQuestionIndex].options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === selectedTest.questions[currentQuestionIndex].correct;
                  
                  let optionStyle = "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900";
                  
                  if (isSelected && !isAnswered) {
                    optionStyle = "border-blue-500 ring-2 ring-blue-550/20 bg-blue-50/5 text-blue-800 dark:text-blue-300";
                  } else if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500 bg-emerald-50/5 text-emerald-800 dark:text-emerald-400 ring-2 ring-emerald-500/10";
                    } else if (isSelected) {
                      optionStyle = "border-rose-500 bg-rose-50/5 text-rose-800 dark:text-rose-400 ring-2 ring-rose-500/10";
                    } else {
                      optionStyle = "border-slate-100 dark:border-slate-850 opacity-40";
                    }
                  }

                  const choiceLetter = ["А", "Б", "В", "Г", "Д"][idx] || String(idx + 1);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition flex items-start gap-3.5 leading-snug cursor-pointer ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 flex items-center justify-content justify-center text-[11px] font-mono font-bold rounded-md ${
                        isSelected && !isAnswered ? "bg-blue-600 text-white" :
                        isAnswered && isCorrect ? "bg-emerald-600 text-white" :
                        isAnswered && isSelected ? "bg-rose-600 text-white" :
                        "bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400"
                      }`}>
                        {choiceLetter}
                      </span>
                      <span className="flex-1 pt-0.5">{option}</span>
                      
                      {isAnswered && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 self-center" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 shrink-0 self-center" />}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation Panel */}
              {isAnswered && (
                <div className="bg-blue-50/5 border border-blue-500/20 dark:border-blue-400/10 rounded-xl p-4 sm:p-5 shadow-inner mt-4 animate-fade-in text-sm">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1.5">
                    <HelpCircle className="h-4 w-4" />
                    <span>Инженерно-технологический разбор:</span>
                  </div>
                  <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-xs">
                    {selectedTest.questions[currentQuestionIndex].explanation || "Пояснение к ответу согласно ГОСТ стандартам РФ."}
                  </p>
                </div>
              )}

              {/* Action Buttons: Check Answer or Next */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                {!isAnswered ? (
                  <button
                    onClick={checkAnswer}
                    disabled={selectedOption === null}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-150 disabled:dark:bg-slate-800 disabled:opacity-50 text-white text-sm font-semibold py-2 px-6 rounded-lg transition h-10 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Проверить ответ</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-6 rounded-lg transition h-10 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{currentQuestionIndex + 1 < selectedTest.questions.length ? "Следующий вопрос" : "Показать результаты"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: ADMIN TEST EDITOR/CREATION */}
      {viewState === "edit-test" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              {editingTest.id ? "Редактирование теста" : "Конструирование нового олимпиадного теста"}
            </h2>
            <button
              onClick={() => setViewState("list")}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition"
            >
              Отменить изменения
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left side: test master configurations */}
            <div className="col-span-full lg:col-span-5 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450 mb-1.5">Название теста</label>
                <input
                  type="text"
                  placeholder="Пример: Тест №4: 3D печать и Робототехника"
                  value={editingTest.title || ""}
                  onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-455 mb-1.5">Описание тренажера</label>
                <textarea
                  rows={3}
                  placeholder="Опишите, какие разделы теории охватывает тест..."
                  value={editingTest.description || ""}
                  onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Questions Index selection list */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-550">
                  <span>Список вопросов ({editingTest.questions?.length || 0})</span>
                  <button
                    onClick={handleAddQuestionToEdit}
                    className="text-xs text-blue-550 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                  >
                    <Plus className="h-3 w-3" /> Добавить
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-150 dark:divide-slate-800/80 overflow-hidden max-h-80 overflow-y-auto">
                  {editingTest.questions?.map((q, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 text-xs font-medium flex items-center justify-between transition gap-2 cursor-pointer ${
                        activeQuestionEditIndex === idx 
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-400"
                      }`}
                      onClick={() => setActiveQuestionEditIndex(idx)}
                    >
                      <span className="truncate flex-1 leading-tight">{idx + 1}. {q.q}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveQuestionFromEdit(idx);
                        }}
                        className="p-1 hover:text-red-500 hover:bg-red-50/10 rounded-md transition"
                        title="Удалить вопрос"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main controls */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={handleSaveTest}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl text-xs flex items-center justify-content justify-center gap-1.5 shadow"
                >
                  <Save className="h-4 w-4" />
                  Сохранить тест на портале
                </button>
              </div>
            </div>

            {/* Right side: Selected Question Detailed Form fields */}
            <div className="col-span-full lg:col-span-7 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 p-5 rounded-xl space-y-4">
              {activeQuestionEditIndex !== null && editingTest.questions && editingTest.questions[activeQuestionEditIndex] ? (
                <>
                  <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5 mb-2">
                    <span className="w-5 h-5 flex items-center justify-content justify-center bg-blue-600 text-white text-[10px] font-mono font-bold rounded">
                      Q{activeQuestionEditIndex + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">Конструктор вопроса {activeQuestionEditIndex + 1}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Уровень вопроса:</label>
                    <select value={editingTest.questions[activeQuestionEditIndex].level || "basic"} onChange={(e) => { const newQs = [...(editingTest.questions || [])]; newQs[activeQuestionEditIndex].level = e.target.value as "basic" | "advanced"; setEditingTest({ ...editingTest, questions: newQs }); }} className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2 text-xs text-slate-900">
                      <option value="basic">1. Базовые знания</option>
                      <option value="advanced">2. Применение и анализ</option>
                    </select>
                  </div>

                  {/* Question formulation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Сформулируйте вопрос:</label>
                    <input
                      type="text"
                      value={editingTest.questions[activeQuestionEditIndex].q}
                      onChange={(e) => {
                        const newQs = [...(editingTest.questions || [])];
                        newQs[activeQuestionEditIndex].q = e.target.value;
                        setEditingTest({ ...editingTest, questions: newQs });
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 mb-0.5">Варианты ответов:</label>
                    {editingTest.questions[activeQuestionEditIndex].options.map((option, oIdx) => {
                      const isCorrect = editingTest.questions![activeQuestionEditIndex].correct === oIdx;
                      return (
                        <div key={oIdx} className="flex gap-2 items-center">
                          <button
                            onClick={() => {
                              const newQs = [...(editingTest.questions || [])];
                              newQs[activeQuestionEditIndex].correct = oIdx;
                              setEditingTest({ ...editingTest, questions: newQs });
                            }}
                            title="Сделать правильным"
                            className={`p-1.5 border rounded-md transition ${
                              isCorrect 
                              ? "bg-emerald-600 text-white border-emerald-650" 
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-250 dark:border-slate-800"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <input
                            type="text"
                            value={option}
                            placeholder={`Вариант ${["А", "Б", "В", "Г", "Д"][oIdx]}`}
                            onChange={(e) => {
                              const newQs = [...(editingTest.questions || [])];
                              newQs[activeQuestionEditIndex].options[oIdx] = e.target.value;
                              setEditingTest({ ...editingTest, questions: newQs });
                            }}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Пояснение (анализ ответа):</label>
                    <textarea
                      rows={3}
                      placeholder="Напишите разбор решения со ссылками на ГОСТы, чтобы помочь студентам понять ошибку..."
                      value={editingTest.questions[activeQuestionEditIndex].explanation || ""}
                      onChange={(e) => {
                        const newQs = [...(editingTest.questions || [])];
                        newQs[activeQuestionEditIndex].explanation = e.target.value;
                        setEditingTest({ ...editingTest, questions: newQs });
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-slate-450 text-xs">
                  Выберите вопрос слева или добавьте новый, чтобы начать редактирование его параметров.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
