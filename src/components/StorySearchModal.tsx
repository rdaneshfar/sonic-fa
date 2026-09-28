import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  BookOpen,
  Send,
  X,
  Loader2,
  Bookmark,
  Music,
  Volume2,
  Users,
  Feather,
  RefreshCw,
} from 'lucide-react';

export interface SearchStoryItem {
  id: string;
  title: string;
  source: string;
  category: string;
  summary: string;
  fullText: string;
  suggestedMusic: string;
  suggestedSfx: string[];
}

interface StorySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForNarrator: (text: string, suggestedMusic: string, suggestedSfx: string[]) => void;
  onSelectForDialogue: (text: string) => void;
  lang: 'fa' | 'en';
}

const POPULAR_THEMES = [
  { label: 'شاهنامه و اساطیر پهلوانی', query: 'داستان‌های اساطیری شاهنامه نبرد رستم و پهلوانان' },
  { label: 'زال و سیمرغ', query: 'داستان زال و سیمرغ در البرزکوه و تولد رستم' },
  { label: 'سیاوش در گذر آتش', query: 'داستان گذر سیاوش از آتش و پاکدامنی او' },
  { label: 'کلیله و دمنه (حکایات تمثیلی)', query: 'حکایت تمثیلی آموزنده از کلیله و دمنه با حیوانات' },
  { label: 'داستان‌های مثنوی معنوی', query: 'داستان تمثیلی و عرفانی از مثنوی معنوی مولانا' },
  { label: 'هزار و یک شب و افسانه‌ها', query: 'افسانه کهن پرکشش و دراماتیک از هزار و یک شب' },
];

