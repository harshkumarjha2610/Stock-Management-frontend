'use client';
import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useLocale } from "next-intl";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Types ─────────────────────────────────────────────────
type Category = {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  icon?: string;
};

type FAQItem = {
  id: string;
  question: string;
  questionAr?: string;
  answer: string;
  answerAr?: string;
  categoryId?: string;
};

// ─── Translations ──────────────────────────────────────────
const t = {
  en: {
    pageTitle:          "Frequently Asked Questions",
    pageSubtitle:       "Everything you need to know about CoBuild. Can't find an answer?",
    askCommunity:       "Ask the community.",
    searchPlaceholder:  "Search questions...",
    result:             "result",
    results:            "results",
    allTopics:          "All Topics",
    question:           "question",
    questions:          "questions",
    noQuestionsYet:     "No questions in this category yet.",
    noFaqsYet:          "No FAQs available yet.",
    noResultsFor:       "No results for",
    tryDifferent:       "Try a different keyword.",
    clearSearch:        "Clear search",
    stillHaveQuestions: "Still have questions?",
    supportReply:       "Our support team typically responds within 24 hours on business days.",
    askTheCommunity:    "Ask the Community",
    contactSupport:     "Contact Support",
    failedLoad:         "Failed to load FAQs. Please try again later.",
    failedSome:         "Failed to load some FAQ items.",
    retry:              "Retry",
  },
  ar: {
    pageTitle:          "الأسئلة الشائعة",
    pageSubtitle:       "كل ما تحتاج معرفته عن CoBuild. لم تجد إجابتك؟",
    askCommunity:       "اسأل المجتمع.",
    searchPlaceholder:  "ابحث عن سؤال...",
    result:             "نتيجة",
    results:            "نتائج",
    allTopics:          "جميع المواضيع",
    question:           "سؤال",
    questions:          "أسئلة",
    noQuestionsYet:     "لا توجد أسئلة في هذه الفئة بعد.",
    noFaqsYet:          "لا توجد أسئلة شائعة بعد.",
    noResultsFor:       "لا توجد نتائج لـ",
    tryDifferent:       "جرّب كلمة مفتاحية أخرى.",
    clearSearch:        "مسح البحث",
    stillHaveQuestions: "هل لديك المزيد من الأسئلة؟",
    supportReply:       "يرد فريق الدعم عادةً خلال 24 ساعة في أيام العمل.",
    askTheCommunity:    "اسأل المجتمع",
    contactSupport:     "تواصل مع الدعم",
    failedLoad:         "فشل تحميل الأسئلة الشائعة. يرجى المحاولة مرة أخرى لاحقاً.",
    failedSome:         "فشل تحميل بعض الأسئلة الشائعة.",
    retry:              "إعادة المحاولة",
  },
};

// ─── Emoji fallback per category name ──────────────────────
function getCategoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("start") || n.includes("begin") || n.includes("بداية") || n.includes("ابدأ"))  return "🚀";
  if (n.includes("invest") || n.includes("portfo") || n.includes("استثمار") || n.includes("محفظة")) return "📈";
  if (n.includes("wallet") || n.includes("pay") || n.includes("محفظة") || n.includes("دفع"))   return "💳";
  if (n.includes("secur") || n.includes("account") || n.includes("أمان") || n.includes("حساب"))  return "🔒";
  if (n.includes("commun") || n.includes("مجتمع"))                                               return "🤝";
  if (n.includes("project") || n.includes("مشروع"))                                             return "🏗️";
  if (n.includes("kyc") || n.includes("verif") || n.includes("توثيق") || n.includes("تحقق"))   return "📋";
  return "❓";
}

