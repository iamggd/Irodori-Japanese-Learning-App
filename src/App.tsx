import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import HomeScreen from './screens/HomeScreen';
import BookContentScreen from './screens/BookContentScreen';
import { MiniPlayer } from './components/MiniPlayer';

export default function App() {
  const { mode, resolvedDark, setMode } = useThemeStore();

  // Sync system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (mode === 'SYSTEM') {
        setMode('SYSTEM');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, setMode]);

  // Apply dark class on mount
  useEffect(() => {
    if (resolvedDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [resolvedDark]);

  return (
    <BrowserRouter>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: resolvedDark ? '#121212' : '#F8F4EF' }}
      >
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/book/:bookId" element={<BookContentScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <MiniPlayer />
      </div>
    </BrowserRouter>
  );
}
