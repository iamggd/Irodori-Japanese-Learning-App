import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../theme/colors';
import type { ThemeMode } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function SystemIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'SYSTEM', label: 'System', icon: <SystemIcon /> },
  { value: 'LIGHT', label: 'Light', icon: <SunIcon /> },
  { value: 'DARK', label: 'Dark', icon: <MoonIcon /> },
];

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

export function TopBar({ title, showBack }: TopBarProps) {
  const { mode, resolvedDark, setMode } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);
  const c = resolvedDark ? colors.dark : colors.light;
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{
        backgroundColor: c.background,
        borderBottom: `1px solid ${c.border}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Back button or app logo */}
      <div className="flex items-center gap-3">
        {(showBack || !isHome) && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{ backgroundColor: resolvedDark ? '#2C2C2C' : '#EEEBE6', color: c.textPrimary }}
            onClick={() => navigate(-1)}
          >
            <BackIcon />
          </motion.button>
        )}
        {isHome && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: c.primary }}
            >
              彩
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: c.textPrimary }}>
              Irodori
            </span>
          </div>
        )}
        {title && !isHome && (
          <span className="font-semibold text-base" style={{ color: c.textPrimary }}>
            {title}
          </span>
        )}
      </div>

      {/* Right: Theme toggle */}
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ backgroundColor: resolvedDark ? '#2C2C2C' : '#EEEBE6', color: c.textPrimary }}
          onClick={() => setShowMenu((v) => !v)}
        >
          {mode === 'DARK' ? <MoonIcon /> : mode === 'LIGHT' ? <SunIcon /> : <SystemIcon />}
        </motion.button>

        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 z-50 w-40 rounded-2xl shadow-xl overflow-hidden"
                style={{ backgroundColor: c.surface, border: `1px solid ${c.border}` }}
              >
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      color: mode === opt.value ? c.primary : c.textPrimary,
                      backgroundColor: mode === opt.value ? (resolvedDark ? '#2C2C2C' : '#F5EFE8') : 'transparent',
                    }}
                    onClick={() => {
                      setMode(opt.value);
                      setShowMenu(false);
                    }}
                  >
                    <span style={{ color: mode === opt.value ? c.primary : c.textSecondary }}>
                      {opt.icon}
                    </span>
                    {opt.label}
                    {mode === opt.value && (
                      <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
