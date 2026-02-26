import { Difficulty, GameSettings } from './types';

export const DIFFICULTY_SETTINGS: Record<Difficulty, GameSettings> = {
  easy: {
    rows: 9,
    cols: 9,
    mines: 10,
    timeLimit: 120,
  },
  medium: {
    rows: 16,
    cols: 16,
    mines: 40,
    timeLimit: 300,
  },
  hard: {
    rows: 16,
    cols: 30,
    mines: 99,
    timeLimit: 600,
  },
};

export const COLORS = {
  1: 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]',
  2: 'text-lime-400 drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]',
  3: 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]',
  4: 'text-fuchsia-500 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]',
  5: 'text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]',
  6: 'text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]',
  7: 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]',
  8: 'text-gray-400 drop-shadow-[0_0_5px_rgba(156,163,175,0.5)]',
};
