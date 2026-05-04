import type { Book, BookId, AudioTrack } from '../types';
import { a1Tracks } from './a1Tracks';

export const BOOKS: Book[] = [
  {
    id: 'A1',
    title: 'Irodori A1',
    subtitle: 'Starting Japanese',
    level: 'Beginner',
    jlpt: 'JLPT N5',
    emoji: '🌸',
    colorFrom: '#E05C2A',
    colorTo: '#FF8A65',
    badgeColor: '#E05C2A',
    lessonCount: 12,
  },
  {
    id: 'A2X',
    title: 'Irodori A2X',
    subtitle: 'Elementary Japanese I',
    level: 'Elementary',
    jlpt: 'JLPT N4',
    emoji: '🍃',
    colorFrom: '#4A90D9',
    colorTo: '#64B5F6',
    badgeColor: '#4A90D9',
    lessonCount: 10,
  },
  {
    id: 'A2Y',
    title: 'Irodori A2Y',
    subtitle: 'Elementary Japanese II',
    level: 'Elementary Plus',
    jlpt: 'JLPT N4',
    emoji: '🎋',
    colorFrom: '#7B5EA7',
    colorTo: '#AB87D4',
    badgeColor: '#7B5EA7',
    lessonCount: 10,
  },
];

export const BOOK_MAP = Object.fromEntries(BOOKS.map((b) => [b.id, b])) as Record<string, Book | undefined>;

// ─── Audio Track Generator ─────────────────────────────────────────────────────
// Filename format: ^([A-Z0-9]+)\[(\d+)-(\d+)]_kyoshitsu (\d+)$
// e.g. A1[01-01]_kyoshitsu 1 => Lesson 01 Classroom Session 1

const VALID_BOOK_IDS: BookId[] = ['A1', 'A2X', 'A2Y'];

function isValidBookId(id: string): id is BookId {
  return VALID_BOOK_IDS.includes(id as BookId);
}

function makeDuration(minBase: number, secSeed: number): number {
  // Deterministic pseudo-random based on inputs
  const sec = ((minBase * 37 + secSeed * 13) % 60);
  const min = (minBase % 3) + 1;
  return (min * 60 + sec) * 1000;
}

export function generateTracksForBook(bookId: string, lessonCount: number): AudioTrack[] {
  if (!isValidBookId(bookId)) return [];

  if (bookId === 'A1') {
    return a1Tracks;
  }

  const tracks: AudioTrack[] = [];

  for (let lesson = 1; lesson <= lessonCount; lesson++) {
    const sessionCount = lesson === 1 ? 4 : lesson % 3 === 0 ? 5 : 3;

    for (let session = 1; session <= sessionCount; session++) {
      const lessonStr = String(lesson).padStart(2, '0');
      const sessionStr = String(session).padStart(2, '0');

      // Format: ^([A-Z0-9]+)\[(\d+)-(\d+)]_kyoshitsu (\d+)$
      const filename = `${bookId}[${lessonStr}-${sessionStr}]_kyoshitsu ${session}`;

      // Validate with regex (as specified in the brief)
      const regex = /^([A-Z0-9]+)\[(\d+)-(\d+)\]_kyoshitsu (\d+)$/;
      if (!regex.test(filename)) continue; // silently skip

      tracks.push({
        id: `${bookId}_L${lesson}_S${session}`,
        filename,
        title: `Lesson ${lessonStr} — Classroom Session ${session}`,
        lesson,
        session,
        bookId,
        uri: `asset:///audio/${bookId}/${filename}.mp3`,
        durationMs: makeDuration(lesson, session),
      });
    }
  }

  return tracks;
}
