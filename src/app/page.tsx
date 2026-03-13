"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, HTMLMotionProps } from 'framer-motion';
import { ACCOUNTS, AccountItem } from '@/lib/gameData';
import confetti from 'canvas-confetti';
import { Heart, ShieldAlert, Swords, RefreshCw, Trophy, GripHorizontal } from 'lucide-react';
import clsx from 'clsx';

// --- COMPONENTS ---

// Extend HTMLMotionProps to include drag handlers properly
interface CardProps {
  item: AccountItem;
  onDrop: (itemId: string, targetId: string) => void;
}

const Card = ({ item, onDrop }: CardProps) => {
  const controls = useDragControls();
  
  return (
    <motion.div
      layoutId={item.id}
      drag
      dragControls={controls}
      dragSnapToOrigin={true}
      dragElastic={0.2}
      dragMomentum={false}
      whileDrag={{ scale: 1.1, zIndex: 100, rotate: 2, cursor: 'grabbing' }}
      whileHover={{ scale: 1.02, cursor: 'grab' }}
      onDragEnd={(event, info) => {
        const dropPoint = {
            x: info.point.x,
            y: info.point.y
        };
        
        const elements = document.elementsFromPoint(dropPoint.x, dropPoint.y);
        const dropZone = elements.find(el => el.hasAttribute('data-drop-zone'));
        
        if (dropZone) {
            const targetId = dropZone.getAttribute('data-drop-zone');
            if (targetId) onDrop(item.id, targetId);
        }
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="relative p-3 rounded-lg border-2 border-slate-200 bg-white shadow-sm select-none touch-none hover:border-slate-300 active:border-amber-400 group"
    >
      <div className="flex justify-between items-start pointer-events-none">
        <div>
          <div className="font-bold text-slate-800 text-sm md:text-base leading-tight">{item.en}</div>
          <div className="text-xs text-slate-500 mt-1">{item.vi}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="bg-slate-100 text-slate-700 font-mono text-xs md:text-sm px-2 py-1 rounded">
            ${item.val.toLocaleString()}
            </div>
            <GripHorizontal size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
};

const Column = ({ 
  title, 
  type, 
  items, 
  total, 
  colorClass, 
  bgClass,
  borderColorClass
}: { 
  title: string; 
  type: string; 
  items: AccountItem[]; 
  total: number; 
  colorClass: string;
  bgClass: string;
  borderColorClass: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items.length]);

  return (
    <div 
      // Mark this as a drop zone for our drag logic
      data-drop-zone={type}
      className={clsx(
        "flex flex-col h-full rounded-xl border-t-4 bg-white shadow-sm overflow-hidden transition-colors duration-200",
        borderColorClass
      )}
    >
      <div className={clsx("p-3 text-center font-bold text-sm uppercase tracking-wider pointer-events-none", bgClass, colorClass)}>
        {title}
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px] bg-slate-50/50 pointer-events-none">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 bg-white rounded border border-slate-100 shadow-sm text-xs flex justify-between items-center"
            >
              <span className="font-medium text-slate-700 truncate mr-2">{item.en}</span>
              <span className="font-mono text-slate-500">${item.val.toLocaleString()}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {items.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                Drop items here
            </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-100 text-right font-mono font-bold text-slate-800 pointer-events-none">
        ${total.toLocaleString()}
      </div>
    </div>
  );
};

// --- MAIN GAME LOGIC ---

export default function BalanceQuest() {
  // Game State
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [playerHp, setPlayerHp] = useState(3);
  const [maxPlayerHp] = useState(3);
  const [bossHp, setBossHp] = useState(100);
  const [maxBossHp, setMaxBossHp] = useState(100);
  
  // Data State
  const [deck, setDeck] = useState<AccountItem[]>([]);
  const [assets, setAssets] = useState<AccountItem[]>([]);
  const [liab, setLiab] = useState<AccountItem[]>([]);
  const [equity, setEquity] = useState<AccountItem[]>([]);
  
  // UI State
  const [feedback, setFeedback] = useState<{ msg: string; type: 'neutral' | 'success' | 'error' }>({ msg: "Drag cards to sort...", type: 'neutral' });
  const [shake, setShake] = useState(false);
  const [bossShake, setBossShake] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  // Init Level
  useEffect(() => {
    startLevel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const startLevel = () => {
    // Generate Data
    const items: AccountItem[] = [];
    let totalA = 0;
    let totalL = 0;

    // Difficulty scaling
    const numAssets = 8 + Math.floor(level * 1.5); 
    const numLiab = 4 + Math.floor(level * 0.8);

    // 1. Assets
    const shufA = [...ACCOUNTS.assets].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numAssets; i++) {
        const val = (Math.floor(Math.random() * 50) + 1) * 100;
        totalA += val;
        items.push({ ...shufA[i % shufA.length], cat: 'assets', val, id: Math.random().toString(36).substr(2, 9) });
    }

    // 2. Liabilities
    const shufL = [...ACCOUNTS.liabilities].sort(() => 0.5 - Math.random());
    const maxL = totalA * 0.7; // Ensure positive equity
    for (let i = 0; i < numLiab; i++) {
        let val = (Math.floor(Math.random() * 20) + 1) * 100;
        if (totalL + val > maxL) val = 100;
        totalL += val;
        items.push({ ...shufL[i % shufL.length], cat: 'liab', val, id: Math.random().toString(36).substr(2, 9) });
    }

    // 3. Equity (Balance it)
    const equityNeeded = totalA - totalL;
    const shufE = [...ACCOUNTS.equity].sort(() => 0.5 - Math.random());
    // Split equity slightly
    const parts = 2;
    let currentE = 0;
    for(let i=0; i<parts-1; i++) {
        const val = Math.floor((equityNeeded / parts) / 100) * 100;
        currentE += val;
        items.push({ ...shufE[i], cat: 'equity', val, id: Math.random().toString(36).substr(2, 9) });
    }
    items.push({ ...shufE[parts-1], cat: 'equity', val: equityNeeded - currentE, id: Math.random().toString(36).substr(2, 9) });

    // Shuffle Deck
    items.sort(() => 0.5 - Math.random());

    setDeck(items);
    setAssets([]);
    setLiab([]);
    setEquity([]);
    
    // Reset Stats
    setPlayerHp(maxPlayerHp);
    setBossHp(items.length);
    setMaxBossHp(items.length);
    setGameState('playing');
    setFeedback({ msg: `Level ${level} Started! Drag to play!`, type: 'neutral' });
  };

  // Actions
  const handleDrop = (cardId: string, targetType: string) => {
    if (gameState !== 'playing') return;

    const card = deck.find(c => c.id === cardId);
    if (!card) return;

    // Check Logic
    if (card.cat === targetType) {
        // Success
        handleSuccess(card, targetType as 'assets' | 'liab' | 'equity');
    } else {
        // Fail
        handleFail();
    }
  };

  const handleSuccess = (card: AccountItem, targetType: 'assets' | 'liab' | 'equity') => {
    // Move card
    setDeck(prev => prev.filter(c => c.id !== card.id));
    if (targetType === 'assets') setAssets(prev => [...prev, card]);
    if (targetType === 'liab') setLiab(prev => [...prev, card]);
    if (targetType === 'equity') setEquity(prev => [...prev, card]);

    // Boss Damage
    setBossHp(prev => {
        const newHp = prev - 1;
        if (newHp <= 0) handleWin();
        return newHp;
    });
    setBossShake(true);
    setTimeout(() => setBossShake(false), 300);

    setXp(prev => prev + 50);
    setFeedback({ msg: "Critical Hit!", type: 'success' });
  };

  const handleFail = () => {
    // Player Damage
    setPlayerHp(prev => {
        const newHp = prev - 1;
        if (newHp <= 0) handleLoss();
        return newHp;
    });
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setFeedback({ msg: "Ouch! Wrong Column!", type: 'error' });
  };

  const handleWin = () => {
    setGameState('won');
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
    setFeedback({ msg: "VICTORY! Balance Restored!", type: 'success' });
  };

  const handleLoss = () => {
    setGameState('lost');
    setFeedback({ msg: "DEFEAT! The books are unbalanced.", type: 'error' });
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
  };

  // Calculations
  const sum = (arr: AccountItem[]) => arr.reduce((acc, curr) => acc + curr.val, 0);
  const totalAssets = sum(assets);
  const totalLiab = sum(liab);
  const totalEquity = sum(equity);

  return (
    <div className={clsx("min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col", shake && "animate-shake")}>
      
      {/* HEADER / HUD */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Boss HP</span>
                    <div className="w-32 h-4 bg-slate-200 rounded-full overflow-hidden relative">
                        <motion.div 
                            className="absolute top-0 left-0 h-full bg-red-500"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                        />
                    </div>
                </div>
                
                <div className={clsx("text-4xl transition-transform", bossShake ? "scale-125 text-red-600" : "text-slate-700")}>
                    👾
                </div>
            </div>

            <div className="flex flex-col items-center">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">Level {level}</div>
                <div className="font-black text-xl text-slate-800 flex items-center gap-2">
                    <Trophy size={16} className="text-yellow-500" />
                    {xp} XP
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex gap-1">
                    {[...Array(maxPlayerHp)].map((_, i) => (
                        <Heart 
                            key={i} 
                            size={24} 
                            className={clsx("transition-colors", i < playerHp ? "fill-red-500 text-red-500" : "fill-slate-200 text-slate-200")} 
                        />
                    ))}
                </div>
            </div>
        </div>
      </header>

      {/* GAME AREA */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* LEFT: DECK */}
        <div className="md:w-1/3 flex flex-col gap-4 h-[40vh] md:h-auto z-20">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-slate-500 uppercase text-sm">Unsorted Accounts ({deck.length})</h2>
                    <RefreshCw size={16} className="text-slate-400 cursor-pointer hover:rotate-180 transition-transform" onClick={() => startLevel()} />
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-20 scrollbar-thin relative">
                    <AnimatePresence mode='popLayout'>
                        {deck.map(item => (
                            <Card 
                                key={item.id} 
                                item={item} 
                                onDrop={handleDrop} 
                            />
                        ))}
                    </AnimatePresence>
                    {deck.length === 0 && gameState === 'playing' && (
                        <div className="text-center text-slate-400 italic mt-10">Deck Empty</div>
                    )}
                </div>
            </div>
        </div>

        {/* RIGHT: COLUMNS */}
        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-3 h-[50vh] md:h-auto z-0">
            <Column 
                title="Assets" 
                type="assets" 
                items={assets} 
                total={totalAssets} 
                colorClass="text-blue-600"
                bgClass="bg-blue-50"
                borderColorClass="border-blue-500"
            />
            <Column 
                title="Liabilities" 
                type="liab" 
                items={liab} 
                total={totalLiab} 
                colorClass="text-orange-600"
                bgClass="bg-orange-50"
                borderColorClass="border-orange-500"
            />
            <Column 
                title="Equity" 
                type="equity" 
                items={equity} 
                total={totalEquity} 
                colorClass="text-emerald-600"
                bgClass="bg-emerald-50"
                borderColorClass="border-emerald-500"
            />
        </div>

      </main>

      {/* FOOTER / STATUS */}
      <footer className={clsx(
          "p-4 text-center border-t transition-colors duration-300 z-30 relative",
          gameState === 'lost' ? "bg-red-100 border-red-200" : 
          gameState === 'won' ? "bg-green-100 border-green-200" : "bg-white border-slate-200"
      )}>
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-2">
            <div className={clsx("font-bold text-lg flex items-center gap-2", 
                feedback.type === 'error' ? "text-red-600" : 
                feedback.type === 'success' ? "text-green-600" : "text-slate-600"
            )}>
                {feedback.type === 'error' && <ShieldAlert size={20} />}
                {feedback.type === 'success' && <Swords size={20} />}
                {feedback.msg}
            </div>
            
            <div className="text-xs text-slate-400 font-mono">
                Assets: {totalAssets.toLocaleString()} | L+E: {(totalLiab + totalEquity).toLocaleString()}
            </div>

            {gameState === 'won' && (
                <button 
                    onClick={nextLevel}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
                >
                    Next Level ➝
                </button>
            )}

            {gameState === 'lost' && (
                <button 
                    onClick={startLevel}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
                >
                    Try Again ↺
                </button>
            )}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
}
