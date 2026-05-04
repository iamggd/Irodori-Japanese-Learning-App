// ─── Theme ───────────────────────────────────────────────────────────────────
export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

// ─── Books ───────────────────────────────────────────────────────────────────
export type BookId = 'A1' | 'A2X' | 'A2Y';

export interface Book {
  id: BookId;
  title: string;
  subtitle: string;
  level: string;
  jlpt: string;
  emoji: string;
  colorFrom: string;
  colorTo: string;
  badgeColor: string;
  lessonCount: number;
}

// ─── Audio ───────────────────────────────────────────────────────────────────
export interface AudioTrack {
  id: string;
  filename: string;
  title: string;
  lesson: number;
  session: number;
  bookId: BookId;
  uri: string;
  durationMs: number;
}

export interface LessonGroup {
  lesson: number;
  label: string;
  tracks: AudioTrack[];
}

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface PlayerState {
  currentTrack: AudioTrack | null;
  playbackState: PlaybackState;
  positionMs: number;
  durationMs: number;
  isBuffering: boolean;
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
export interface PdfState {
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  scale: number;
}
