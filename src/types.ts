export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  rows: number;
  cols: number;
  mines: number;
  timeLimit: number;
}

export interface CellData {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export type GameStatus = 'playing' | 'won' | 'lost' | 'ready';
