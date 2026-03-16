"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv = motion.div as any;
import { ACCOUNTS, AccountItem, AccountCategory, CATEGORY_EXPLANATIONS, LEVEL_TIPS, DIFFICULTY_CONFIG, type Difficulty } from '@/lib/gameData';
import confetti from 'canvas-confetti';
import { Heart, ShieldAlert, Swords, RefreshCw, Trophy, GripHorizontal, Lightbulb, BookOpen } from 'lucide-react';
import clsx from 'clsx';

// --- COMPONENTS ---

const Card = ({ item, onDragStart }: { item: AccountItem; onDragStart: (e: React.DragEvent, id: string) => void }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, item.id)}
    className="p-2 rounded border border-slate-200 bg-white shadow-sm select-none cursor-grab active:cursor-grabbing hover:border-slate-300 flex items-center justify-between gap-2 min-w-[140px] md:min-w-0 shrink-0 min-h-[44px] touch-manipulation"
  >
    <div className="min-w-0 flex-1">
      <div className="font-semibold text-slate-800 text-xs truncate">{item.en}</div>
    </div>
    <div className="flex items-center gap-1 shrink-0">
      <span className="bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded">${item.val.toLocaleString()}</span>
      <GripHorizontal size={10} className="text-slate-300" />
    </div>
  </div>
);

const DropSection = ({
  title,
  type,
  items,
  total,
  colorClass,
  bgClass,
  onDrop,
  highlightHint,
}: {
  title: string;
  type: AccountCategory;
  items: AccountItem[];
  total: number;
  colorClass: string;
  bgClass: string;
  onDrop: (cardId: string, targetType: AccountCategory) => void;
  highlightHint?: boolean;
}) => {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id, type); }}
      className={clsx(
        "flex-1 min-h-[60px] md:min-h-0 flex flex-col rounded border overflow-hidden transition-all",
        bgClass,
        over && "ring-2 ring-amber-400",
        highlightHint && "ring-2 ring-amber-400 ring-offset-2 animate-pulse"
      )}
    >
      <div className={clsx("px-2 py-1.5 md:py-1 text-center font-bold text-[10px] uppercase shrink-0", colorClass)}>{title}</div>
      <div className="flex-1 min-h-0 overflow-hidden p-1.5 md:p-1 flex flex-wrap content-start gap-1.5 md:gap-1">
        {items.map((item) => (
          <div key={item.id} className="p-1 bg-white rounded border text-[10px] flex justify-between items-center gap-1 min-w-0">
            <span className="truncate">{item.en}</span>
            <span className="font-mono shrink-0">${item.val.toLocaleString()}</span>
          </div>
        ))}
        {items.length === 0 && <div className="w-full flex items-center justify-center text-slate-300 text-[10px] italic">Drop</div>}
      </div>
      <div className={clsx("px-2 py-0.5 border-t text-right font-mono font-bold text-[10px] shrink-0", colorClass)}>${total.toLocaleString()}</div>
    </div>
  );
};

const MainColumnFixed = ({
  title,
  borderColorClass,
  headerColorClass,
  sections,
  onDrop,
  hintTargetType,
}: {
  title: string;
  borderColorClass: string;
  headerColorClass: string;
  sections: { title: string; type: AccountCategory; items: AccountItem[]; total: number; colorClass: string; bgClass: string }[];
  onDrop: (cardId: string, targetType: AccountCategory) => void;
  hintTargetType?: AccountCategory | null;
}) => (
  <div className={clsx("flex flex-col rounded-lg border-t-4 bg-white shadow-sm overflow-hidden min-w-0 flex-1 min-h-[180px] md:min-h-0", borderColorClass)}>
    <div className={clsx("px-2 py-2 md:py-1.5 text-center font-bold text-xs uppercase shrink-0", headerColorClass)}>{title}</div>
    <div className="flex-1 min-h-0 flex flex-col gap-2 md:gap-1 p-2 md:p-1.5">
      {sections.map((s) => (
        <DropSection key={s.type} title={s.title} type={s.type} items={s.items} total={s.total} colorClass={s.colorClass} bgClass={s.bgClass} onDrop={onDrop} highlightHint={hintTargetType === s.type} />
      ))}
    </div>
  </div>
);

