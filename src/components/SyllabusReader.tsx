import React, { useState, useEffect } from "react";
import { 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  BookMarked,
  Search,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Image,
  Link2
} from "lucide-react";
import { appendicesData } from "../data/syllabus";
import { Chapter, Section, Subsection, User, SubsectionLink } from "../types";

type TheoryCatalog = "common" | "technical" | "home" | "project";

const catalogDefinitions: Array<{ id: TheoryCatalog; label: string; chapterIds: string[] }> = [
  { id: "common", label: "Общее", chapterIds: ["0", "6", "7", "9", "research-methods"] },
  { id: "technical", label: "ТТиТТ", chapterIds: ["1", "2", "3", "4", "5", "8", "electronics", "digital-fab", "flight-basics", "agro"] },
  { id: "home", label: "Культура дома", chapterIds: ["home", "home-design", "home-art", "home-food", "food-safety", "home-environment", "home-beauty", "home-modern", "agro"] },
  { id: "project", label: "Проект", chapterIds: ["project"] }
];

const appendixCatalogGroups = [
  { id: "common", label: "Общее", description: "Единицы, материалы и универсальные справочные данные" },
  { id: "technical", label: "ТТиТТ", description: "Технические материалы, стандарты и производственные таблицы" },
  { id: "home", label: "Культура дома", description: "Текстиль, дизайн, питание и технологии обработки" }
] as const;

const APPENDICES_CATALOG_ID = "__appendices_catalog__";

const getCatalogForChapter = (chapterId: string): TheoryCatalog => {
  if (chapterId === "project") return "project";
  if (["home", "home-design", "home-art", "home-food", "food-safety", "home-environment", "home-beauty", "home-modern"].includes(chapterId)) return "home";
  if (chapterId === "agro") return "technical";
  if (["2", "3", "4", "5", "8", "electronics", "digital-fab", "flight-basics"].includes(chapterId)) return "technical";
  return "common";
};

interface SyllabusReaderProps {
  currentUser: User | null;
  syllabus: Chapter[];
  onSaveSyllabus: (newSyllabus: Chapter[]) => Promise<void>;
  onUpdateStats: (stats: { completedChapters: string[]; bookmarkedSubsections: string[] }) => void;
  selectedTopicPath: string;
  setSelectedTopicPath: (path: string) => void;
  searchQuery: string;
}

