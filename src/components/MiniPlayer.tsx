import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/playerStore';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme/colors';

type ThemeColors = typeof colors.light;

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function MiniPlayer() {
  const { currentTrack, playbackState, positionMs, durationMs, togglePlayPause, stopPlayback } = usePlayerStore();
  const { resolvedDark } = useThemeStore();
  const c: ThemeColors = resolvedDark ? colors.dark : colors.light;

  const isVisible = currentTrack !== null && playbackState !== 'idle';
  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';
  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-4"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              backgroundColor: c.miniPlayerBg,
              border: `1px solid ${c.border}`,
              boxShadow: resolvedDark
                ? '0 -8px 32px rgba(0,0,0,0.6)'
                : '0 -8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Progress bar at top */}
            <div className="h-0.5 w-full" style={{ backgroundColor: c.border }}>
              <div
                className="h-full transition-all duration-300"
                style={{ backgroundColor: c.primary, width: `${progress * 100}%` }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Album art / icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${c.primary}20` }}
              >
                {isPlaying ? (
                  <div className="flex items-end gap-0.5 h-5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 rounded-full"
                        style={{ backgroundColor: c.primary }}
                        animate={{ height: ['30%', '100%', '50%', '100%', '30%'] }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={c.primary}>
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate leading-tight"
                  style={{ color: c.textPrimary }}
                >
                  {currentTrack?.title ?? ''}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: c.textSecondary }}>
                  {formatMs(positionMs)} · {currentTrack?.bookId}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Play / Pause */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: c.primary, color: '#FFF' }}
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isLoading ? (
                    <motion.div
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : isPlaying ? (
                    <PauseIcon />
                  ) : (
                    <PlayIcon />
                  )}
                </motion.button>

                {/* Close */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: resolvedDark ? '#2C2C2C' : '#F0ECE6', color: c.textSecondary }}
                  onClick={stopPlayback}
                  aria-label="Stop playback"
                >
                  <XIcon />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