// ─── Accordion Item ────────────────────────────────────────
const FAQAccordionItem = ({
  item,
  isOpen,
  onToggle,
  isAr,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  isAr: boolean;
}) => {
  // ✅ Use Arabic fields from API if available and locale is Arabic
  const displayQuestion = isAr && item.questionAr ? item.questionAr : item.question;
  const displayAnswer   = isAr && item.answerAr   ? item.answerAr   : item.answer;

  return (
    <div
      className={`rounded-[14px] border transition-all duration-300 overflow-hidden ${
        isOpen ? "border-[#ef6b23]/50 bg-[#2a2a2a]" : "border-white/10 bg-[#2a2a2a]"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left group"
      >
        <span
          className={`font-medium text-sm sm:text-base transition-colors duration-200 ${
            isAr ? "text-right" : "text-left"
          } ${isOpen ? "text-[#ef6b23]" : "text-white group-hover:text-white/90"}`}
        >
          {displayQuestion}
        </span>
        {/* ✅ Chevron: rotate direction aware for RTL */}
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isAr ? "mr-3" : "ml-3"
          } ${isOpen ? "rotate-180 text-[#ef6b23]" : "text-white/50"}`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-5 pb-5 border-t border-white/10 pt-4">
          <p className={`text-gray-400 text-sm leading-relaxed ${isAr ? "text-right" : "text-left"}`}>
            {displayAnswer}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Loader ───────────────────────────────────────
const SkeletonSection = () => (
  <div className="space-y-10 animate-pulse">
    {[1, 2, 3].map((s) => (
      <div key={s}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-[10px] bg-white/10" />
          <div className="h-5 w-40 bg-white/10 rounded" />
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[14px] bg-[#2a2a2a] border border-white/10 px-5 py-4">
              <div className="h-4 bg-white/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────
export default function FAQPage() {
  const locale = useLocale();
  const isAr   = locale === "ar";
  const dir    = isAr ? "rtl" : "ltr";
  const tx     = isAr ? t.ar : t.en;

  const [categories,     setCategories]     = useState<Category[]>([]);
  const [faqsByCategory, setFaqsByCategory] = useState<Record<string, FAQItem[]>>({});
  const [openItem,       setOpenItem]       = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [loadingCats,    setLoadingCats]    = useState(true);
  const [loadingFaqs,    setLoadingFaqs]    = useState(false);
  const [error,          setError]          = useState("");

  // ── 1. Fetch all categories on mount ─────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      setError("");
      try {
        // ✅ Pass Accept-Language header so API can return Arabic content
        const res  = await fetch(`${API_BASE_URL}/faq/categories`, {
          headers: { "Accept-Language": isAr ? "ar" : "en" },
        });
        const data = await res.json();
        const cats: Category[] = data.data ?? data.categories ?? data ?? [];
        setCategories(cats);

        if (cats.length > 0) {
          setLoadingFaqs(true);
          await fetchAllFaqs(cats);
        }
      } catch {
        setError(tx.failedLoad);
      } finally {
        setLoadingCats(false);
        setLoadingFaqs(false);
      }
    };

    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAr]);  // ✅ Re-fetch when locale changes

  // ── 2. Fetch FAQs for all categories in parallel ─────────
  const fetchAllFaqs = async (cats: Category[]) => {
    try {
      const results = await Promise.all(
        cats.map(async (cat) => {
          // ✅ Pass Accept-Language + lang query param for maximum API compatibility
          const url = `${API_BASE_URL}/faq/?categoryId=${cat.id}${isAr ? "&lang=ar" : "&lang=en"}`;
          const res  = await fetch(url, {
            headers: { "Accept-Language": isAr ? "ar" : "en" },
          });
          const data = await res.json();
          const faqs: FAQItem[] = data.data ?? data.faqs ?? data ?? [];
          return { id: cat.id, faqs };
        })
      );

      const map: Record<string, FAQItem[]> = {};
      results.forEach(({ id, faqs }) => { map[id] = faqs; });
      setFaqsByCategory(map);
    } catch {
      setError(tx.failedSome);
    }
  };

  // ── 3. On-demand fetch for a single category ─────────────
  const ensureFaqsLoaded = useCallback(async (catId: string) => {
    if (faqsByCategory[catId] !== undefined) return;
    setLoadingFaqs(true);
    try {
      const url = `${API_BASE_URL}/faq/?categoryId=${catId}${isAr ? "&lang=ar" : "&lang=en"}`;
      const res  = await fetch(url, {
        headers: { "Accept-Language": isAr ? "ar" : "en" },
      });
      const data = await res.json();
      const faqs: FAQItem[] = data.data ?? data.faqs ?? data ?? [];
      setFaqsByCategory((prev) => ({ ...prev, [catId]: faqs }));
    } catch {
      console.error("Failed to fetch FAQs for category", catId);
    } finally {
      setLoadingFaqs(false);
    }
  }, [faqsByCategory, isAr]);

  const handleCategoryClick = (catId: string | null) => {
    setActiveCategory((prev) => (prev === catId ? null : catId));
    setOpenItem(null);
    if (catId) ensureFaqsLoaded(catId);
  };

  // ── Derived: build display list ───────────────────────────
  const displayCategories = categories
    .filter((cat) => activeCategory === null || cat.id === activeCategory)
    .map((cat) => {
      // ✅ Use Arabic category name from API if available
      const displayName = isAr && cat.nameAr ? cat.nameAr : cat.name;
      return {
        ...cat,
        displayName,
        emoji:     cat.icon ?? getCategoryEmoji(cat.name),
        questions: (faqsByCategory[cat.id] ?? []).filter((q) => {
          if (!searchQuery) return true;
          const lq = searchQuery.toLowerCase();
          // ✅ Search in both EN and AR fields
          const questionText = (isAr && q.questionAr ? q.questionAr : q.question).toLowerCase();
          const answerText   = (isAr && q.answerAr   ? q.answerAr   : q.answer).toLowerCase();
          return questionText.includes(lq) || answerText.includes(lq);
        }),
      };
    })
    .filter((cat) => !searchQuery || cat.questions.length > 0);

  const totalResults = displayCategories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const isLoading    = loadingCats || loadingFaqs;

  // ─── Pluralise helper (Arabic has different plural rules) ──
  const pluralise = (count: number, singular: string, plural: string) =>
    count === 1 ? `${count} ${singular}` : `${count} ${plural}`;

  return (
    <div dir={dir} className="min-h-screen bg-[#1a1a1a]">
      <div className="w-full h-4 sm:h-5 lg:h-6 bg-black" />

      <main className="w-full max-w-[98vw] sm:max-w-[97vw] md:max-w-[96vw] lg:max-w-[1230px] xl:max-w-[1600px] 2xl:max-w-[1850px] mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Hero ─────────────────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ef6b23]/15 border border-[#ef6b23]/30 mb-5">
            <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#ef6b23]" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            {tx.pageTitle}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            {tx.pageSubtitle}{" "}
            <a
              href="/community"
              className="text-[#ef6b23] hover:text-[#d95e1f] transition-colors underline underline-offset-2"
            >
              {tx.askCommunity}
            </a>
          </p>
        </div>

        {/* ── Search ───────────────────────────────────────── */}
        <div className="relative max-w-2xl mx-auto mb-8 sm:mb-10">
          {/* ✅ Search icon position flips for RTL */}
          <Search
            className={`absolute ${isAr ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none`}
          />
          <input
            type="text"
            placeholder={tx.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenItem(null); }}
            className={`w-full ${isAr ? "pr-12 pl-16 text-right" : "pl-12 pr-16"} py-3.5 bg-[#2a2a2a] border border-white/10 rounded-[14px] text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:border-[#ef6b23]/60 focus:ring-1 focus:ring-[#ef6b23]/40 transition-all`}
          />
          {searchQuery && (
            <span
              className={`absolute ${isAr ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-xs text-gray-500`}
            >
              {pluralise(totalResults, tx.result, tx.results)}
            </span>
          )}
        </div>

        {/* ── Category Filter Pills ─────────────────────────── */}
        {!searchQuery && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === null
                  ? "bg-[#ef6b23] text-white"
                  : "bg-[#2a2a2a] border border-white/10 text-white/70 hover:text-white hover:border-white/20"
              }`}
            >
              {tx.allTopics}
            </button>

            {loadingCats ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-28 rounded-full bg-white/10 animate-pulse" />
              ))
            ) : (
              categories.map((cat) => {
                // ✅ Show Arabic name from API in pill
                const pillName = isAr && cat.nameAr ? cat.nameAr : cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      activeCategory === cat.id
                        ? "bg-[#ef6b23] text-white"
                        : "bg-[#2a2a2a] border border-white/10 text-white/70 hover:text-white hover:border-white/20"
                    }`}
                  >
                    <span>{cat.icon ?? getCategoryEmoji(cat.name)}</span>
                    {pillName}
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────── */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-[14px] text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-[#ef6b23] text-xs hover:underline"
            >
              {tx.retry}
            </button>
          </div>
        )}

        {/* ── Content ──────────────────────────────────────── */}
        {isLoading ? (
          <SkeletonSection />
        ) : displayCategories.length === 0 ? (
          <div className="text-center py-20">
            {searchQuery ? (
              <>
                <p className="text-gray-500 text-base">
                  {tx.noResultsFor}{" "}
                  <span className="text-white">"{searchQuery}"</span>.{" "}
                  {tx.tryDifferent}
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-[#ef6b23] text-sm hover:underline"
                >
                  {tx.clearSearch}
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-base">{tx.noFaqsYet}</p>
            )}
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {displayCategories.map((cat) => (
              <section key={cat.id}>

                {/* Category Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#3a3a3a] border border-white/10 text-xl flex-shrink-0">
                    {cat.emoji}
                  </div>
                  <h2 className="text-white font-semibold text-lg sm:text-xl">
                    {/* ✅ Arabic category name from API */}
                    {cat.displayName}
                  </h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {pluralise(cat.questions.length, tx.question, tx.questions)}
                  </span>
                </div>

                {/* Accordion Items */}
                {cat.questions.length === 0 ? (
                  <div className="rounded-[14px] border border-white/10 bg-[#2a2a2a] px-5 py-6 text-center">
                    <p className="text-gray-500 text-sm">{tx.noQuestionsYet}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cat.questions.map((item) => (
                      <FAQAccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openItem === item.id}
                        isAr={isAr}
                        onToggle={() =>
                          setOpenItem((prev) => (prev === item.id ? null : item.id))
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* ── Bottom CTA ───────────────────────────────────── */}
        {!isLoading && !error && (
          <div className="mt-14 sm:mt-20 rounded-[20px] bg-[#3a3a3a] border border-white/10 px-6 py-10 text-center">
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
              {tx.stillHaveQuestions}
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-md mx-auto">
              {tx.supportReply}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/community"
                className="w-full sm:w-auto px-6 py-3 rounded-[12px] bg-[#ef6b23] hover:bg-[#d95e1f] text-white font-medium text-sm transition-colors duration-200"
              >
                {tx.askTheCommunity}
              </a>
              <a
                href="mailto:support@cobuild.com"
                className="w-full sm:w-auto px-6 py-3 rounded-[12px] bg-[#2a2a2a] border border-white/10 hover:bg-[#4a4a4a] text-white font-medium text-sm transition-colors duration-200"
              >
                {tx.contactSupport}
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