export default function SyllabusReader({
  currentUser,
  syllabus,
  onSaveSyllabus,
  onUpdateStats,
  selectedTopicPath,
  setSelectedTopicPath,
  searchQuery,
}: SyllabusReaderProps) {
  const isAdmin = currentUser?.role === "admin";

  // Sidebar navigation states
  const [activeChapterId, setActiveChapterId] = useState<string>("0");
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [activeCatalog, setActiveCatalog] = useState<TheoryCatalog>("common");

  // Users bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  // CMS Editing states
  const [isCMSActive, setIsCMSActive] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Buffer state while editing a subsection
  const [subEditBuffer, setSubEditBuffer] = useState<Subsection | null>(null);

  // Mobile navigation drawer toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fast index states
  useEffect(() => {
    if (currentUser?.studyStats) {
      setBookmarks(currentUser.studyStats.bookmarkedSubsections || []);
      setCompletedChapters(currentUser.studyStats.completedChapters || []);
    }
  }, [currentUser]);

  // Synchronize incoming selectedTopicPath from navbar
  useEffect(() => {
    if (selectedTopicPath) {
      if (selectedTopicPath === "appendices:catalog") {
        setActiveAppId(APPENDICES_CATALOG_ID);
        setActiveChapterId("");
      } else if (selectedTopicPath.startsWith("catalog:")) {
        const requestedCatalog = selectedTopicPath.slice("catalog:".length) as TheoryCatalog;
        const definition = catalogDefinitions.find((catalog) => catalog.id === requestedCatalog);
        if (definition) {
          setActiveCatalog(requestedCatalog);
          const firstAvailable = syllabus.find((chapter) => definition.chapterIds.includes(chapter.id));
          if (firstAvailable) setActiveChapterId(firstAvailable.id);
          setActiveAppId(null);
        }
      } else if (selectedTopicPath.startsWith("app")) {
        const requestedAppendix = appendicesData.find((app) => app.id === selectedTopicPath);
        if (requestedAppendix?.category && requestedAppendix.category !== "project") {
          setActiveCatalog(requestedAppendix.category as TheoryCatalog);
        }
        setActiveAppId(selectedTopicPath);
        setActiveChapterId("");
      } else {
        const parts = selectedTopicPath.split(".");
        if (parts.length > 0) {
          setActiveChapterId(parts[0]);
          setActiveCatalog(getCatalogForChapter(parts[0]));
          setActiveAppId(null);
        }
      }
    }
  }, [selectedTopicPath]);

  useEffect(() => {
    if (!selectedTopicPath || selectedTopicPath.startsWith("app")) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`sub-${selectedTopicPath}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedTopicPath, activeChapterId, syllabus]);

  // Dynamically compute the search index from the current editable syllabus array! Just-in-time search!
  const searchIndex = React.useMemo(() => {
    const list: Array<{ path: string; term: string; title: string; keywords: string }> = [];
    syllabus.forEach((chap) => {
      if (chap.content) {
        list.push({
          path: chap.id,
          term: chap.title,
          title: chap.title,
          keywords: chap.content
        });
      }
      chap.sections?.forEach((sec) => {
        sec.subsections?.forEach((sub) => {
          list.push({
            path: sub.id,
            term: sub.title,
            title: `${chap.title} • ${sec.title}`,
            keywords: `${sub.content} ${sub.gostReference || ""}`
          });
          sub.keyTerms?.forEach((kt) => {
            list.push({
              path: sub.id,
              term: kt.term,
              title: `${chap.title} • ${sec.title} • ${sub.title}`,
              keywords: kt.definition
            });
          });
        });
      });
    });
    return list;
  }, [syllabus]);

  // Function to search/query content
  const getFilteredResults = () => {
    if (!searchQuery) return null;
    const query = searchQuery.toLowerCase();
    
    // Check keyword records
    const matchedItems = searchIndex.filter(
      (item) =>
        item.term.toLowerCase().includes(query) ||
        item.keywords.toLowerCase().includes(query)
    );

    return matchedItems;
  };

  const toggleBookmark = (subId: string) => {
    let updated;
    if (bookmarks.includes(subId)) {
      updated = bookmarks.filter((b) => b !== subId);
    } else {
      updated = [...bookmarks, subId];
    }
    setBookmarks(updated);
    onUpdateStats({
      completedChapters,
      bookmarkedSubsections: updated
    });
  };

  const toggleChapterCompleted = (chapId: string) => {
    let updated;
    if (completedChapters.includes(chapId)) {
      updated = completedChapters.filter((c) => c !== chapId);
    } else {
      updated = [...completedChapters, chapId];
    }
    setCompletedChapters(updated);
    onUpdateStats({
      completedChapters: updated,
      bookmarkedSubsections: bookmarks
    });
  };

  const currentChapter = syllabus.find((c) => c.id === activeChapterId);
  const currentApp = appendicesData.find((a) => a.id === activeAppId);
  const isAppendicesCatalog = activeAppId === APPENDICES_CATALOG_ID;
  const visibleAppendices = appendicesData.filter((app) => app.category === activeCatalog);
  const searchResults = getFilteredResults();
  const activeCatalogDefinition = catalogDefinitions.find((catalog) => catalog.id === activeCatalog)!;
  const visibleChapters = isCMSActive
    ? syllabus
    : syllabus.filter((chapter) => activeCatalogDefinition.chapterIds.includes(chapter.id));

  const selectCatalog = (catalogId: TheoryCatalog) => {
    setActiveCatalog(catalogId);
    setActiveAppId(null);
    const definition = catalogDefinitions.find((catalog) => catalog.id === catalogId)!;
    if (!definition.chapterIds.includes(activeChapterId)) {
      const firstAvailable = syllabus.find((chapter) => definition.chapterIds.includes(chapter.id));
      if (firstAvailable) setActiveChapterId(firstAvailable.id);
    }
    setSelectedTopicPath("");
  };

  // Helper to highlight searched words
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 text-slate-100 dark:text-slate-900 rounded-sm px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // CMS CRUDS: Update Chapters List
  const handleAddChapter = async () => {
    const newId = String(syllabus.length);
    const newChap: Chapter = {
      id: newId,
      title: `${newId}. Новый раздел теории`,
      content: "Введение в тему...",
      sections: []
    };
    const nextSyllabus = [...syllabus, newChap];
    await onSaveSyllabus(nextSyllabus);
    setActiveChapterId(newId);
  };

  const handleDeleteChapter = async (chapId: string) => {
    if (syllabus.length <= 1) {
      alert("Нельзя удалить последнюю главу");
      return;
    }
    if (!confirm("Вы действительно хотите полностью удалить этот раздел учебника со всеми подразделами?")) {
      return;
    }
    const nextSyllabus = syllabus.filter(c => c.id !== chapId);
    await onSaveSyllabus(nextSyllabus);
    setActiveChapterId(nextSyllabus[0].id);
  };

  const handleEditChapterTitle = async (chapId: string, newTitle: string) => {
    const nextSyllabus = syllabus.map(c => {
      if (c.id === chapId) {
        return { ...c, title: newTitle };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
  };

  // CMS CRUDS: Update Sections in a Chapter
  const handleAddSection = async (chapId: string) => {
    const targetChap = syllabus.find(c => c.id === chapId);
    if (!targetChap) return;

    const sections = targetChap.sections || [];
    const sectionIndex = String(sections.length + 1);
    const newSecId = `${chapId}.${sectionIndex}`;
    const newSec: Section = {
      id: newSecId,
      title: `${newSecId}. Новый заголовок`,
      subsections: []
    };

    const nextSyllabus = syllabus.map(c => {
      if (c.id === chapId) {
        return { ...c, sections: [...(c.sections || []), newSec] };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
  };

  const handleDeleteSection = async (chapId: string, secId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот подраздел?")) return;
    const nextSyllabus = syllabus.map(c => {
      if (c.id === chapId) {
        return {
          ...c,
          sections: (c.sections || []).filter(s => s.id !== secId)
        };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
  };

  const handleEditSectionTitle = async (chapId: string, secId: string, newTitle: string) => {
    const nextSyllabus = syllabus.map(c => {
      if (c.id === chapId) {
        return {
          ...c,
          sections: (c.sections || []).map(s => {
            if (s.id === secId) {
              return { ...s, title: newTitle };
            }
            return s;
          })
        };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
  };

  // CMS CRUDS: Subsections handling
  const handleAddSubsection = async (chapId: string, secId: string) => {
    const targetChap = syllabus.find(c => c.id === chapId);
    if (!targetChap) return;
    const targetSec = (targetChap.sections || []).find(s => s.id === secId);
    if (!targetSec) return;

    const subs = targetSec.subsections || [];
    const nextIndex = String(subs.length + 1);
    const newSubId = `${secId}.${nextIndex}`;
    
    const newSub: Subsection = {
      id: newSubId,
      title: "Новая учебная статья",
      content: "Напишите учебный текст здесь. Поддерживается богатое описание технологий, чертежей и правил.",
      formulas: [],
      keyTerms: [],
      links: [],
      gostReference: ""
    };

    const nextSyllabus = syllabus.map(c => {
      if (c.id === chapId) {
        return {
          ...c,
          sections: (c.sections || []).map(s => {
            if (s.id === secId) {
              return { ...s, subsections: [...(s.subsections || []), newSub] };
            }
            return s;
          })
        };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
  };

  const handleDeleteSubsection = async (chapId: string, secId: string, subId: string) => {
    if (!confirm("Вы действительно хотите удалить эту статью учебника?")) return;
    const nextSyllabus = syllabus.map(c => {
      if (c.id === chapId) {
        return {
          ...c,
          sections: (c.sections || []).map(s => {
            if (s.id === secId) {
              return {
                ...s,
                subsections: (s.subsections || []).filter(sub => sub.id !== subId)
              };
            }
            return s;
          })
        };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
  };

  // Trigger edit panel for subsection
  const startEditSubsection = (sub: Subsection) => {
    setEditingSubId(sub.id);
    setSubEditBuffer(JSON.parse(JSON.stringify(sub))); // Deep clone
  };

  const cancelEditSubsection = () => {
    setEditingSubId(null);
    setSubEditBuffer(null);
  };

  const saveSubsectionEdit = async () => {
    if (!subEditBuffer) return;
    const legacyImageUrl = subEditBuffer.imageUrl?.trim();
    const cleanedSubsection: Subsection = {
      ...subEditBuffer,
      imageUrl: legacyImageUrl && !subEditBuffer.content.includes(legacyImageUrl)
        ? legacyImageUrl
        : undefined,
      images: (subEditBuffer.images || [])
        .map((image) => ({
          ...image,
          src: image.src.trim(),
          alt: image.alt.trim() || subEditBuffer.title,
          caption: image.caption?.trim() || undefined,
          source: image.source?.trim() || undefined
        }))
        .filter((image) => image.src.length > 0)
    };
    const nextSyllabus = syllabus.map(c => {
      if (c.id === activeChapterId) {
        return {
          ...c,
          sections: (c.sections || []).map(s => {
            return {
              ...s,
              subsections: (s.subsections || []).map(sub => {
                if (sub.id === cleanedSubsection.id) {
                  return cleanedSubsection;
                }
                return sub;
              })
            };
          })
        };
      }
      return c;
    });
    await onSaveSyllabus(nextSyllabus);
    setEditingSubId(null);
    setSubEditBuffer(null);
  };

  return (
    <div className="space-y-4" id="syllabus-reader">
      {/* Mobile Toolbar Trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition animate-fade-in"
        >
          <span className="flex items-center gap-2 text-sm sm:text-base">
            <BookOpen className="h-5 w-5" />
            Навигатор подготовки (Разделы учебника)
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1600px] mx-auto">
        
        {/* Left Menu / Sidebar Column */}
        <div className={`
          lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm
          ${isMobileSidebarOpen 
            ? "fixed inset-0 z-50 overflow-y-auto max-h-screen p-6 block bg-white dark:bg-slate-900" 
            : "hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto"
          }
        `}>
          <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
            <div>
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block">Навигатор подготовки</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-white font-sans mt-0.5 block">Содержимое учебника</span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setIsCMSActive(!isCMSActive)}
                  className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border transition text-xs flex items-center gap-1 cursor-pointer font-sans ${
                    isCMSActive 
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" 
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                  }`}
                  title="Панель куратора"
                >
                  <Settings className="h-3.5 w-3.5 animate-spin-slow" />
                  <span>{isCMSActive ? "Выйти" : "Редактировать"}</span>
                </button>
              )}
              {/* Close Button on Mobile Drawer */}
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 hover:text-slate-800 cursor-pointer"
                title="Закрыть меню"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

        {/* Global Search Prompt / Hits */}
        {searchQuery && searchResults && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block uppercase">Найдено совпадений: {searchResults.length}</span>
            <div className="mt-2 space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Ничего не найдено. Наберите: сучок, цементит, ТРИЗ, шеврон.</p>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedTopicPath(item.path);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="w-full text-left bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded text-[11px] text-slate-700 dark:text-slate-200 transition border border-slate-200 dark:border-slate-800 block cursor-pointer"
                  >
                    <span className="font-bold text-amber-600 dark:text-amber-400 block">{item.term}</span>
                    <span className="text-[9px] text-slate-400">в разделе: {item.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chapters list */}
        <div className="space-y-1.5">
          <div className="mb-3 grid grid-cols-2 gap-1.5">
            {catalogDefinitions.map((catalog) => (
              <button
                key={catalog.id}
                type="button"
                onClick={() => selectCatalog(catalog.id)}
                className={`rounded-md border px-2 py-2 text-[10px] font-bold transition ${
                  activeCatalog === catalog.id
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {catalog.label}
              </button>
            ))}
          </div>

          {activeCatalog === "home" && !isCMSActive && (
            <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-[10px] leading-relaxed text-blue-900">
              Все плановые направления представлены: текстиль, одежда, ремёсла, костюм, питание, средовой дизайн, индустрия красоты, современные технологии, социальные и агротехнологические проекты.
            </div>
          )}

          {visibleChapters.map((chap) => (
            <div key={chap.id} className="relative group/chapter">
              {isCMSActive ? (
                <div className="flex gap-1 items-center bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800/50 rounded-lg p-1">
                  <input
                    type="text"
                    value={chap.title}
                    onChange={(e) => handleEditChapterTitle(chap.id, e.target.value)}
                    className="flex-grow bg-transparent text-xs font-semibold px-2 py-1 text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-sans"
                  />
                  <button
                    onClick={() => handleDeleteChapter(chap.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Удалить раздел"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveChapterId(chap.id);
                      setActiveAppId(null);
                      setSelectedTopicPath("");
                    }}
                    className="p-1 text-slate-400 hover:text-blue-500 transition-colors text-[10px]"
                    title="Выбрать"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveChapterId(chap.id);
                    setActiveAppId(null);
                    setSelectedTopicPath("");
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs sm:text-xs font-sans font-medium transition flex items-center justify-between cursor-pointer ${
                    activeChapterId === chap.id
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <BookOpen className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{chap.title}</span>
                  </div>
                  {completedChapters.includes(chap.id) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 uppercase font-mono font-bold shrink-0">
                      ИЗУЧЕНО
                    </span>
                  )}
                </button>
              )}
            </div>
          ))}

          {isCMSActive && (
            <button
              onClick={handleAddChapter}
              className="w-full py-2 border border-dashed border-blue-500/40 text-blue-600 dark:text-blue-450 hover:bg-blue-500/5 transition rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Добавить раздел (Главу)
            </button>
          )}

          {/* Appendices list */}
          {(activeCatalog === "common" || activeCatalog === "technical" || activeCatalog === "home") && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest block mb-2 px-1">Табличные Приложения</span>
            {visibleAppendices.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  setActiveAppId(app.id);
                  setActiveChapterId("");
                  setSelectedTopicPath("");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition flex items-center space-x-2 cursor-pointer ${
                  activeAppId === app.id
                    ? "bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold border-l-2 border-amber-500"
                    : "text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span className="truncate">{app.title.replace(/^Приложение\s+\d+\.\s*/, "")}</span>
              </button>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Right Column / Content Reader Panel */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-6 text-slate-800 dark:text-slate-100 shadow-sm">

        {/* Unified appendices catalog */}
        {isAppendicesCatalog && (
          <div className="space-y-7">
            <div className="border-b border-slate-200 pb-4">
              <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
                Приложения и справочные таблицы
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                Общий каталог таблиц для расчётов, выбора материалов и проверки обозначений. Приложения сгруппированы по назначению и открываются на отдельной странице.
              </p>
            </div>

            <div className="space-y-7">
              {appendixCatalogGroups.map((group) => {
                const groupApps = appendicesData.filter((app) => app.category === group.id);
                if (!groupApps.length) return null;
                return (
                  <section key={group.id}>
                    <div className="mb-3">
                      <h2 className="text-base font-semibold text-slate-900">{group.label}</h2>
                      <p className="mt-0.5 text-xs text-slate-500">{group.description}</p>
                    </div>
                    <div className="divide-y divide-slate-200 border-y border-slate-200">
                      {groupApps.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setActiveCatalog(group.id);
                            setActiveAppId(app.id);
                            setActiveChapterId("");
                            setSelectedTopicPath("");
                          }}
                          className="group flex w-full items-center gap-3 px-1 py-3.5 text-left transition hover:bg-slate-50"
                        >
                          <FileSpreadsheet className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-slate-800 group-hover:text-blue-700">
                              {app.title.replace(/^Приложение\s+\d+\.\s*/, "")}
                            </span>
                            {app.description && <span className="mt-1 block text-xs leading-relaxed text-slate-500">{app.description}</span>}
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Render Chapter Standard content */}
        {currentChapter && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {currentChapter.title}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">Олимпиадный справочник теории • МО сборная</p>
              </div>
              <button
                onClick={() => toggleChapterCompleted(currentChapter.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all tracking-wider shrink-0 cursor-pointer ${
                  completedChapters.includes(currentChapter.id)
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 hover:bg-green-500/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {completedChapters.includes(currentChapter.id) ? "✓ Раздел изучен" : "Отметить изученным"}
              </button>
            </div>

            {currentChapter.content && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {currentChapter.content}
              </div>
            )}

            {currentChapter.sections && currentChapter.sections.map((section) => (
              <div key={section.id} className="space-y-6 pt-2">
                
                {/* Section header widget */}
                <div className="bg-slate-50 dark:bg-slate-950/40 px-3 py-2 rounded-lg border-l-4 border-blue-500 flex justify-between items-center gap-2">
                  {isCMSActive ? (
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleEditSectionTitle(currentChapter.id, section.id, e.target.value)}
                      className="bg-transparent border-b border-dashed border-slate-300 text-sm font-bold text-slate-800 dark:text-gray-200 focus:outline-none focus:border-blue-500 w-full"
                    />
                  ) : (
                    <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-gray-200">
                      {section.title}
                    </h2>
                  )}

                  {isCMSActive && (
                    <button
                      onClick={() => handleDeleteSection(currentChapter.id, section.id)}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded transition"
                      title="Удалить подраздел"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Subsections List (Articles) */}
                {section.subsections?.map((sub) => {
                  const isBeingEdited = editingSubId === sub.id;

                  return (
                    <div 
                      key={sub.id} 
                      id={`sub-${sub.id}`} 
                      className={`p-5 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border transition space-y-4 ${
                        isBeingEdited 
                        ? "border-amber-500 ring-2 ring-amber-550/15" 
                        : "border-slate-200 dark:hover:border-slate-800 dark:border-slate-850"
                      }`}
                    >
                      {/* SUBSECTION MODE: RENDER FORM EDITING */}
                      {isBeingEdited && subEditBuffer ? (
                        <div className="space-y-4 text-xs font-sans">
                          <div className="flex items-center justify-between border-b dark:border-slate-850 pb-2.5 mb-2">
                            <span className="text-xs font-bold font-mono text-amber-500 uppercase tracking-widest">Панель редактирования статьи {sub.id}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={saveSubsectionEdit}
                                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-3 rounded-md shadow text-[11px] cursor-pointer"
                              >
                                <Save className="h-3 w-3" /> Сохранить
                              </button>
                              <button
                                onClick={cancelEditSubsection}
                                className="flex items-center gap-1 border border-slate-350 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-300 font-semibold py-1 px-3 rounded-md text-[11px] cursor-pointer"
                              >
                                <X className="h-3 w-3" /> Отмена
                              </button>
                            </div>
                          </div>

                          {/* Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Название статьи</label>
                              <input
                                type="text"
                                value={subEditBuffer.title}
                                onChange={(e) => setSubEditBuffer({ ...subEditBuffer, title: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ссылка на изображение / Схему (ImageUrl)</label>
                              <input
                                type="text"
                                placeholder="Например: https://images.unsplash.com/... или ссылка на чертеж"
                                value={subEditBuffer.imageUrl || ""}
                                onChange={(e) => setSubEditBuffer({ ...subEditBuffer, imageUrl: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Backwards-compatible article image gallery editor */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-lg p-3 space-y-3 bg-white dark:bg-slate-950/40">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <span>Иллюстрации статьи ({subEditBuffer.images?.length || 0})</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const images = subEditBuffer.images || [];
                                  setSubEditBuffer({
                                    ...subEditBuffer,
                                    images: [...images, { src: "", alt: subEditBuffer.title, caption: "", source: "" }]
                                  });
                                }}
                                className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Plus className="h-3 w-3" /> Добавить изображение
                              </button>
                            </div>

                            {(!subEditBuffer.images || subEditBuffer.images.length === 0) && (
                              <p className="text-[11px] text-slate-400">
                                Можно добавить несколько схем или фотографий с подписями. Старое основное изображение продолжит отображаться отдельно.
                              </p>
                            )}

                            <div className="space-y-3">
                              {subEditBuffer.images?.map((articleImage, imageIndex) => (
                                <div key={imageIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                  <input
                                    type="text"
                                    aria-label={`Адрес изображения ${imageIndex + 1}`}
                                    placeholder="/assets/materials/example.webp или https://..."
                                    value={articleImage.src}
                                    onChange={(event) => {
                                      const images = [...subEditBuffer.images!];
                                      images[imageIndex] = { ...images[imageIndex], src: event.target.value };
                                      setSubEditBuffer({ ...subEditBuffer, images });
                                    }}
                                    className="sm:col-span-2 w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <input
                                    type="text"
                                    aria-label={`Описание изображения ${imageIndex + 1}`}
                                    placeholder="Описание изображения для доступности"
                                    value={articleImage.alt}
                                    onChange={(event) => {
                                      const images = [...subEditBuffer.images!];
                                      images[imageIndex] = { ...images[imageIndex], alt: event.target.value };
                                      setSubEditBuffer({ ...subEditBuffer, images });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <input
                                    type="text"
                                    aria-label={`Подпись изображения ${imageIndex + 1}`}
                                    placeholder="Подпись под изображением"
                                    value={articleImage.caption || ""}
                                    onChange={(event) => {
                                      const images = [...subEditBuffer.images!];
                                      images[imageIndex] = { ...images[imageIndex], caption: event.target.value };
                                      setSubEditBuffer({ ...subEditBuffer, images });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <input
                                    type="text"
                                    aria-label={`Источник изображения ${imageIndex + 1}`}
                                    placeholder="Источник или ссылка на источник"
                                    value={articleImage.source || ""}
                                    onChange={(event) => {
                                      const images = [...subEditBuffer.images!];
                                      images[imageIndex] = { ...images[imageIndex], source: event.target.value };
                                      setSubEditBuffer({ ...subEditBuffer, images });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const images = subEditBuffer.images!.filter((_, index) => index !== imageIndex);
                                      setSubEditBuffer({ ...subEditBuffer, images });
                                    }}
                                    className="justify-self-end inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" /> Удалить
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                              Текст статьи (Поддерживается HTML / переносы)
                              <span className="text-blue-500 font-semibold ml-2 normal-case font-sans">
                                💡 Вы можете вставить картинку (Ctrl+V) прямо сюда — она автоматически прикрепится к статье!
                              </span>
                            </label>
                            <textarea
                              rows={5}
                              value={subEditBuffer.content}
                              onChange={(e) => setSubEditBuffer({ ...subEditBuffer, content: e.target.value })}
                              onPaste={(e) => {
                                const items = e.clipboardData?.items;
                                if (!items) return;
                                for (let i = 0; i < items.length; i++) {
                                  if (items[i].type.indexOf("image") !== -1) {
                                    const file = items[i].getAsFile();
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        if (event.target?.result) {
                                          const base64 = event.target.result as string;
                                          const imgTag = `<img src="${base64}" alt="Вставленное изображение" class="max-w-full h-auto rounded-lg my-3 border border-slate-200 shadow-sm block" />\n`;
                                          
                                          const textarea = e.target as HTMLTextAreaElement;
                                          const start = textarea.selectionStart || 0;
                                          const end = textarea.selectionEnd || 0;
                                          const before = subEditBuffer.content.substring(0, start);
                                          const after = subEditBuffer.content.substring(end);
                                          
                                          setSubEditBuffer({
                                            ...subEditBuffer,
                                            content: before + imgTag + after
                                          });
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                      e.preventDefault();
                                      break;
                                    }
                                  }
                                }
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded p-2.5 leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ссылка на ГОСТ справочник</label>
                              <input
                                type="text"
                                placeholder="ГОСТ 1412-85"
                                value={subEditBuffer.gostReference || ""}
                                onChange={(e) => setSubEditBuffer({ ...subEditBuffer, gostReference: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Основные формулы (каждая строка — новая формула)</label>
                              <textarea
                                rows={2}
                                placeholder="E = m * c²"
                                value={subEditBuffer.formulas?.join("\n") || ""}
                                onChange={(e) => setSubEditBuffer({ ...subEditBuffer, formulas: e.target.value.split("\n").filter(Boolean) })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded px-2.5 py-1.5 focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          {/* Dynamic terms component builder */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-lg p-3 space-y-3 bg-white dark:bg-slate-950/40">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <span>Ключевые термины раздела ({subEditBuffer.keyTerms?.length || 0})</span>
                              <button
                                onClick={() => {
                                  const list = subEditBuffer.keyTerms || [];
                                  setSubEditBuffer({
                                    ...subEditBuffer,
                                    keyTerms: [...list, { term: "Новый термин", definition: "Определение" }]
                                  });
                                }}
                                className="text-blue-550 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                              >
                                <Plus className="h-3 w-3" /> Добавить
                              </button>
                            </div>
                            <div className="space-y-2">
                              {subEditBuffer.keyTerms?.map((kt, kIdx) => (
                                <div key={kIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Термин (Например: Закалка)"
                                    value={kt.term}
                                    onChange={(e) => {
                                      const nextKt = [...subEditBuffer.keyTerms!];
                                      nextKt[kIdx].term = e.target.value;
                                      setSubEditBuffer({ ...subEditBuffer, keyTerms: nextKt });
                                    }}
                                    className="w-1/3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Определение..."
                                    value={kt.definition}
                                    onChange={(e) => {
                                      const nextKt = [...subEditBuffer.keyTerms!];
                                      nextKt[kIdx].definition = e.target.value;
                                      setSubEditBuffer({ ...subEditBuffer, keyTerms: nextKt });
                                    }}
                                    className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs"
                                  />
                                  <button
                                    onClick={() => {
                                      const nextKt = subEditBuffer.keyTerms!.filter((_, i) => i !== kIdx);
                                      setSubEditBuffer({ ...subEditBuffer, keyTerms: nextKt });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Attachement Links editor */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-lg p-3 space-y-3 bg-white dark:bg-slate-950/40">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-550">
                              <span>Прикрепленные внешние ссылки ({subEditBuffer.links?.length || 0})</span>
                              <button
                                onClick={() => {
                                  const list = subEditBuffer.links || [];
                                  setSubEditBuffer({
                                    ...subEditBuffer,
                                    links: [...list, { title: "Регламент ВсОШ", url: "https://vserosolymp.ru" }]
                                  });
                                }}
                                className="text-blue-550 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                              >
                                <Plus className="h-3 w-3" /> Добавить ссылку
                              </button>
                            </div>
                            <div className="space-y-2">
                              {subEditBuffer.links?.map((lk, lIdx) => (
                                <div key={lIdx} className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Заголовок ссылки (Например: Официальный PDF регламент)"
                                    value={lk.title}
                                    onChange={(e) => {
                                      const nextLk = [...subEditBuffer.links!];
                                      nextLk[lIdx].title = e.target.value;
                                      setSubEditBuffer({ ...subEditBuffer, links: nextLk });
                                    }}
                                    className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="URL-адрес ресурса..."
                                    value={lk.url}
                                    onChange={(e) => {
                                      const nextLk = [...subEditBuffer.links!];
                                      nextLk[lIdx].url = e.target.value;
                                      setSubEditBuffer({ ...subEditBuffer, links: nextLk });
                                    }}
                                    className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-xs"
                                  />
                                  <button
                                    onClick={() => {
                                      const nextLk = subEditBuffer.links!.filter((_, i) => i !== lIdx);
                                      setSubEditBuffer({ ...subEditBuffer, links: nextLk });
                                    }}
                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dynamic Tables Editor */}
                          <div className="border border-slate-200 dark:border-slate-850 rounded-lg p-3 space-y-3 bg-white dark:bg-slate-950/40">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-550">
                              <span>Таблицы статьи ({subEditBuffer.tables?.length || 0})</span>
                              <button
                                onClick={() => {
                                  const list = subEditBuffer.tables || [];
                                  setSubEditBuffer({
                                    ...subEditBuffer,
                                    tables: [...list, { headers: ["Параметр", "Значение"], rows: [["Пример", "Текст"]], caption: "Новая таблица" }]
                                  });
                                }}
                                className="text-blue-550 hover:underline flex items-center gap-0.5 cursor-pointer font-bold text-xs"
                              >
                                <Plus className="h-3 w-3" /> Добавить таблицу
                              </button>
                            </div>
                            
                            <div className="space-y-4">
                              {(subEditBuffer.tables || []).map((tValue, tIndex) => (
                                <div key={tIndex} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Таблица №{tIndex + 1}</span>
                                    <button
                                      onClick={() => {
                                        const nextTables = subEditBuffer.tables!.filter((_, i) => i !== tIndex);
                                        setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                      }}
                                      className="text-xs text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                                    >
                                      <Trash2 className="h-3 w-3" /> Удалить таблицу
                                    </button>
                                  </div>

                                  {/* Table Caption */}
                                  <div>
                                    <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1">Название / Описание таблицы</label>
                                    <input
                                      type="text"
                                      placeholder="Например: Таблица 3. Группы пороков древесин"
                                      value={tValue.caption || ""}
                                      onChange={(e) => {
                                        const nextTables = [...subEditBuffer.tables!];
                                        nextTables[tIndex].caption = e.target.value;
                                        setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                      }}
                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100"
                                    />
                                  </div>

                                  {/* Headers */}
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Заголовки колонок</label>
                                      <button
                                        onClick={() => {
                                          const nextTables = [...subEditBuffer.tables!];
                                          nextTables[tIndex].headers.push(`Колонка ${nextTables[tIndex].headers.length + 1}`);
                                          // Add empty cells for the new column in all rows
                                          nextTables[tIndex].rows = nextTables[tIndex].rows.map(r => [...r, ""]);
                                          setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                        }}
                                        className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                                      >
                                        + Добавить колонку
                                      </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {tValue.headers.map((h, hIdx) => (
                                        <div key={hIdx} className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5">
                                          <input
                                            type="text"
                                            value={h}
                                            onChange={(e) => {
                                              const nextTables = [...subEditBuffer.tables!];
                                              nextTables[tIndex].headers[hIdx] = e.target.value;
                                              setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                            }}
                                            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-semibold w-24 focus:outline-none"
                                          />
                                          {tValue.headers.length > 1 && (
                                            <button
                                              onClick={() => {
                                                const nextTables = [...subEditBuffer.tables!];
                                                nextTables[tIndex].headers = nextTables[tIndex].headers.filter((_, idx) => idx !== hIdx);
                                                nextTables[tIndex].rows = nextTables[tIndex].rows.map(r => r.filter((_, idx) => idx !== hIdx));
                                                setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                              }}
                                              className="text-red-400 hover:text-red-655 font-bold px-0.5 cursor-pointer text-xs"
                                              title="Удалить колонку"
                                            >
                                              ×
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Rows */}
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                      <label className="block text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Строки данных ({tValue.rows.length})</label>
                                      <button
                                        onClick={() => {
                                          const nextTables = [...subEditBuffer.tables!];
                                          const newRow = Array(tValue.headers.length).fill("");
                                          nextTables[tIndex].rows.push(newRow);
                                          setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                        }}
                                        className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                                      >
                                        + Добавить строку
                                      </button>
                                    </div>
                                    <div className="space-y-2">
                                      {tValue.rows.map((row, rIdx) => (
                                        <div key={rIdx} className="flex gap-2 items-center bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 rounded">
                                          <div className="grid grid-flow-col auto-cols-fr gap-1.5 flex-grow font-sans">
                                            {row.map((cell, cIdx) => (
                                              <input
                                                key={cIdx}
                                                type="text"
                                                placeholder={tValue.headers[cIdx] || "Ячейка"}
                                                value={cell}
                                                onChange={(e) => {
                                                  const nextTables = [...subEditBuffer.tables!];
                                                  nextTables[tIndex].rows[rIdx][cIdx] = e.target.value;
                                                  setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                                }}
                                                className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded px-1.5 py-1 text-xs w-full text-slate-705 dark:text-slate-200"
                                              />
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => {
                                              const nextTables = [...subEditBuffer.tables!];
                                              nextTables[tIndex].rows = nextTables[tIndex].rows.filter((_, idx) => idx !== rIdx);
                                              setSubEditBuffer({ ...subEditBuffer, tables: nextTables });
                                            }}
                                            className="p-1 hover:bg-red-50 dark:hover:bg-red-955/10 text-slate-400 hover:text-red-500 rounded transition cursor-pointer"
                                            title="Удалить строку"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* SUBSECTION MODE: RENDER DEFAULT DISPLAY */
                        <>
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                                {sub.id}
                              </span>
                              <h3 className="text-sm font-semibold text-slate-850 dark:text-white leading-snug">
                                {sub.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCMSActive && (
                                <>
                                  <button
                                    onClick={() => startEditSubsection(sub)}
                                    className="p-1 px-2 border border-slate-250 dark:border-slate-800 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] text-slate-500 hover:text-blue-500 dark:text-slate-450 dark:hover:text-blue-400 font-medium transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Правка</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubsection(currentChapter.id, section.id, sub.id)}
                                    className="p-1 border border-slate-250 dark:border-slate-800/80 rounded-md hover:bg-red-50/10 text-slate-400 hover:text-red-500 transition cursor-pointer"
                                    title="Удалить статью"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => toggleBookmark(sub.id)}
                                className="text-slate-400 hover:text-amber-500 transition cursor-pointer"
                                title={bookmarks.includes(sub.id) ? "Убрать из закладок" : "В закладки"}
                              >
                                {bookmarks.includes(sub.id) ? (
                                  <BookmarkCheck className="h-5 w-5 text-amber-500 fill-amber-500" />
                                ) : (
                                  <Bookmark className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Illustration Image Renderer */}
                          {sub.imageUrl && !sub.content.includes(sub.imageUrl) && (
                            <figure className="my-3 overflow-hidden rounded-xl bg-slate-50 border border-slate-200 dark:border-slate-800 flex items-center justify-center max-h-96 shadow-sm">
                              <img 
                                src={sub.imageUrl} 
                                alt={sub.title} 
                                referrerPolicy="no-referrer" 
                                loading="lazy"
                                className="max-h-96 object-contain w-full p-2" 
                              />
                            </figure>
                          )}

                          {sub.images && sub.images.length > 0 && (
                            <div className={`my-4 grid gap-4 ${sub.images.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}>
                              {sub.images.filter((articleImage) => articleImage.src).map((articleImage, imageIndex) => (
                                <figure key={`${articleImage.src}-${imageIndex}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                                  <div className="flex min-h-48 items-center justify-center bg-white p-2">
                                    <img
                                      src={articleImage.src}
                                      alt={articleImage.alt || sub.title}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      className="max-h-[32rem] w-full object-contain"
                                    />
                                  </div>
                                  {articleImage.caption && (
                                    <figcaption className="border-t border-slate-200 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
                                      <span className="block text-slate-700">{articleImage.caption}</span>
                                    </figcaption>
                                  )}
                                </figure>
                              ))}
                            </div>
                          )}

                          {/* Textbook Article Content */}
                          <div 
                            className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed font-sans space-y-2 textbook-html-content"
                            dangerouslySetInnerHTML={{ __html: sub.content }}
                          />

                          {/* Specific formulas */}
                          {sub.formulas && sub.formulas.length > 0 && (
                            <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded font-mono text-xs text-slate-700 dark:text-slate-300">
                              <span className="text-[10px] text-amber-600 dark:text-amber-500 font-bold tracking-wide block uppercase mb-1 font-mono">Основные формулы раздела:</span>
                              <ul className="space-y-1">
                                {sub.formulas.map((form, fIdx) => (
                                  <li key={fIdx}>• {highlightText(form, searchQuery)}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Technical State Standards (GOSTs) */}
                          {sub.gostReference && (
                            <div className="p-1 px-2.5 bg-slate-100 dark:bg-slate-900/30 border-l-2 border-amber-550 rounded text-[11px] text-amber-700 dark:text-amber-300 font-mono flex items-center space-x-2">
                              <span className="font-bold text-[9px] uppercase tracking-wider block bg-amber-500/10 px-1.5 py-0.5 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded mb-0">ГОСТ РФ</span>
                              <span>{sub.gostReference}</span>
                            </div>
                          )}

                          {/* Subsection Attached links renderer */}
                          {sub.links && sub.links.length > 0 && (
                            <div className="pt-2 flex flex-wrap gap-2.5">
                              {sub.links.map((link, lIdx) => (
                                <a 
                                  key={lIdx} 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium bg-blue-50/50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/30 transition-colors"
                                >
                                  <Link2 className="h-3 w-3" />
                                  <span>{link.title}</span>
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Render specific tables if available */}
                          {sub.tables && sub.tables.map((table, tIdx) => (
                            <div key={tIdx} className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg mt-3">
                              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs bg-white dark:bg-slate-900">
                                <thead>
                                  <tr className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono">
                                    {table.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="px-4 py-2.5 text-xs font-semibold uppercase font-mono">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                                  {table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-4 py-2 text-slate-600 dark:text-slate-350">
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {table.caption && (
                                <div className="p-2 bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 text-right italic font-mono uppercase">
                                  {table.caption}
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Key terms */}
                          {sub.keyTerms && sub.keyTerms.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                              {sub.keyTerms.map((term, kIdx) => (
                                <div key={kIdx} className="p-2.5 bg-slate-100/50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-850">
                                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-0.5">
                                    {term.term}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                    {term.definition}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {isCMSActive && (
                  <button
                    onClick={() => handleAddSubsection(currentChapter.id, section.id)}
                    className="w-full py-3 border border-dashed border-blue-500/30 text-blue-600 dark:text-blue-450 hover:bg-blue-500/5 transition rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить статью (Подраздел в {section.id})
                  </button>
                )}
              </div>
            ))}

            {isCMSActive && (
              <div className="pt-4 mt-6 border-t dark:border-slate-800">
                <button
                  onClick={() => handleAddSection(currentChapter.id)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-950 hover:bg-slate-150 dark:hover:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-blue-500" />
                  Добавить новый заголовок раздела (Section) в {currentChapter.id}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Appendices Tables Screen */}
        {currentApp && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-amber-500" />
                  {currentApp.title}
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">Официальные справочные ГОСТ таблицы ВсОШ</p>
                {currentApp.description && <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-500">{currentApp.description}</p>}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs bg-slate-50 dark:bg-slate-950">
                <thead>
                  <tr className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {currentApp.headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                  {currentApp.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-100 dark:hover:bg-slate-900">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-3 font-sans text-slate-650 dark:text-slate-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
