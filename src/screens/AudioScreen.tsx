import { useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { usePlayerStore } from '../store/playerStore';
import { generateTracksForBook, BOOK_MAP } from '../data/books';
import { colors } from '../theme/colors';
import type { AudioTrack, LessonGroup } from '../types';

type ThemeColors = typeof colors.light;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
function PauseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

function MusicNoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color }: { color: string }) {
  return (
    <motion.div
      className="w-4 h-4 rounded-full border-2"
      style={{ borderColor: `${color}30`, borderTopColor: color }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ─── Seek Bar ─────────────────────────────────────────────────────────────────
function SeekBar({ positionMs, durationMs, onSeek, color, textColor }: {
  positionMs: number;
  durationMs: number;
  onSeek: (ms: number) => void;
  color: string;
  textColor: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || durationMs === 0) return;
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(1, ratio)) * durationMs);
  }, [durationMs, onSeek]);

  return (
    <div className="w-full">
      <div
        ref={barRef}
        className="relative h-2 rounded-full cursor-pointer"
        style={{ backgroundColor: 'rgba(128,128,128,0.2)' }}
        onClick={handleClick}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ backgroundColor: color, width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md transition-all"
          style={{ backgroundColor: color, left: `calc(${progress * 100}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs tabular-nums" style={{ color: textColor }}>{formatMs(positionMs)}</span>
        <span className="text-xs tabular-nums" style={{ color: textColor }}>{formatMs(durationMs)}</span>
      </div>
    </div>
  );
}

// ─── Expanded Player Card ─────────────────────────────────────────────────────
function ExpandedPlayerCard({ track, c }: { track: AudioTrack; c: ThemeColors }) {
  const { playbackState, positionMs, durationMs, togglePlayPause, seekTo, rewind10s, forward10s } = usePlayerStore();
  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="mx-4 mb-4 rounded-2xl p-4 overflow-hidden"
      style={{
        backgroundColor: c.surface,
        border: `1px solid ${c.border}`,
        boxShadow: c.cardShadow,
      }}
    >
      {/* Track info */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${c.primary}20` }}
        >
          <span style={{ color: c.primary }}><MusicNoteIcon /></span>
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: c.textPrimary }}>
            {track.title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
            Lesson {String(track.lesson).padStart(2, '0')} · Session {track.session}
          </p>
        </div>
      </div>

      {/* Seek bar */}
      <div className="mb-3">
        <SeekBar
          positionMs={positionMs}
          durationMs={durationMs}
          onSeek={seekTo}
          color={c.primary}
          textColor={c.textSecondary}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        {/* Rewind 10s */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="p-2 rounded-full"
          style={{ color: c.textPrimary }}
          onClick={rewind10s}
          aria-label="Rewind 10 seconds"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
            <text x="7.5" y="15" fontSize="5.5" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="Inter,sans-serif">10</text>
          </svg>
        </motion.button>

        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: c.primary, color: '#FFF' }}
          onClick={togglePlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isLoading ? (
            <motion.div
              className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ) : isPlaying ? (
            <PauseIcon size={22} />
          ) : (
            <PlayIcon size={22} />
          )}
        </motion.button>

        {/* Forward 10s */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className="p-2 rounded-full"
          style={{ color: c.textPrimary }}
          onClick={forward10s}
          aria-label="Forward 10 seconds"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-.49-3.51" />
            <text x="7.5" y="15" fontSize="5.5" fontWeight="bold" fill="currentColor" stroke="none" fontFamily="Inter,sans-serif">10</text>
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Track Row ─────────────────────────────────────────────────────────────────
function TrackRow({
  track,
  isActive,
  resolvedDark,
  c,
  onPlay,
}: {
  track: AudioTrack;
  isActive: boolean;
  resolvedDark: boolean;
  c: ThemeColors;
  onPlay: (t: AudioTrack) => void;
}) {
  const { playbackState, togglePlayPause } = usePlayerStore();
  const isPlaying = isActive && playbackState === 'playing';
  const isLoading = isActive && playbackState === 'loading';

  return (
    <motion.div
      layout
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{
        backgroundColor: isActive ? `${c.primary}12` : 'transparent',
        borderLeft: isActive ? `3px solid ${c.primary}` : '3px solid transparent',
      }}
      whileHover={{
        backgroundColor: isActive
          ? `${c.primary}18`
          : resolvedDark
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.03)',
      }}
      onClick={() => {
        if (isActive) {
          togglePlayPause();
        } else {
          onPlay(track);
        }
      }}
    >
      {/* Play/Pause button */}
      <div
        className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          backgroundColor: isActive ? c.primary : `${c.primary}20`,
          color: isActive ? '#FFF' : c.primary,
        }}
      >
        {isLoading ? (
          <Spinner color={isActive ? '#FFF' : c.primary} />
        ) : isPlaying ? (
          <PauseIcon size={14} />
        ) : (
          <PlayIcon size={14} />
        )}
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: isActive ? c.primary : c.textPrimary }}
        >
          Session {track.session}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: c.textSecondary }}>
          {formatMs(track.durationMs)}
        </p>
      </div>

      {/* Waveform animation when playing */}
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-5 pr-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{ backgroundColor: c.primary, height: '40%' }}
              animate={{ height: ['40%', '100%', '60%', '100%', '40%'] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Lesson Group Header ───────────────────────────────────────────────────────
function LessonHeader({ lesson, c }: { lesson: number; c: ThemeColors }) {
  return (
    <div className="px-4 py-2 flex items-center gap-3" style={{ backgroundColor: c.background }}>
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: c.primary, color: '#FFF' }}
      >
        <span className="text-xs font-bold">{String(lesson).padStart(2, '0')}</span>
      </div>
      <span className="text-sm font-semibold" style={{ color: c.textPrimary }}>
        Lesson {String(lesson).padStart(2, '0')}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: c.border }} />
    </div>
  );
}

