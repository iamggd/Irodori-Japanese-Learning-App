import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '../types';

interface ThemeState {
  mode: ThemeMode;
  resolvedDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

function getSystemDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'SYSTEM' as ThemeMode,
      resolvedDark: getSystemDark(),
      setMode: (mode: ThemeMode) => {
        const resolvedDark =
          mode === 'SYSTEM' ? getSystemDark() : mode === 'DARK';
        set({ mode, resolvedDark });
        if (resolvedDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }),
    {
      name: 'irodori-theme',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const resolvedDark =
          state.mode === 'SYSTEM'
            ? getSystemDark()
            : state.mode === 'DARK';
        state.resolvedDark = resolvedDark;
        if (resolvedDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
    }
  )
);
