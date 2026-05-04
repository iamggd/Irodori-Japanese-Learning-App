import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme/colors';

type ThemeColors = typeof colors.light;

// ─── Simulated PDF pages (since we're in a web environment) ───────────────────
// In the Android app these would be rendered via PdfRenderer from assets/pdf/
// Here we simulate PDF pages with rich content matching the Irodori style

interface PdfPage {
  pageNum: number;
  content: React.ReactNode;
}

function generatePdfPages(bookId: string, totalPages: number): PdfPage[] {
  const lessons = Math.ceil(totalPages / 2);
  return Array.from({ length: totalPages }, (_, i) => ({
    pageNum: i + 1,
    content: (
      <PdfPageContent
        pageNum={i + 1}
        bookId={bookId}
        lesson={Math.ceil((i + 1) / 2)}
        isAnswerPage={(i + 1) % 2 === 0}
        totalLessons={lessons}
      />
    ),
  }));
}

function PdfPageContent({
  pageNum,
  bookId,
  lesson,
  isAnswerPage,
  totalLessons: _totalLessons,
}: {
  pageNum: number;
  bookId: string;
  lesson: number;
  isAnswerPage: boolean;
  totalLessons: number;
}) {
  const answers = [
    ['① はい、そうです。', '② いいえ、ちがいます。', '③ わかりません。'],
    ['① a → b → c', '② 3ばん → 1ばん → 2ばん', '③ まず、つぎに、それから'],
    ['① Aさん: 東京、Bさん: 大阪', '② ①T ②F ③T', '③ ①b ②a ③c'],
  ];
  const questionEx = [
    'もんだい１　つぎのぶんを よんで、こたえてください。',
    'もんだい２　（　）に なにを いれますか。',
    'もんだい３　ただしいものを えらんでください。',
  ];

  if (pageNum === 1) {
    // Cover page
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
        <div className="text-6xl">{bookId === 'A1' ? '🌸' : bookId === 'A2X' ? '🍃' : '🎋'}</div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">いろどり {bookId}</h1>
          <p className="text-gray-500 text-sm">こたえ・Answer Key</p>
          <p className="text-gray-400 text-xs mt-1">国際交流基金</p>
        </div>
        <div className="mt-4 w-24 h-0.5 bg-gray-200 rounded" />
        <p className="text-xs text-gray-400">Page {pageNum}</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {isAnswerPage ? 'こたえ' : 'もんだい'}
        </span>
        <span className="text-xs text-gray-400">だい{lesson}か · p.{pageNum}</span>
      </div>

      {/* Lesson title */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-800">
          だい{String(lesson).padStart(2, '0')}か — {isAnswerPage ? 'こたえあわせ' : 'れんしゅう'}
        </h2>
      </div>

      {/* Content */}
      {isAnswerPage ? (
        <div className="space-y-4">
          {answers.slice(0, 2 + (pageNum % 3)).map((set, gi) => (
            <div key={gi} className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <p className="text-xs font-bold text-orange-600 mb-2">もんだい{gi + 1}</p>
              <div className="space-y-1">
                {set.map((ans, ai) => (
                  <p key={ai} className="text-sm text-gray-700">{ans}</p>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-bold text-blue-600 mb-1">📝 ポイント</p>
            <p className="text-xs text-gray-600">
              {pageNum % 2 === 0
                ? '〜ています は どうさ の けいぞく を あらわします。'
                : 'て-form は せつぞく の とき に つかいます。'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questionEx.slice(0, 2 + (lesson % 2)).map((q, qi) => (
            <div key={qi}>
              <p className="text-xs font-medium text-gray-600 mb-2">{q}</p>
              <div className="space-y-1.5">
                {['１', '２', '３'].slice(0, 2 + (qi % 2)).map((n, ni) => (
                  <div key={ni} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">{n}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded" style={{ width: `${60 + ni * 15}%` }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Zoom controls ─────────────────────────────────────────────────────────────
function ZoomButton({ label, onClick, c }: { label: string; onClick: () => void; c: ThemeColors }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
      style={{ backgroundColor: c.surface, color: c.textPrimary, border: `1px solid ${c.border}` }}
      onClick={onClick}
    >
      {label}
    </motion.button>
  );
}

// ─── Jump to Page Input ────────────────────────────────────────────────────────
function JumpToPageInput({
  totalPages,
  onJump,
  c,
}: {
  totalPages: number;
  onJump: (page: number) => void;
  c: ThemeColors;
}) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onJump(num);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Page…"
        className="w-16 h-8 rounded-lg text-center text-xs outline-none"
        style={{
          backgroundColor: c.surface,
          color: c.textPrimary,
          border: `1px solid ${c.border}`,
        }}
      />
      <motion.button
        whileTap={{ scale: 0.9 }}
        type="submit"
        className="h-8 px-3 rounded-lg text-xs font-semibold"
        style={{ backgroundColor: c.primary, color: '#FFF' }}
      >
        Go
      </motion.button>
    </form>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────────
function LoadingState({ c }: { c: ThemeColors }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        className="w-10 h-10 rounded-full border-3"
        style={{ border: `3px solid ${c.border}`, borderTopColor: c.primary }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm" style={{ color: c.textSecondary }}>Loading PDF…</p>
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ message, onRetry, c }: { message: string; onRetry: () => void; c: ThemeColors }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="text-4xl">⚠️</div>
      <p className="text-sm text-center px-8" style={{ color: c.textSecondary }}>{message}</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold"
        style={{ backgroundColor: c.primary, color: '#FFF' }}
        onClick={onRetry}
      >
        Retry
      </motion.button>
    </div>
  );
}

// ─── Main PdfViewerScreen ─────────────────────────────────────────────────────
export default function PdfViewerScreen({ bookId }: { bookId: string }) {
  const { resolvedDark } = useThemeStore();
  const c: ThemeColors = resolvedDark ? colors.dark : colors.light;

  const TOTAL_PAGES = bookId === 'A1' ? 24 : 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  const pdfPages = generatePdfPages(bookId, TOTAL_PAGES);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(TOTAL_PAGES, page)));
  }, [TOTAL_PAGES]);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  }, []);

  // Pinch-to-zoom simulation via touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setPinchStartDist(Math.hypot(dx, dy));
      setPinchStartScale(scale);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const newScale = Math.max(0.5, Math.min(3.0, pinchStartScale * (dist / pinchStartDist)));
      setScale(newScale);
    }
  }, [pinchStartDist, pinchStartScale]);

  const handleTouchEnd = useCallback(() => {
    setPinchStartDist(null);
  }, []);

  const currentPdfPage = pdfPages[currentPage - 1];

  return (
    <div className="flex flex-col h-full pb-40" style={{ backgroundColor: c.background }}>
      {/* PDF Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 gap-3 flex-wrap"
        style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.border}` }}
      >
        {/* Page indicator */}
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ backgroundColor: resolvedDark ? '#2C2C2C' : '#F5EFE8', color: c.primary }}
        >
          Page {currentPage} of {TOTAL_PAGES}
        </div>

        {/* Jump to page */}
        <JumpToPageInput totalPages={TOTAL_PAGES} onJump={goToPage} c={c} />

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <ZoomButton label="−" onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} c={c} />
          <span className="text-xs font-medium w-10 text-center" style={{ color: c.textSecondary }}>
            {Math.round(scale * 100)}%
          </span>
          <ZoomButton label="+" onClick={() => setScale((s) => Math.min(3.0, s + 0.25))} c={c} />
        </div>
      </div>

      {/* Navigation buttons */}
      <div
        className="flex items-center justify-between px-4 py-2 gap-2"
        style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.border}` }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: resolvedDark ? '#2C2C2C' : '#EEEBE6', color: c.textPrimary }}
          onClick={() => goToPage(currentPage - 1)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Previous
        </motion.button>

        {/* Page dots (show max 7) */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(TOTAL_PAGES, 7) }, (_, i) => {
            const pageNum = TOTAL_PAGES <= 7
              ? i + 1
              : currentPage <= 4
              ? i + 1
              : currentPage >= TOTAL_PAGES - 3
              ? TOTAL_PAGES - 6 + i
              : currentPage - 3 + i;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: isActive ? 20 : 6,
                  height: 6,
                  backgroundColor: isActive ? c.primary : c.border,
                }}
                onClick={() => goToPage(pageNum)}
              />
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={currentPage === TOTAL_PAGES}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: resolvedDark ? '#2C2C2C' : '#EEEBE6', color: c.textPrimary }}
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </motion.button>
      </div>

      {/* PDF Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4"
        style={{ backgroundColor: resolvedDark ? '#0A0A0A' : '#E8E4DF' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState c={c} key="loading" />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} c={c} key="error" />
          ) : (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                width: 340,
                minHeight: 480,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                overflow: 'hidden',
              }}
            >
              {currentPdfPage?.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
