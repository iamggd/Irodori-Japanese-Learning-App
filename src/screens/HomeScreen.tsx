import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { BOOKS } from '../data/books';
import { TopBar } from '../components/TopBar';
import type { Book } from '../types';
import { colors } from '../theme/colors';
import { useWindowSize } from '../hooks/useWindowSize';

type ThemeColors = typeof colors.light;

function BookCard({ book, index, onClick }: { book: Book; index: number; onClick: () => void }) {
  const { resolvedDark } = useThemeStore();
  const c: ThemeColors = resolvedDark ? colors.dark : colors.light;
  const badgeInfo = c.badge[book.id as keyof typeof c.badge];

  const gradients: Record<string, string> = {
    A1: 'from-orange-400 to-red-400',
    A2X: 'from-blue-400 to-sky-500',
    A2Y: 'from-purple-400 to-violet-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.45, type: 'spring', damping: 20, stiffness: 200 }}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.015, y: -3 }}
      className="relative overflow-hidden rounded-3xl cursor-pointer select-none"
      style={{
        backgroundColor: c.surface,
        boxShadow: c.cardShadow,
        border: `1px solid ${c.border}`,
      }}
      onClick={onClick}
    >
      {/* Top gradient band */}
      <div className={`h-32 bg-gradient-to-br ${gradients[book.id]} flex items-center justify-between px-6`}>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#FFF' }}
        >
          {book.jlpt}
        </div>
        <div className="text-6xl opacity-90 select-none">{book.emoji}</div>
      </div>

      {/* Card body */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: badgeInfo.bg, color: badgeInfo.text }}
          >
            {book.level}
          </span>
        </div>

        <h2
          className="text-xl font-bold mb-1 tracking-tight"
          style={{ color: c.textPrimary, fontFamily: 'Inter, sans-serif' }}
        >
          {book.title}
        </h2>
        <p className="text-sm mb-4" style={{ color: c.textSecondary }}>
          {book.subtitle}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🎵</span>
            <span className="text-xs font-medium" style={{ color: c.textSecondary }}>
              {book.lessonCount} Lessons
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">📄</span>
            <span className="text-xs font-medium" style={{ color: c.textSecondary }}>
              Answer PDF
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div
          className="absolute bottom-5 right-5 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: badgeInfo.bg }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={badgeInfo.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const { resolvedDark } = useThemeStore();
  const { isTablet } = useWindowSize();
  const c: ThemeColors = resolvedDark ? colors.dark : colors.light;

  return (
    <div className="min-h-screen" style={{ backgroundColor: c.background }}>
      <TopBar />

      {/* Hero section */}
      <div className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-sm font-medium tracking-widest uppercase mb-1"
            style={{ color: c.primary }}
          >
            日本語を学ぼう
          </p>
          <h1
            className="text-3xl font-bold leading-tight"
            style={{ color: c.textPrimary, fontFamily: 'Inter, sans-serif' }}
          >
            Select a Level
          </h1>
          <p className="text-sm mt-1.5" style={{ color: c.textSecondary }}>
            Classroom audio &amp; answer keys — offline ready
          </p>
        </motion.div>
      </div>

      {/* Book cards */}
      <div
        className={`px-5 pb-32 ${isTablet ? 'grid grid-cols-2 gap-5' : 'flex flex-col gap-5'}`}
      >
        {BOOKS.map((book, i) => (
          <BookCard
            key={book.id}
            book={book}
            index={i}
            onClick={() => navigate(`/book/${book.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
