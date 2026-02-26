import React from 'react';
import { motion } from 'motion/react';
import { Bomb, Flag } from 'lucide-react';
import { CellData } from '../types';
import { COLORS } from '../constants';

interface CellProps {
  cell: CellData;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  gameOver: boolean;
}

export const Cell: React.FC<CellProps> = ({ cell, onClick, onContextMenu, gameOver }) => {
  const { isRevealed, isFlagged, isMine, neighborMines } = cell;

  const getCellContent = () => {
    if (isFlagged && !isRevealed) {
      return <Flag className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />;
    }
    if (isRevealed) {
      if (isMine) {
        return <Bomb className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]" />;
      }
      if (neighborMines > 0) {
        return (
          <span className={`font-black text-lg ${COLORS[neighborMines as keyof typeof COLORS]}`}>
            {neighborMines}
          </span>
        );
      }
    }
    return null;
  };

  return (
    <motion.div
      whileHover={!isRevealed && !isFlagged && !gameOver ? { backgroundColor: '#2a2a2a', borderColor: '#ff0000' } : {}}
      whileTap={!isRevealed && !isFlagged && !gameOver ? { scale: 0.9 } : {}}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer text-sm transition-all duration-150
        ${isRevealed 
          ? (isMine ? 'bg-red-950/50 cell-rog-revealed border-red-500' : 'bg-[#0a0a0a] cell-rog-revealed border-stone-800') 
          : 'bg-[#1a1a1a] cell-rog-unrevealed border-stone-700 hover:shadow-[0_0_10px_rgba(255,0,0,0.2)]'}
        ${gameOver && isMine && !isRevealed ? 'bg-red-900/30 border-red-500/50' : ''}
        border rounded-none
      `}
    >
      {getCellContent()}
    </motion.div>
  );
};
