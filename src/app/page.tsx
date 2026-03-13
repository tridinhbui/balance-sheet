"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv = motion.div as any;
import { ACCOUNTS, AccountItem, AccountCategory } from '@/lib/gameData';
import confetti from 'canvas-confetti';
import { Heart, ShieldAlert, Swords, RefreshCw, Trophy, GripHorizontal, Clock } from 'lucide-react';
import clsx from 'clsx';

// --- COMPONENTS ---

interface CardProps {
  item: AccountItem;
  onDragStart: (e: React.DragEvent, itemId: string) => void;
}

const Card = ({ item, onDragStart }: CardProps) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, item.id)}
    className="p-2 rounded border border-slate-200 bg-white shadow-sm select-none cursor-grab active:cursor-grabbing hover:border-slate-300 flex items-center justify-between gap-2 min-w-0 shrink-0"
  >
    <div className="min-w-0 flex-1">
      <div className="font-semibold text-slate-800 text-xs truncate">{item.en}</div>
      <div className="text-[10px] text-slate-500 truncate">{item.vi}</div>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded">${item.val.toLocaleString()}</span>
      <GripHorizontal size={10} className="text-slate-300" />
    </div>
  </div>
);

const Column = ({
  title,
  type,
  items,
  total,
  colorClass,
  bgClass,
  borderColorClass,
  onDrop,
}: {
  title: string;
  type: AccountCategory;
  items: AccountItem[];
  total: number;
  colorClass: string;
  bgClass: string;
  borderColorClass: string;
  onDrop: (cardId: string, targetType: AccountCategory) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id, type); }}
      className={clsx(
        "flex flex-col rounded-lg border-t-2 bg-white shadow-sm overflow-hidden transition-all min-w-0",
        borderColorClass,
        isDragOver && "ring-2 ring-amber-400 scale-[1.02]"
      )}
    >
      <div className={clsx("px-2 py-1.5 text-center font-bold text-[10px] uppercase", bgClass, colorClass)}>{title}</div>
      <div className="flex-1 min-h-0 overflow-hidden p-1.5 flex flex-wrap content-start gap-1">
        {items.map((item) => (
          <div key={item.id} className="p-1.5 bg-white rounded border border-slate-100 text-[10px] flex justify-between items-center gap-1 min-w-0">
            <span className="truncate font-medium text-slate-700">{item.en}</span>
            <span className="font-mono text-slate-500 shrink-0">${item.val.toLocaleString()}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] italic">Drop</div>
        )}
      </div>
      <div className={clsx("px-2 py-1 border-t text-right font-mono font-bold text-[10px]", colorClass)}>${total.toLocaleString()}</div>
    </div>
  );
};

// --- MAIN ---