export const StorySearchModal: React.FC<StorySearchModalProps> = ({
  isOpen,
  onClose,
  onSelectForNarrator,
  onSelectForDialogue,
  lang,
}) => {
  const isFa = lang === 'fa';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('همه');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchStoryItem[]>([]);
  const [selectedStory, setSelectedStory] = useState<SearchStoryItem | null>(null);

  // Initial fetch on open
  useEffect(() => {
    if (isOpen && results.length === 0) {
      handleSearch('داستان‌های حماسی شاهنامه فردوسی و اساطیر ایرانی');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (queryToUse?: string) => {
    const q = queryToUse !== undefined ? queryToUse : searchQuery;
    setIsLoading(true);
    try {
      const resp = await fetch('/api/search-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q || 'شاهنامه و داستان‌های اساطیری کهن ایرانی',
          category: selectedCategory !== 'همه' ? selectedCategory : undefined,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.results && Array.isArray(data.results)) {
          setResults(data.results);
          if (data.results.length > 0) {
            setSelectedStory(data.results[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to search stories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToNarrator = (story: SearchStoryItem) => {
    onSelectForNarrator(story.fullText, story.suggestedMusic, story.suggestedSfx);
    onClose();
  };

  const handleApplyToDialogue = (story: SearchStoryItem) => {
    onSelectForDialogue(story.fullText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden shadow-2xl"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100 flex items-center gap-2">
                <span>{isFa ? 'گنجینه و جستجوی داستان‌های اساطیری و کهن' : 'Mythological & Literary Story Explorer'}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                  {isFa ? 'هوشمند و بدون هاردکد' : 'AI Dynamic Search'}
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                {isFa
                  ? 'جستجو و فراخوانی داستان‌های شاهنامه، مثنوی، کلیله و دمنه و افسانه‌ها برای تبدیل به نریشن یا نمایشنامه صوتی'
                  : 'Search and load classical Persian epics, fables and tales for single narration or multi-character drama.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Fast Theme Chips */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isFa
                    ? 'جستجوی داستان... (مثلاً: نبرد رستم و اسفندیار، زال و سیمرغ، شیر و خرگوش کلیله و دمنه)'
                    : 'Search story topics (e.g., Rostam and Sohrab, Siavash, Rumi tales)...'
                }
                className="w-full pl-4 pr-10 py-2.5 bg-neutral-950/80 border border-neutral-700/80 rounded-xl text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-500/80 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isFa ? 'جستجو و فراخوانی' : 'Search & Fetch'}</span>
            </button>
          </form>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-neutral-400 shrink-0 text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isFa ? 'موضوعات پیشنهادی:' : 'Suggested Themes:'}</span>
            </span>
            {POPULAR_THEMES.map((theme, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(theme.query);
                  handleSearch(theme.query);
                }}
                className="px-3 py-1 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-neutral-700/60 whitespace-nowrap text-xs transition-colors cursor-pointer"
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body (2 Columns: List on Right, Preview & Actions on Left) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-neutral-800">
          {/* Story List (5 cols) */}
          <div className="md:col-span-5 h-full overflow-y-auto p-4 flex flex-col gap-2.5">
            {isLoading && (
              <div className="p-8 flex flex-col items-center justify-center gap-3 text-neutral-400">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">{isFa ? 'در حال جستجو و گردآوری داستان‌های اصیل...' : 'Searching stories...'}</span>
              </div>
            )}

            {!isLoading && results.length === 0 && (
              <div className="p-8 text-center text-neutral-500 text-xs flex flex-col items-center gap-2">
                <BookOpen className="w-8 h-8 text-neutral-600" />
                <span>{isFa ? 'داستانی یافت نشد، کلمه دیگری جستجو کنید.' : 'No stories found. Try a different query.'}</span>
              </div>
            )}

            {!isLoading &&
              results.map((story) => {
                const isSelected = selectedStory?.id === story.id;
                return (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-lg'
                        : 'bg-neutral-950/50 border-neutral-800/80 hover:bg-neutral-800/50 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-neutral-100 line-clamp-1">{story.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300 font-medium shrink-0 border border-neutral-700/60">
                        {story.source}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{story.summary}</p>

                    <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                      <span className="flex items-center gap-1 text-neutral-400">
                        <Feather className="w-3 h-3 text-amber-400" />
                        <span>{story.category}</span>
                      </span>
                      <span className="text-emerald-400/80 font-mono text-[10px]">
                        ~{story.fullText.split(/\s+/).length} کلمه
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Story Preview & Transfer Actions (7 cols) */}
          <div className="md:col-span-7 h-full overflow-y-auto p-5 flex flex-col justify-between bg-neutral-950/30">
            {selectedStory ? (
              <div className="flex flex-col gap-4">
                {/* Story Top Info */}
                <div className="flex flex-col gap-1.5 pb-3 border-b border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{selectedStory.source}</span>
                    </span>
                    <span className="text-xs text-neutral-400 bg-neutral-800 px-2.5 py-0.5 rounded-lg border border-neutral-700/60">
                      {selectedStory.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-100">{selectedStory.title}</h3>
                </div>

                {/* Full Text Display */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 max-h-[360px] overflow-y-auto">
                  <p className="text-sm text-neutral-200 leading-loose text-justify font-sans whitespace-pre-wrap select-text">
                    {selectedStory.fullText}
                  </p>
                </div>

                {/* Suggestions Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-amber-400" />
                    <span>موسیقی پیشنهادی:</span>
                    <span className="text-neutral-200 font-bold">{selectedStory.suggestedMusic}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-rose-400" />
                    <span>افکت‌های صوتی:</span>
                    <span className="text-neutral-200">{selectedStory.suggestedSfx?.join('، ') || 'دف و زنگ'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-800">
                  <button
                    onClick={() => handleApplyToNarrator(selectedStory)}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <div className="flex flex-col text-right">
                      <span>ارسال به استودیوی تک‌گوینده</span>
                      <span className="text-[10px] text-neutral-400 font-normal">خوانش یکدست با گوینده منتخب</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleApplyToDialogue(selectedStory)}
                    className="p-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-neutral-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Users className="w-4 h-4 text-neutral-950" />
                    <div className="flex flex-col text-right">
                      <span>کارگردانی خودکار دیالوگ‌ها ✨</span>
                      <span className="text-[10px] text-neutral-900/80 font-normal">تفکیک راوی و کاراکترها با هوش مصنوعی</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-sm">
                <BookOpen className="w-10 h-10 mb-2 text-neutral-700" />
                <span>یک داستان را از لیست انتخاب کنید تا پیش‌نمایش و گزینه‌های انتقال نمایش داده شوند.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