// --- MAIN ---

const STREAK_BONUS = 20; // +20 XP for 3+ correct in a row

export default function BalanceQuest() {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerHp, setPlayerHp] = useState(3);
  const [bossHp, setBossHp] = useState(100);
  const [maxBossHp, setMaxBossHp] = useState(100);

  const [deck, setDeck] = useState<AccountItem[]>([]);
  const [currentAssets, setCurrentAssets] = useState<AccountItem[]>([]);
  const [fixedAssets, setFixedAssets] = useState<AccountItem[]>([]);
  const [currentLiab, setCurrentLiab] = useState<AccountItem[]>([]);
  const [longTermLiab, setLongTermLiab] = useState<AccountItem[]>([]);
  const [equityCapital, setEquityCapital] = useState<AccountItem[]>([]);
  const [equityRetained, setEquityRetained] = useState<AccountItem[]>([]);

  const [feedback, setFeedback] = useState<{ msg: string; type: 'neutral' | 'success' | 'error' }>({ msg: "Drag cards...", type: 'neutral' });
  const [shake, setShake] = useState(false);
  const [bossShake, setBossShake] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);

  const [hintUsed, setHintUsed] = useState(false);
  const [hintTargetType, setHintTargetType] = useState<AccountCategory | null>(null);
  const [wrongDropExplanation, setWrongDropExplanation] = useState<{ card: AccountItem; correctExplain: string } | null>(null);
  const [levelTip, setLevelTip] = useState<string | null>(null);
  const [showAnswerReview, setShowAnswerReview] = useState(false);
  const [correctStreak, setCorrectStreak] = useState(0);

  const config = DIFFICULTY_CONFIG[difficulty];
  const maxPlayerHp = config.lives;

  useEffect(() => { if (gameStarted) startLevel(); }, [level, gameStarted]);

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
    const shuf = (arr: { en: string; vi: string }[]) => [...arr].sort(() => 0.5 - Math.random());
    const mult = config.cardMultiplier;

    const nCurA = Math.max(2, Math.floor((2 + Math.floor(level * 0.5)) * mult));
    const nFixA = Math.max(2, Math.floor((2 + Math.floor(level * 0.3)) * mult));
    const nCurL = Math.max(1, Math.floor((1 + Math.floor(level * 0.3)) * mult));
    const nLongL = Math.max(1, Math.floor(1 * mult));

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
    const shufCap = shuf(ACCOUNTS.equityCapital);
    const shufRet = shuf(ACCOUNTS.equityRetained);
    const eqPart1 = Math.floor(eq * 0.6);
    items.push({ ...shufCap[0], cat: 'equityCapital' as const, val: eqPart1, id: Math.random().toString(36).slice(2, 11) });
    items.push({ ...shufRet[0], cat: 'equityRetained' as const, val: eq - eqPart1, id: Math.random().toString(36).slice(2, 11) });

    items.sort(() => 0.5 - Math.random());

    setDeck(items);
    setCurrentAssets([]);
    setFixedAssets([]);
    setCurrentLiab([]);
    setLongTermLiab([]);
    setEquityCapital([]);
    setEquityRetained([]);
    setPlayerHp(config.lives);
    setBossHp(items.length);
    setMaxBossHp(items.length);
    setGameState('playing');
    setTimeLeft(config.time);
    setFeedback({ msg: `Level ${level}`, type: 'neutral' });
    setHintUsed(false);
    setHintTargetType(null);
    setWrongDropExplanation(null);
    setShowAnswerReview(false);
    setCorrectStreak(0);
    setLevelTip(LEVEL_TIPS[(level - 1) % LEVEL_TIPS.length]);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (cardId: string, targetType: AccountCategory) => {
    if (gameState !== 'playing') return;
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;
    setHintTargetType(null); // Clear hint highlight on any drop

    if (card.cat === targetType) {
      setDeck((p) => p.filter((c) => c.id !== card.id));
      if (targetType === 'currentAssets') setCurrentAssets((p) => [...p, card]);
      if (targetType === 'fixedAssets') setFixedAssets((p) => [...p, card]);
      if (targetType === 'currentLiab') setCurrentLiab((p) => [...p, card]);
      if (targetType === 'longTermLiab') setLongTermLiab((p) => [...p, card]);
      if (targetType === 'equityCapital') setEquityCapital((p) => [...p, card]);
      if (targetType === 'equityRetained') setEquityRetained((p) => [...p, card]);
      setBossHp((p) => {
        const n = p - 1;
        if (n <= 0) { setGameState('won'); confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } }); setFeedback({ msg: "VICTORY!", type: 'success' }); }
        return n;
      });
      setBossShake(true);
      setTimeout(() => setBossShake(false), 200);
      setWrongDropExplanation(null);
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      const baseXp = 50;
      const streakBonus = newStreak >= 3 ? STREAK_BONUS : 0;
      setXp((p) => p + baseXp + streakBonus);
      setFeedback({ msg: streakBonus > 0 ? `Correct! +${STREAK_BONUS} streak bonus!` : "Correct!", type: 'success' });
    } else {
      setPlayerHp((p) => {
        const n = p - 1;
        if (n <= 0) { setGameState('lost'); setFeedback({ msg: "DEFEAT!", type: 'error' }); }
        return n;
      });
      setShake(true);
      setTimeout(() => setShake(false), 300);
      setCorrectStreak(0);
      const ex = CATEGORY_EXPLANATIONS[card.cat];
      setWrongDropExplanation({ card, correctExplain: `${ex.title}: ${ex.explain}` });
      setFeedback({ msg: "Wrong!", type: 'error' });
    }
  };

  const sum = (arr: AccountItem[]) => arr.reduce((a, c) => a + c.val, 0);
  const tA = sum(currentAssets) + sum(fixedAssets);
  const tL = sum(currentLiab) + sum(longTermLiab);
  const tE = sum(equityCapital) + sum(equityRetained);

  // All items with correct categories (for answer screen when lost)
  const allItems: AccountItem[] = [...deck, ...currentAssets, ...fixedAssets, ...currentLiab, ...longTermLiab, ...equityCapital, ...equityRetained];
  const itemsByCat = allItems.reduce((acc, item) => {
    if (!acc[item.cat]) acc[item.cat] = [];
    acc[item.cat].push(item);
    return acc;
  }, {} as Record<AccountCategory, AccountItem[]>);

  // --- START SCREEN ---
  if (!gameStarted) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-6"
        >
          <div className="text-6xl mb-4 animate-bounce">⚖️</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            Balance <span className="text-amber-400">Quest</span>
          </h1>
          <p className="text-slate-400 text-lg mb-2">Balance Sheet • Accounting RPG</p>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-4 px-2">
            Defeat the Imbalance Monster with accounting knowledge! Drag accounts to the correct columns.
          </p>
          <div className="mb-4">
            <p className="text-slate-400 text-xs mb-2">Difficulty:</p>
            <div className="flex gap-2 justify-center">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all",
                    difficulty === d
                      ? "bg-amber-500 text-slate-900 shadow-lg"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  )}
                >
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-[10px] mt-1">
              {difficulty === 'easy' && '90s • 5 lives • fewer cards'}
              {difficulty === 'medium' && '120s • 3 lives • normal'}
              {difficulty === 'hard' && '90s • 2 lives • more cards'}
            </p>
          </div>
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <button
              onClick={() => setGameStarted(true)}
              className="px-8 sm:px-12 py-3 sm:py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg sm:text-xl rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 hover:scale-105 active:scale-95 transition-all min-h-[48px] touch-manipulation"
            >
              START GAME
            </button>
          </MotionDiv>
          <div className="mt-6 flex justify-center gap-4 text-slate-500 text-xs">
            <span>❤️ {DIFFICULTY_CONFIG[difficulty].lives} lives</span>
            <span>⏱️ {DIFFICULTY_CONFIG[difficulty].time}s</span>
            <span>👾 Boss battle</span>
          </div>
        </MotionDiv>
        <div className="absolute bottom-4 left-0 right-0 text-center text-slate-600 text-xs">Drag & drop • Assets = Liabilities + Equity</div>
      </div>
    );
  }

  return (
    <div className={clsx("min-h-screen md:h-screen flex flex-col overflow-y-auto md:overflow-hidden bg-slate-50", shake && "animate-shake")}>
      <header className="flex-shrink-0 bg-white border-b p-3 md:p-2">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-16 sm:w-24 h-3 bg-slate-200 rounded-full overflow-hidden shrink-0">
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

      {levelTip && (
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-3 py-2">
          <p className="text-xs text-amber-800 flex items-center gap-2">
            <Lightbulb size={14} className="text-amber-500 shrink-0" />
            <span>{levelTip}</span>
          </p>
        </div>
      )}

      <main className="flex-1 min-h-0 p-4 md:p-2 flex flex-col md:flex-row gap-4 md:gap-2 overflow-visible md:overflow-hidden">
        <div className="w-full md:w-48 flex-shrink-0 flex flex-col bg-white rounded-lg border shadow-sm overflow-hidden min-h-0 md:flex-1">
          <div className="flex justify-between items-center px-2 py-1 border-b gap-1">
            <span className="text-[10px] font-bold text-slate-500">Deck ({deck.length})</span>
            <div className="flex items-center gap-1">
              {deck.length > 0 && !hintUsed && (
                <button
                  onClick={() => { setHintUsed(true); setHintTargetType(deck[0].cat); setTimeout(() => setHintTargetType(null), 4000); }}
                  className="p-1 rounded hover:bg-amber-100 text-amber-600"
                  title="Hint (1 per level)"
                >
                  <Lightbulb size={14} />
                </button>
              )}
              <RefreshCw size={12} className="cursor-pointer hover:rotate-180 transition shrink-0" onClick={() => startLevel()} />
            </div>
          </div>
          <div className="min-h-[100px] md:flex-1 md:min-h-0 overflow-x-auto overflow-y-hidden p-2 md:p-1.5 flex flex-row md:flex-wrap md:content-start gap-2 md:gap-1 md:overflow-y-auto md:overflow-x-hidden">
            {deck.map((item) => <Card key={item.id} item={item} onDragStart={handleDragStart} />)}
            {deck.length === 0 && <span className="text-slate-300 text-[10px] italic">Empty</span>}
          </div>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-2 overflow-y-visible md:overflow-y-auto overflow-x-hidden">
          <MainColumnFixed
            title="Assets"
            borderColorClass="border-blue-500"
            headerColorClass="text-blue-600"
            sections={[
              { title: "Current", type: 'currentAssets', items: currentAssets, total: sum(currentAssets), colorClass: "text-blue-600", bgClass: "bg-blue-50" },
              { title: "Fixed", type: 'fixedAssets', items: fixedAssets, total: sum(fixedAssets), colorClass: "text-blue-600", bgClass: "bg-blue-50/70" },
            ]}
            onDrop={handleDrop}
            hintTargetType={hintTargetType}
          />
          <MainColumnFixed
            title="Liabilities"
            borderColorClass="border-orange-500"
            headerColorClass="text-orange-600"
            sections={[
              { title: "Current", type: 'currentLiab', items: currentLiab, total: sum(currentLiab), colorClass: "text-orange-600", bgClass: "bg-orange-50" },
              { title: "Long-term", type: 'longTermLiab', items: longTermLiab, total: sum(longTermLiab), colorClass: "text-orange-600", bgClass: "bg-orange-50/70" },
            ]}
            onDrop={handleDrop}
            hintTargetType={hintTargetType}
          />
          <MainColumnFixed
            title="Equity"
            borderColorClass="border-emerald-500"
            headerColorClass="text-emerald-600"
            sections={[
              { title: "Capital", type: 'equityCapital', items: equityCapital, total: sum(equityCapital), colorClass: "text-emerald-600", bgClass: "bg-emerald-50" },
              { title: "Retained & Reserves", type: 'equityRetained', items: equityRetained, total: sum(equityRetained), colorClass: "text-emerald-600", bgClass: "bg-emerald-50/70" },
            ]}
            onDrop={handleDrop}
            hintTargetType={hintTargetType}
          />
        </div>
      </main>

      {/* Answer overlay when lost or "View Answers" after won */}
      {(gameState === 'lost' || showAnswerReview) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden my-auto"
          >
            <div className={clsx("text-white px-6 py-4", showAnswerReview ? "bg-emerald-600" : "bg-red-500")}>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={24} /> Answers & Explanation
              </h2>
              <p className="text-white/90 text-sm mt-1">Balance: Assets = Liabilities + Equity</p>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh] sm:max-h-[60vh] space-y-4">
              {(['currentAssets', 'fixedAssets', 'currentLiab', 'longTermLiab', 'equityCapital', 'equityRetained'] as AccountCategory[]).map((cat) => {
                const items = itemsByCat[cat] || [];
                const ex = CATEGORY_EXPLANATIONS[cat];
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-100 px-4 py-2 font-bold text-sm text-slate-700">{ex.title}</div>
                    <div className="px-4 py-2 text-xs text-slate-600 bg-slate-50">{ex.explain}</div>
                    <div className="p-3 space-y-1">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span><strong>{item.en}</strong></span>
                          <span className="font-mono text-slate-600">${item.val.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t font-mono text-xs text-slate-500">
                        Total: ${items.reduce((a, c) => a + c.val, 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t bg-slate-50 flex gap-2 justify-center flex-wrap">
              {showAnswerReview ? (
                <button onClick={() => setShowAnswerReview(false)} className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-lg">
                  Close
                </button>
              ) : (
                <button onClick={() => startLevel()} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg">
                  Play Again
                </button>
              )}
            </div>
          </MotionDiv>
        </div>
      )}

      <footer className={clsx("flex-shrink-0 p-4 md:p-2 border-t text-center", gameState === 'lost' ? "bg-red-100" : gameState === 'won' ? "bg-green-100" : "bg-white")}>
        {wrongDropExplanation && (
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded text-left text-xs text-amber-800">
            <strong>{wrongDropExplanation.card.en}</strong> belongs to {wrongDropExplanation.correctExplain}
          </div>
        )}
        <div className={clsx("font-bold text-sm", feedback.type === 'error' ? "text-red-600" : feedback.type === 'success' ? "text-green-600" : "text-slate-600")}>
          {feedback.type === 'error' && <ShieldAlert size={14} className="inline mr-1" />}
          {feedback.type === 'success' && <Swords size={14} className="inline mr-1" />}
          {feedback.msg}
        </div>
        <div className="text-[10px] text-slate-400 font-mono">A: {tA.toLocaleString()} | L+E: {(tL + tE).toLocaleString()}</div>
        <div className="mt-1 flex gap-2 justify-center flex-wrap">
          {gameState === 'won' && (
            <>
              <button onClick={() => setShowAnswerReview(true)} className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold px-4 py-1 rounded flex items-center gap-1">
                <BookOpen size={12} /> View Answers
              </button>
              <button onClick={() => setLevel((l) => l + 1)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-1 rounded">Next</button>
            </>
          )}
          {gameState === 'lost' && <button onClick={() => startLevel()} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-1 rounded">Retry</button>}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%,75%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
        .animate-shake { animation: shake 0.3s ease both; }
      `}</style>
    </div>
  );
}
