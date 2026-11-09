import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  ChevronDown, 
  LogOut, 
  Settings, 
  ExternalLink,
  Menu,
  X,
  FileCheck2,
  Sliders,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  activeTab: "syllabus" | "dashboard" | "tests" | "calculators" | "resources";
  setActiveTab: (tab: "syllabus" | "dashboard" | "tests" | "calculators" | "resources") => void;
  onSelectTopic: (pathId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  onSelectTopic,
  searchQuery,
  setSearchQuery,
  theme,
  onToggleTheme
}: NavbarProps) {
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigateToSyllabusTopic = (pathId: string) => {
    setActiveTab("syllabus");
    onSelectTopic(pathId);
    setIsReferenceOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isDark = theme === "dark";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-100 shadow-sm transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 shrink" onClick={() => setActiveTab("dashboard")}>
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/20 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-sans font-bold tracking-tight text-slate-850 dark:text-white text-xs sm:text-sm md:text-base lg:text-lg block leading-tight truncate">
                ВсОШ Технология
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] md:text-[10px] text-slate-400 dark:text-slate-400 tracking-wider uppercase block whitespace-nowrap truncate">
                Сборная МО • Подготовка
              </span>
            </div>
          </div>
            {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5">


            {/* Unified reference catalog */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsReferenceOpen(!isReferenceOpen);
                }}
                className={`flex items-center gap-0.5 px-2 py-1.5 xl:px-3 rounded-md text-xs xl:text-sm font-medium hover:bg-slate-50 transition cursor-pointer ${
                  activeTab === "syllabus" ? "text-blue-600 font-semibold" : "text-slate-600"
                }`}
              >
                Справочник
                <ChevronDown className="h-3 w-3 xl:h-4 xl:w-4" />
              </button>

              {isReferenceOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-lg shadow-lg bg-white border border-slate-200 ring-1 ring-black ring-opacity-5 animate-fade-in text-slate-800 overflow-hidden">
                  <div className="py-1">
                    <button onClick={() => navigateToSyllabusTopic("catalog:common")} className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700">
                      <span className="block font-bold text-slate-800">Общая теория</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">Материалы, измерения, черчение и традиции</span>
                    </button>
                    <button onClick={() => navigateToSyllabusTopic("catalog:technical")} className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700">
                      <span className="block font-bold text-slate-800">ТТиТТ</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">Техника, технологии и техническое творчество</span>
                    </button>
                    <button onClick={() => navigateToSyllabusTopic("catalog:home")} className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700">
                      <span className="block font-bold text-slate-800">Культура дома</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">Дизайн, текстиль, питание и художественные технологии</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button onClick={() => navigateToSyllabusTopic("2.1.1")} className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700">
                      <span className="block font-bold text-slate-800">Оборудование и инструменты</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">Инструменты, станки и измерительные приборы</span>
                    </button>
                    <button onClick={() => navigateToSyllabusTopic("project.1.1")} className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700">
                      <span className="block font-bold text-blue-700">Проектная подготовка 2026/27</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">Тема года, направления и требования</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Tab */}
            <button
              onClick={() => { setActiveTab("calculators"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-1 px-2 py-1.5 xl:px-3 rounded-md text-xs xl:text-sm font-medium cursor-pointer transition ${
                activeTab === "calculators" 
                ? "bg-slate-100 text-blue-600 font-semibold" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Sliders className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-blue-500" />
              Калькуляторы
            </button>

            {/* Olympiad Test Trainer - NEW MODULE */}
            <button
              onClick={() => { setActiveTab("tests"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-1 px-2 py-1.5 xl:px-3 rounded-md text-xs xl:text-sm font-medium cursor-pointer transition ${
                activeTab === "tests" 
                ? "bg-slate-100 text-blue-600 font-semibold" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FileCheck2 className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-indigo-500" />
              Тесты
            </button>

            {/* Unified appendices catalog */}
            <button
              onClick={() => navigateToSyllabusTopic("appendices:catalog")}
              className="px-2 py-1.5 xl:px-3 rounded-md text-xs xl:text-sm font-medium hover:bg-slate-50 transition text-slate-605 cursor-pointer"
            >
              Приложения
            </button>

            {/* Preparation Resources Tab */}
            <button
              onClick={() => { setActiveTab("resources"); setIsMobileMenuOpen(false); }}
              className={`px-2 py-1.5 xl:px-3 rounded-md text-xs xl:text-sm font-medium transition cursor-pointer ${
                activeTab === "resources" 
                ? "bg-slate-100 text-blue-600 font-semibold" 
                : "text-slate-605 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Ресурсы
            </button>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по олимпиаде..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 xl:w-48 bg-slate-50 border border-slate-250 text-slate-805 rounded-md pl-8 pr-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            {currentUser && (
              <div className="flex items-center space-x-1.5 pl-1.5 border-l border-slate-200 min-w-0 shrink">
                <div className="hidden sm:block text-right min-w-0 max-w-[140px] xl:max-w-[200px]">
                  <span className="block text-xs font-semibold text-slate-800 leading-tight truncate">
                    {currentUser.firstName} {currentUser.lastName[0]}.
                  </span>
                  <span className="font-mono text-[8.5px] xl:text-[9px] text-slate-450 uppercase leading-none block truncate">
                    {currentUser.role === "admin" ? "Панель куратора" : "Участник сборной"}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Выйти из системы"
                  className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-red-500 transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-slate-100 rounded-md text-slate-700"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 text-slate-800 dark:text-slate-250">
          {/* Mobile search */}
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Поиск по олимпиаде..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-700 text-slate-805 dark:text-slate-100 rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>


          
          <div className="rounded-lg border border-slate-200 p-2">
            <span className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Справочник</span>
            <button onClick={() => navigateToSyllabusTopic("catalog:common")} className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">Общая теория</button>
            <button onClick={() => navigateToSyllabusTopic("catalog:technical")} className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">ТТиТТ</button>
            <button onClick={() => navigateToSyllabusTopic("catalog:home")} className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">Культура дома</button>
            <button onClick={() => navigateToSyllabusTopic("2.1.1")} className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">Оборудование и инструменты</button>
            <button onClick={() => navigateToSyllabusTopic("project.1.1")} className="w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50">Проектная подготовка 2026/27</button>
          </div>

          <button
            onClick={() => navigateToSyllabusTopic("appendices:catalog")}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Приложения и справочные таблицы
          </button>

          <button
            onClick={() => { setActiveTab("calculators"); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-slate-655 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-md block font-medium"
          >
            Инженерные калькуляторы
          </button>

          <button
            onClick={() => { setActiveTab("tests"); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-slate-105 dark:hover:bg-slate-805 rounded-md block"
          >
            Олимпиадный тест-тренажер
          </button>

          <button
            onClick={() => { setActiveTab("resources"); setIsMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm text-slate-655 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-md block font-medium"
          >
            Ресурсы подготовки
          </button>

          {currentUser && (
            <div className="pt-2 border-t border-slate-205 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="font-mono text-[9px] text-slate-450 dark:text-slate-400 uppercase">
                  {currentUser.role === "admin" ? "Панель куратора" : "Участник сборной"}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs text-red-500 font-semibold cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Выйти
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
