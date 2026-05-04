import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { BOOK_MAP } from '../data/books';
import { TopBar } from '../components/TopBar';
import { colors } from '../theme/colors';
import AudioScreen from './AudioScreen';
import PdfViewerScreen from './PdfViewerScreen';

const TABS = [
  { label: '🎵 Audio', key: 'audio' },
  { label: '📄 Answers', key: 'pdf' },
];

export default function BookContentScreen() {
  const { bookId } = useParams<{ bookId: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const { resolvedDark } = useThemeStore();
  const c = resolvedDark ? colors.dark : colors.light;

  const book = BOOK_MAP[bookId ?? ''] ?? null;
  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: c.background }}>
        <p style={{ color: c.textSecondary }}>Book not found.</p>
      </div>
    );
  }

  const gradients: Record<string, string> = {
    A1: 'from-orange-400 to-red-400',
    A2X: 'from-blue-400 to-sky-500',
    A2Y: 'from-purple-400 to-violet-500',
    CUSTOM: 'from-emerald-400 to-teal-500',
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: c.background }}>
      <TopBar title={book.title} showBack />

      {/* Book header */}
      <div className={`bg-gradient-to-br ${gradients[book.id]} px-5 pt-5 pb-6`}>
        <div className="flex items-center gap-4">
          <div className="text-5xl">{book.emoji}</div>
          <div>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {book.jlpt} · {book.level}
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">{book.title}</h1>
            <p className="text-sm text-white/75 mt-0.5">{book.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Tab Row */}
      <div
        className="flex sticky top-14 z-30"
        style={{ backgroundColor: c.surface, borderBottom: `1px solid ${c.border}` }}
      >
        {TABS.map((tab, i) => (
          <button
            key={tab.key}
            className="flex-1 py-3.5 text-sm font-semibold relative transition-colors"
            style={{
              color: activeTab === i ? c.primary : c.textSecondary,
            }}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
            {activeTab === i && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: c.primary }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 0 && <AudioScreen bookId={book.id} />}
        {activeTab === 1 && <PdfViewerScreen bookId={book.id} />}
      </div>
    </div>
  );
}