export default function BalanceQuest() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [playerHp, setPlayerHp] = useState(3);
  const [maxPlayerHp] = useState(3);
  const [bossHp, setBossHp] = useState(100);
  const [maxBossHp, setMaxBossHp] = useState(100);

  const [deck, setDeck] = useState<AccountItem[]>([]);
  const [currentAssets, setCurrentAssets] = useState<AccountItem[]>([]);
  const [fixedAssets, setFixedAssets] = useState<AccountItem[]>([]);
  const [currentLiab, setCurrentLiab] = useState<AccountItem[]>([]);
  const [longTermLiab, setLongTermLiab] = useState<AccountItem[]>([]);
  const [equity, setEquity] = useState<AccountItem[]>([]);

  const [feedback, setFeedback] = useState<{ msg: string; type: 'neutral' | 'success' | 'error' }>({ msg: "Drag cards...", type: 'neutral' });
  const [shake, setShake] = useState(false);
  const [bossShake, setBossShake] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => { startLevel(); }, [level]);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(t); setGameState('lost'); setFeedback({ msg: "TIME'S UP!", type: 'error' }); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState, timeLeft]);

  const startLevel = () => {
    const items: AccountItem[] = [];
    let totalA = 0, totalL = 0;

    const nCurA = 2 + Math.floor(level * 0.5);
    const nFixA = 2 + Math.floor(level * 0.3);
    const nCurL = 1 + Math.floor(level * 0.3);
    const nLongL = 1;

    const shuf = (arr: { en: string; vi: string }[]) => [...arr].sort(() => 0.5 - Math.random());

    for (let i = 0; i < nCurA; i++) {
      const val = (Math.floor(Math.random() * 30) + 1) * 100;
      totalA += val;
      items.push({ ...shuf(ACCOUNTS.currentAssets)[i % ACCOUNTS.currentAssets.length], cat: 'currentAssets' as const, val, id: Math.random().toString(36).slice(2, 11) });
    }
    for (let i = 0; i < nFixA; i++) {
      const val = (Math.floor(Math.random() * 50) + 1) * 100;
      totalA += val;
      items.push({ ...shuf(ACCOUNTS.fixedAssets)[i % ACCOUNTS.fixedAssets.length], cat: 'fixedAssets' as const, val, id: Math.random().toString(36).slice(2, 11) });
    }

    const maxL = totalA * 0.6;
    for (let i = 0; i < nCurL; i++) {
      const val = (Math.floor(Math.random() * 15) + 1) * 100;
      totalL += val;
      items.push({ ...shuf(ACCOUNTS.currentLiab)[i % ACCOUNTS.currentLiab.length], cat: 'currentLiab' as const, val, id: Math.random().toString(36).slice(2, 11) });
    }
    for (let i = 0; i < nLongL; i++) {
      const val = (Math.floor(Math.random() * 20) + 1) * 100;
      totalL += val;
      items.push({ ...shuf(ACCOUNTS.longTermLiab)[i % ACCOUNTS.longTermLiab.length], cat: 'longTermLiab' as const, val, id: Math.random().toString(36).slice(2, 11) });
    }

    const eq = totalA - totalL;
    const shufE = shuf(ACCOUNTS.equity);
    items.push({ ...shufE[0], cat: 'equity' as const, val: eq, id: Math.random().toString(36).slice(2, 11) });

    items.sort(() => 0.5 - Math.random());

    setDeck(items);
    setCurrentAssets([]);
    setFixedAssets([]);
    setCurrentLiab([]);
    setLongTermLiab([]);
    setEquity([]);
    setPlayerHp(maxPlayerHp);
    setBossHp(items.length);
    setMaxBossHp(items.length);
    setGameState('playing');
    setTimeLeft(300);
    setFeedback({ msg: `Level ${level}`, type: 'neutral' });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (cardId: string, targetType: AccountCategory) => {
    if (gameState !== 'playing') return;
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;

    if (card.cat === targetType) {
      setDeck((p) => p.filter((c) => c.id !== card.id));
      if (targetType === 'currentAssets') setCurrentAssets((p) => [...p, card]);
      if (targetType === 'fixedAssets') setFixedAssets((p) => [...p, card]);
      if (targetType === 'currentLiab') setCurrentLiab((p) => [...p, card]);
      if (targetType === 'longTermLiab') setLongTermLiab((p) => [...p, card]);
      if (targetType === 'equity') setEquity((p) => [...p, card]);
      setBossHp((p) => {
        const n = p - 1;
        if (n <= 0) { setGameState('won'); confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } }); setFeedback({ msg: "VICTORY!", type: 'success' }); }
        return n;
      });
      setBossShake(true);
      setTimeout(() => setBossShake(false), 200);
      setXp((p) => p + 50);
      setFeedback({ msg: "Correct!", type: 'success' });
    } else {
      setPlayerHp((p) => {
        const n = p - 1;
        if (n <= 0) { setGameState('lost'); setFeedback({ msg: "DEFEAT!", type: 'error' }); }
        return n;
      });
      setShake(true);
      setTimeout(() => setShake(false), 300);
      setFeedback({ msg: "Wrong!", type: 'error' });
    }
  };

  const sum = (arr: AccountItem[]) => arr.reduce((a, c) => a + c.val, 0);
  const tA = sum(currentAssets) + sum(fixedAssets);
  const tL = sum(currentLiab) + sum(longTermLiab);
  const tE = sum(equity);

  return (
    <div className={clsx("h-screen flex flex-col overflow-hidden bg-slate-50", shake && "animate-shake")}>
      <header className="flex-shrink-0 bg-white border-b p-2">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-24 h-3 bg-slate-200 rounded-full overflow-hidden">
              <MotionDiv className="h-full bg-red-500" initial={{ width: '100%' }} animate={{ width: `${(bossHp / maxBossHp) * 100}%` }} />
            </div>
            <span className={clsx("text-2xl", bossShake && "scale-125")}>👾</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500">Lv {level}</span>
            <span className="font-bold flex items-center gap-1"><Trophy size={14} className="text-yellow-500" />{xp}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx("px-2 py-1 rounded font-mono font-bold text-sm", timeLeft <= 60 ? "bg-red-100 text-red-600" : timeLeft <= 120 ? "bg-amber-100 text-amber-600" : "bg-slate-100")}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex gap-0.5">
              {[...Array(maxPlayerHp)].map((_, i) => <Heart key={i} size={18} className={i < playerHp ? "fill-red-500 text-red-500" : "text-slate-200"} />)}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 p-2 flex gap-2 overflow-hidden">
        <div className="w-48 flex-shrink-0 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-2 py-1 border-b">
            <span className="text-[10px] font-bold text-slate-500">Deck ({deck.length})</span>
            <RefreshCw size={12} className="cursor-pointer hover:rotate-180 transition" onClick={() => startLevel()} />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden p-1.5 flex flex-wrap content-start gap-1">
            {deck.map((item) => <Card key={item.id} item={item} onDragStart={handleDragStart} />)}
            {deck.length === 0 && <span className="text-slate-300 text-[10px] italic">Empty</span>}
          </div>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-5 gap-2 overflow-hidden">
          <Column title="Current Assets" type="currentAssets" items={currentAssets} total={sum(currentAssets)} onDrop={handleDrop} colorClass="text-blue-600" bgClass="bg-blue-50" borderColorClass="border-blue-500" />
          <Column title="Fixed Assets" type="fixedAssets" items={fixedAssets} total={sum(fixedAssets)} onDrop={handleDrop} colorClass="text-blue-500" bgClass="bg-blue-50/80" borderColorClass="border-blue-400" />
          <Column title="Current Liab." type="currentLiab" items={currentLiab} total={sum(currentLiab)} onDrop={handleDrop} colorClass="text-orange-600" bgClass="bg-orange-50" borderColorClass="border-orange-500" />
          <Column title="Long-term Liab." type="longTermLiab" items={longTermLiab} total={sum(longTermLiab)} onDrop={handleDrop} colorClass="text-orange-500" bgClass="bg-orange-50/80" borderColorClass="border-orange-400" />
          <Column title="Equity" type="equity" items={equity} total={sum(equity)} onDrop={handleDrop} colorClass="text-emerald-600" bgClass="bg-emerald-50" borderColorClass="border-emerald-500" />
        </div>
      </main>

      <footer className={clsx("flex-shrink-0 p-2 border-t text-center", gameState === 'lost' ? "bg-red-100" : gameState === 'won' ? "bg-green-100" : "bg-white")}>
        <div className={clsx("font-bold text-sm", feedback.type === 'error' ? "text-red-600" : feedback.type === 'success' ? "text-green-600" : "text-slate-600")}>
          {feedback.type === 'error' && <ShieldAlert size={14} className="inline mr-1" />}
          {feedback.type === 'success' && <Swords size={14} className="inline mr-1" />}
          {feedback.msg}
        </div>
        <div className="text-[10px] text-slate-400 font-mono">A: {tA.toLocaleString()} | L+E: {(tL + tE).toLocaleString()}</div>
        {gameState === 'won' && <button onClick={() => setLevel((l) => l + 1)} className="mt-1 bg-green-600 text-white text-xs font-bold px-4 py-1 rounded">Next</button>}
        {gameState === 'lost' && <button onClick={() => startLevel()} className="mt-1 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded">Retry</button>}
      </footer>

      <style jsx global>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%,75%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
        .animate-shake { animation: shake 0.3s ease both; }
      `}</style>
    </div>
  );
}
