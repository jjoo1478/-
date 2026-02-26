import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Timer, Bomb, Settings2, Github } from 'lucide-react';
import { Difficulty, CellData, GameStatus } from './types';
import { DIFFICULTY_SETTINGS } from './constants';
import { Cell } from './components/Cell';

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [status, setStatus] = useState<GameStatus>('ready');
  const [minesLeft, setMinesLeft] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const settings = DIFFICULTY_SETTINGS[difficulty];

  const initGrid = useCallback(() => {
    const newGrid: CellData[][] = [];
    for (let r = 0; r < settings.rows; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < settings.cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setStatus('ready');
    setMinesLeft(settings.mines);
    setSeconds(settings.timeLimit);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [settings]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  useEffect(() => {
    if (seconds === 0 && status === 'playing') {
      setStatus('lost');
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Reveal all mines
      const newGrid = [...grid.map(row => [...row])];
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setGrid(newGrid);
    }
  }, [seconds, status, grid]);

  const startGame = (firstRow: number, firstCol: number) => {
    const newGrid = [...grid.map(row => [...row])];
    let minesPlaced = 0;

    // Place mines randomly, avoiding the first clicked cell
    while (minesPlaced < settings.mines) {
      const r = Math.floor(Math.random() * settings.rows);
      const c = Math.floor(Math.random() * settings.cols);

      if (!newGrid[r][c].isMine && (r !== firstRow || c !== firstCol)) {
        newGrid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let r = 0; r < settings.rows; r++) {
      for (let c = 0; c < settings.cols; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < settings.rows && nc >= 0 && nc < settings.cols && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setStatus('playing');
    
    timerRef.current = setInterval(() => {
      setSeconds(s => Math.max(0, s - 1));
    }, 1000);

    revealCell(firstRow, firstCol, newGrid);
  };

  const revealCell = (r: number, c: number, currentGrid: CellData[][]) => {
    if (currentGrid[r][c].isRevealed || currentGrid[r][c].isFlagged) return;

    const newGrid = [...currentGrid.map(row => [...row])];
    
    const floodFill = (row: number, col: number) => {
      if (row < 0 || row >= settings.rows || col < 0 || col >= settings.cols) return;
      if (newGrid[row][col].isRevealed || newGrid[row][col].isFlagged) return;

      newGrid[row][col].isRevealed = true;

      if (newGrid[row][col].neighborMines === 0 && !newGrid[row][col].isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            floodFill(row + dr, col + dc);
          }
        }
      }
    };

    if (newGrid[r][c].isMine) {
      // Game Over
      setStatus('lost');
      if (timerRef.current) clearInterval(timerRef.current);
      // Reveal all mines
      newGrid.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
    } else {
      floodFill(r, c);
    }

    setGrid(newGrid);
    checkWin(newGrid);
  };

  const checkWin = (currentGrid: CellData[][]) => {
    const allNonMinesRevealed = currentGrid.every(row => 
      row.every(cell => cell.isMine || cell.isRevealed)
    );

    if (allNonMinesRevealed) {
      setStatus('won');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (status === 'lost' || status === 'won') return;
    if (status === 'ready') {
      startGame(r, c);
    } else {
      revealCell(r, c, grid);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (status === 'lost' || status === 'won' || status === 'ready') return;
    if (grid[r][c].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    const isFlagged = !newGrid[r][c].isFlagged;
    newGrid[r][c].isFlagged = isFlagged;
    setGrid(newGrid);
    setMinesLeft(prev => isFlagged ? prev - 1 : prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0b0b0b] text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-5xl w-full rog-panel shadow-[0_0_50px_rgba(255,0,0,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 bg-black border-b-2 border-red-600 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-lg opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-red-600 clip-path-polygon-[0_0,100%_0,85%_100%,0_100%]">
                <Bomb className="w-8 h-8 text-black" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter rog-text-glow">ROG MINESWEEPER</h1>
              <p className="text-[10px] text-red-500 font-bold tracking-[0.3em] uppercase opacity-80">Republic of Gamers // Tactical Unit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase font-bold mb-1">Mission Time</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border-l-2 border-red-600">
                <Timer className="w-4 h-4 text-red-500" />
                <span className="font-mono text-2xl font-bold text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">
                  {seconds.toString().padStart(3, '0')}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-stone-500 uppercase font-bold mb-1">Threat Level</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border-l-2 border-red-600">
                <Bomb className="w-4 h-4 text-red-500" />
                <span className="font-mono text-2xl font-bold text-red-500 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">
                  {minesLeft.toString().padStart(3, '0')}
                </span>
              </div>
            </div>
            <button 
              onClick={initGrid}
              className="group p-3 bg-[#1a1a1a] border border-stone-800 hover:border-red-600 transition-all duration-300"
            >
              <RotateCcw className="w-6 h-6 text-stone-400 group-hover:text-red-500 group-hover:rotate-180 transition-all duration-500" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="px-8 py-4 bg-[#121212] border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-red-500" />
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Operation Difficulty</span>
          </div>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  setDifficulty(d);
                  initGrid();
                }}
                className={`
                  px-6 py-2 text-xs font-black uppercase tracking-tighter transition-all skew-x-[-15deg]
                  ${difficulty === d 
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(255,0,0,0.4)]' 
                    : 'bg-[#1a1a1a] text-stone-500 hover:text-white border border-stone-800'}
                `}
              >
                <span className="inline-block skew-x-[15deg]">{d}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div className="p-10 flex justify-center overflow-auto bg-[#080808] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.05)_0%,transparent_70%)] pointer-events-none"></div>
          <div 
            className="minesweeper-grid gap-1 p-1 bg-stone-900/50 backdrop-blur-sm relative z-10"
            style={{ 
              gridTemplateColumns: `repeat(${settings.cols}, minmax(0, 1fr))`,
              width: 'fit-content'
            }}
          >
            {grid.map((row, r) => (
              row.map((cell, c) => (
                <Cell 
                  key={`${r}-${c}`}
                  cell={cell}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleContextMenu(e, r, c)}
                  gameOver={status === 'lost' || status === 'won'}
                />
              ))
            ))}
          </div>
        </div>

        {/* Footer Status */}
        <AnimatePresence>
          {(status === 'won' || status === 'lost') && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={`p-8 text-center relative ${status === 'won' ? 'bg-emerald-600' : 'bg-red-600'}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/20"></div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-4">
                  {status === 'won' ? (
                    <Trophy className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  ) : (
                    <Bomb className="w-12 h-12 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  )}
                  <div className="text-left">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                      {status === 'won' ? 'MISSION SUCCESS' : 'SYSTEM CRITICAL'}
                    </h2>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest">
                      {status === 'won' 
                        ? `Field Cleared in ${settings.timeLimit - seconds}s` 
                        : (seconds === 0 ? 'Time Expired // System Shutdown' : 'Explosion Detected // Unit Lost')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={initGrid}
                  className="px-10 py-3 bg-black text-white font-black uppercase tracking-widest skew-x-[-15deg] hover:bg-white hover:text-black transition-all shadow-xl group"
                >
                  <span className="inline-block skew-x-[15deg] group-hover:scale-110 transition-transform">Re-Deploy</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="mt-10 flex flex-wrap justify-center gap-8 text-stone-600 text-[10px] font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#1a1a1a] border border-stone-800"></div>
          <span>Primary: Data Extraction</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-[#1a1a1a] border border-red-600 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
          </div>
          <span>Secondary: Threat Tagging</span>
        </div>
      </div>
    </div>
  );
}