// ─── Main AudioScreen ──────────────────────────────────────────────────────────
export default function AudioScreen({ bookId }: { bookId: string }) {
  const { resolvedDark } = useThemeStore();
  const c: ThemeColors = resolvedDark ? colors.dark : colors.light;
  const { currentTrack, loadAndPlay } = usePlayerStore();

  const book = BOOK_MAP[bookId] ?? null;
  const tracks = useMemo(
    () => generateTracksForBook(bookId, book?.lessonCount ?? 10),
    [bookId, book]
  );

  const lessonGroups = useMemo<LessonGroup[]>(() => {
    const map = new Map<number, AudioTrack[]>();
    for (const t of tracks) {
      if (!map.has(t.lesson)) map.set(t.lesson, []);
      map.get(t.lesson)!.push(t);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([lesson, lessonTracks]) => ({
        lesson,
        label: `Lesson ${String(lesson).padStart(2, '0')}`,
        tracks: lessonTracks.sort((a, b) => a.session - b.session),
      }));
  }, [tracks]);

  const isActiveBook = currentTrack?.bookId === bookId;

  return (
    <div className="pb-40" style={{ backgroundColor: c.background }}>
      {/* Expanded player for active track */}
      <AnimatePresence>
        {isActiveBook && currentTrack && (
          <div className="pt-4">
            <ExpandedPlayerCard track={currentTrack} c={c} />
          </div>
        )}
      </AnimatePresence>

      {/* Track list grouped by lesson */}
      <div
        className="rounded-2xl mx-4 overflow-hidden"
        style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
      >
        {lessonGroups.map((group, gi) => (
          <div key={group.lesson}>
            {/* Sticky lesson header */}
            <div className="sticky top-28 z-10" style={{ backgroundColor: c.surface }}>
              <LessonHeader lesson={group.lesson} c={c} />
            </div>

            {/* Track rows */}
            {group.tracks.map((track, ti) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div key={track.id}>
                  <TrackRow
                    track={track}
                    isActive={isActive}
                    resolvedDark={resolvedDark}
                    c={c}
                    onPlay={loadAndPlay}
                  />
                  {ti < group.tracks.length - 1 && (
                    <div className="mx-4 h-px" style={{ backgroundColor: c.border }} />
                  )}
                </div>
              );
            })}

            {gi < lessonGroups.length - 1 && (
              <div className="h-2" style={{ backgroundColor: c.background }} />
            )}
          </div>
        ))}

        {tracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="text-5xl">🎵</div>
            <p className="text-sm" style={{ color: c.textSecondary }}>No audio files found</p>
          </div>
        )}
      </div>
    </div>
  );
}
