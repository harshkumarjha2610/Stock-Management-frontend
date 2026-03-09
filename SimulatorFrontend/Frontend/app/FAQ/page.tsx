'use client';
import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, HelpCircle, Search, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Types ─────────────────────────────────────────────────
type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  categoryId?: string;
};

// ─── Emoji fallback per category name ──────────────────────
function getCategoryEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("start") || n.includes("begin"))   return "🚀";
  if (n.includes("invest") || n.includes("portfo"))  return "📈";
  if (n.includes("wallet") || n.includes("pay"))     return "💳";
  if (n.includes("secur") || n.includes("account"))  return "🔒";
  if (n.includes("commun"))                          return "🤝";
  if (n.includes("project"))                         return "🏗️";
  if (n.includes("kyc") || n.includes("verif"))      return "📋";
  return "❓";
}

// ─── Accordion Item ────────────────────────────────────────
const FAQAccordionItem = ({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) => (
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
          isOpen ? "text-[#ef6b23]" : "text-white group-hover:text-white/90"
        }`}
      >
        {item.question}
      </span>
      <ChevronDown
        className={`w-5 h-5 flex-shrink-0 ml-3 transition-transform duration-300 ${
          isOpen ? "rotate-180 text-[#ef6b23]" : "text-white/50"
        }`}
      />
    </button>

    <div
      className={`transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
      } overflow-hidden`}
    >
      <div className="px-5 pb-5 border-t border-white/10 pt-4">
        <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
      </div>
    </div>
  </div>
);

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
  const [categories,      setCategories]      = useState<Category[]>([]);
  const [faqsByCategory,  setFaqsByCategory]  = useState<Record<string, FAQItem[]>>({});
  const [openItem,        setOpenItem]        = useState<string | null>(null);
  const [activeCategory,  setActiveCategory]  = useState<string | null>(null);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [loadingCats,     setLoadingCats]     = useState(true);
  const [loadingFaqs,     setLoadingFaqs]     = useState(false);
  const [error,           setError]           = useState("");

  // ── 1. Fetch all categories on mount ─────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCats(true);
      setError("");
      try {
        const res  = await fetch(`${API_BASE_URL}/faq/categories`);
        const data = await res.json();

        const cats: Category[] = data.data ?? data.categories ?? data ?? [];
        setCategories(cats);

        // Fetch FAQs for all categories in parallel
        if (cats.length > 0) {
          setLoadingFaqs(true);
          await fetchAllFaqs(cats);
        }
      } catch {
        setError("Failed to load FAQs. Please try again later.");
      } finally {
        setLoadingCats(false);
        setLoadingFaqs(false);
      }
    };

    fetchCategories();
  }, []);

  // ── 2. Fetch FAQs for all categories in parallel ─────────
  const fetchAllFaqs = async (cats: Category[]) => {
    try {
      const results = await Promise.all(
        cats.map(async (cat) => {
          const res  = await fetch(`${API_BASE_URL}/faq/?categoryId=${cat.id}`);
          const data = await res.json();
          const faqs: FAQItem[] = data.data ?? data.faqs ?? data ?? [];
          return { id: cat.id, faqs };
        })
      );

      const map: Record<string, FAQItem[]> = {};
      results.forEach(({ id, faqs }) => { map[id] = faqs; });
      setFaqsByCategory(map);
    } catch {
      setError("Failed to load some FAQ items.");
    }
  };

  // ── 3. Fetch FAQs for a specific category on tab click ───
  // (already pre-fetched above, but if a new category is selected
  //  and not yet loaded, fetch on-demand)
  const ensureFaqsLoaded = useCallback(async (catId: string) => {
    if (faqsByCategory[catId] !== undefined) return; // already loaded
    setLoadingFaqs(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/faq/?categoryId=${catId}`);
      const data = await res.json();
      const faqs: FAQItem[] = data.data ?? data.faqs ?? data ?? [];
      setFaqsByCategory((prev) => ({ ...prev, [catId]: faqs }));
    } catch {
      console.error("Failed to fetch FAQs for category", catId);
    } finally {
      setLoadingFaqs(false);
    }
  }, [faqsByCategory]);

  const handleCategoryClick = (catId: string | null) => {
    setActiveCategory((prev) => (prev === catId ? null : catId));
    setOpenItem(null);
    if (catId) ensureFaqsLoaded(catId);
  };

  // ── Derived: build display list ───────────────────────────
  const displayCategories = categories
    .filter((cat) => activeCategory === null || cat.id === activeCategory)
    .map((cat) => ({
      ...cat,
      emoji:     cat.icon ?? getCategoryEmoji(cat.name),
      questions: (faqsByCategory[cat.id] ?? []).filter((q) => {
        if (!searchQuery) return true;
        const lq = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(lq) ||
          q.answer.toLowerCase().includes(lq)
        );
      }),
    }))
    .filter((cat) => !searchQuery || cat.questions.length > 0);

  const totalResults = displayCategories.reduce(
    (acc, cat) => acc + cat.questions.length, 0
  );

  const isLoading = loadingCats || loadingFaqs;

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="w-full h-4 sm:h-5 lg:h-6 bg-black" />

      <main className="w-full max-w-[98vw] sm:max-w-[97vw] md:max-w-[96vw] lg:max-w-[1230px] xl:max-w-[1600px] 2xl:max-w-[1850px] mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Hero ───────────────────────────────────────────── */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ef6b23]/15 border border-[#ef6b23]/30 mb-5">
            <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-[#ef6b23]" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Everything you need to know about CoBuild. Can't find an answer?{" "}
            <a
              href="/community"
              className="text-[#ef6b23] hover:text-[#d95e1f] transition-colors underline underline-offset-2"
            >
              Ask the community.
            </a>
          </p>
        </div>

        {/* ── Search ─────────────────────────────────────────── */}
        <div className="relative max-w-2xl mx-auto mb-8 sm:mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenItem(null); }}
            className="w-full pl-12 pr-16 py-3.5 bg-[#2a2a2a] border border-white/10 rounded-[14px] text-white placeholder-gray-500 text-sm sm:text-base focus:outline-none focus:border-[#ef6b23]/60 focus:ring-1 focus:ring-[#ef6b23]/40 transition-all"
          />
          {searchQuery && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Category Filter Pills ───────────────────────────── */}
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
              All Topics
            </button>
            {loadingCats ? (
              // Skeleton pills
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-28 rounded-full bg-white/10 animate-pulse" />
              ))
            ) : (
              categories.map((cat) => (
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
                  {cat.name}
                </button>
              ))
            )}
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────── */}
        {error && !isLoading && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-[14px] text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-[#ef6b23] text-xs hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Content ────────────────────────────────────────── */}
        {isLoading ? (
          <SkeletonSection />
        ) : displayCategories.length === 0 ? (
          <div className="text-center py-20">
            {searchQuery ? (
              <>
                <p className="text-gray-500 text-base">
                  No results for{" "}
                  <span className="text-white">"{searchQuery}"</span>.
                  Try a different keyword.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-[#ef6b23] text-sm hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="text-gray-500 text-base">No FAQs available yet.</p>
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
                    {cat.name}
                  </h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {cat.questions.length} question{cat.questions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Accordion Items */}
                {cat.questions.length === 0 ? (
                  <div className="rounded-[14px] border border-white/10 bg-[#2a2a2a] px-5 py-6 text-center">
                    <p className="text-gray-500 text-sm">No questions in this category yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cat.questions.map((item) => (
                      <FAQAccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openItem === item.id}
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

        {/* ── Bottom CTA ─────────────────────────────────────── */}
        {!isLoading && !error && (
          <div className="mt-14 sm:mt-20 rounded-[20px] bg-[#3a3a3a] border border-white/10 px-6 py-10 text-center">
            <h3 className="text-white text-xl sm:text-2xl font-bold mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-400 text-sm sm:text-base mb-6 max-w-md mx-auto">
              Our support team typically responds within 24 hours on business days.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/community"
                className="w-full sm:w-auto px-6 py-3 rounded-[12px] bg-[#ef6b23] hover:bg-[#d95e1f] text-white font-medium text-sm transition-colors duration-200"
              >
                Ask the Community
              </a>
              <a
                href="mailto:support@cobuild.com"
                className="w-full sm:w-auto px-6 py-3 rounded-[12px] bg-[#2a2a2a] border border-white/10 hover:bg-[#4a4a4a] text-white font-medium text-sm transition-colors duration-200"
              >
                Contact Support
              </a>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
