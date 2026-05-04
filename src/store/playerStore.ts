import { create } from 'zustand';
import type { AudioTrack, PlaybackState } from '../types';

interface PlayerStore {
  currentTrack: AudioTrack | null;
  playbackState: PlaybackState;
  positionMs: number;
  durationMs: number;
  isBuffering: boolean;

  // Actions
  loadAndPlay: (track: AudioTrack) => void;
  togglePlayPause: () => void;
  seekTo: (ms: number) => void;
  rewind10s: () => void;
  forward10s: () => void;
  stopPlayback: () => void;
  setPosition: (ms: number) => void;
  setDuration: (ms: number) => void;
  setPlaybackState: (state: PlaybackState) => void;
}

// Single shared Audio element for the entire app
const audio = new Audio();

export const usePlayerStore = create<PlayerStore>((set, get) => {
  // ─── Sync HTML5 Audio events → Zustand state ──────────────────────────────

  audio.addEventListener('timeupdate', () => {
    set({ positionMs: audio.currentTime * 1000 });
  });

  audio.addEventListener('durationchange', () => {
    if (!isNaN(audio.duration) && audio.duration !== Infinity) {
      set({ durationMs: audio.duration * 1000 });
    }
  });

  audio.addEventListener('playing', () => {
    set({ playbackState: 'playing', isBuffering: false });
  });

  audio.addEventListener('pause', () => {
    // Don't override 'ended' state when the pause fires after track ends
    if (get().playbackState !== 'ended') {
      set({ playbackState: 'paused' });
    }
  });

  audio.addEventListener('ended', () => {
    set({ playbackState: 'ended', positionMs: get().durationMs });
  });

  audio.addEventListener('waiting', () => {
    set({ isBuffering: true });
  });

  audio.addEventListener('canplay', () => {
    set({ isBuffering: false });
  });

  audio.addEventListener('error', () => {
    set({ playbackState: 'error', isBuffering: false });
    console.error('Audio playback error:', audio.error);
  });

  // ─── Store ─────────────────────────────────────────────────────────────────

  return {
    currentTrack: null,
    playbackState: 'idle',
    positionMs: 0,
    durationMs: 0,
    isBuffering: false,

    loadAndPlay: (track: AudioTrack) => {
      // Stop whatever is currently playing
      audio.pause();

      set({
        currentTrack: track,
        playbackState: 'loading',
        positionMs: 0,
        durationMs: track.durationMs || 0,
        isBuffering: true,
      });

      // Encode special chars (brackets, spaces) in the URI
      const encodedUri = track.uri
        .split('/')
        .map((seg, i) => (i === 0 ? seg : encodeURIComponent(seg)))
        .join('/');

      audio.src = encodedUri;
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.error('Error playing audio:', err);
        set({ playbackState: 'error', isBuffering: false });
      });
    },

    togglePlayPause: () => {
      const { playbackState } = get();

      if (playbackState === 'playing') {
        audio.pause();
      } else if (playbackState === 'paused' || playbackState === 'idle') {
        audio.play().catch((err) => {
          console.error('Error resuming audio:', err);
        });
      } else if (playbackState === 'ended') {
        // Replay from beginning
        audio.currentTime = 0;
        set({ playbackState: 'loading', positionMs: 0 });
        audio.play().catch((err) => {
          console.error('Error replaying audio:', err);
        });
      }
    },

    seekTo: (ms: number) => {
      const { durationMs } = get();
      const clamped = Math.max(0, Math.min(ms, durationMs));
      audio.currentTime = clamped / 1000;
      set({ positionMs: clamped });
    },

    rewind10s: () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      set({ positionMs: audio.currentTime * 1000 });
    },

    forward10s: () => {
      if (!isNaN(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        set({ positionMs: audio.currentTime * 1000 });
      }
    },

    stopPlayback: () => {
      audio.pause();
      audio.src = '';
      set({
        currentTrack: null,
        playbackState: 'idle',
        positionMs: 0,
        durationMs: 0,
        isBuffering: false,
      });
    },

    setPosition: (ms) => set({ positionMs: ms }),
    setDuration: (ms) => set({ durationMs: ms }),
    setPlaybackState: (state) => set({ playbackState: state }),
  };
});
