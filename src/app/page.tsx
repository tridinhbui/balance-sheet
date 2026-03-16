"use client";

import React, { useState, useEffect, useCallback } from 'react';

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    mq.addEventListener('change', (e) => setIsDesktop(e.matches));
    return () => mq.removeEventListener('change', (e) => setIsDesktop(e.matches));
  }, []);
  return isDesktop;
}
import { motion, LayoutGroup } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv = motion.div as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionCard = motion.div as any;
import { ACCOUNTS, AccountItem, AccountCategory, CATEGORY_EXPLANATIONS, CATEGORY_CARD_STYLE, LEVEL_TIPS, DIFFICULTY_CONFIG, MAX_LEVEL, BOSS_NAMES, BOSS_ICONS, type Difficulty } from '@/lib/gameData';
import { loadProgress, saveProgress } from '@/lib/storage';
import { playCorrect, playWrong, playVictory, playDefeat, setMuted, isMuted } from '@/lib/sounds';
import { ACHIEVEMENTS, checkNewAchievements, checkStreakAchievement } from '@/lib/achievements';
import confetti from 'canvas-confetti';
import { Heart, ShieldAlert, Swords, RefreshCw, Trophy, GripHorizontal, Lightbulb, BookOpen, Volume2, VolumeX, BarChart3, Award, Home, Map, Users } from 'lucide-react';
import clsx from 'clsx';
import { AuthButton } from '@/components/AuthButton';
import { useAppAuth } from '@/components/AuthProvider';
import { getAuthInstance, saveProgressToCloud, loadProgressFromCloud, isFirebaseConfigured, addToLeaderboard, getLeaderboard, type LeaderboardEntry } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// --- COMPONENTS ---

const Card = ({ item, onDragStart, onTap, selected, inDeck }: { item: AccountItem; onDragStart: (e: React.DragEvent, id: string) => void; onTap?: (id: string) => void; selected?: boolean; inDeck?: boolean }) => {
  const style = CATEGORY_CARD_STYLE[item.cat];
  return (
    <MotionCard
      layoutId={item.id}
      layout
      draggable
      onDragStart={(e: React.DragEvent) => onDragStart(e, item.id)}
      onClick={() => onTap?.(item.id)}
      className={clsx(
        "p-3 md:p-2.5 rounded-lg shadow-md hover:shadow-lg select-none cursor-grab active:cursor-grabbing flex items-center justify-between gap-2 min-w-[140px] md:min-w-0 shrink-0 min-h-[52px] md:min-h-[48px] touch-manipulation transition-all active:scale-[0.98]",
        inDeck ? "bg-white border border-slate-200" : `${style.border} ${style.bg}`,
        selected ? "ring-2 ring-amber-400 ring-offset-2 scale-[1.02]" : "hover:shadow-xl"
      )}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="min-w-0 flex-1">
        <div className={clsx("font-semibold text-sm md:text-xs truncate", inDeck ? "text-slate-800" : style.accent)}>{item.en}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="bg-white/80 text-slate-700 font-mono text-xs md:text-[10px] px-2 py-1 md:py-0.5 rounded-md font-bold shadow-sm">${item.val.toLocaleString()}</span>
        <GripHorizontal size={12} className="text-slate-400" />
      </div>
    </MotionCard>
  );
};

const DropSection = ({
  title,
  type,
  items,
  total,
  colorClass,
  bgClass,
  onDrop,
  highlightHint,
  selectedCardId,
  onTapPlace,
}: {
  title: string;
  type: AccountCategory;
  items: AccountItem[];
  total: number;
  colorClass: string;
  bgClass: string;
  onDrop: (cardId: string, targetType: AccountCategory) => void;
  highlightHint?: boolean;
  selectedCardId?: string | null;
  onTapPlace?: (cardId: string, type: AccountCategory) => void;
}) => {
  const [over, setOver] = useState(false);
  const handleClick = () => {
    if (selectedCardId && onTapPlace) onTapPlace(selectedCardId, type);
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData('text/plain'); if (id) onDrop(id, type); }}
      onClick={handleClick}
      className={clsx(
        "flex-1 min-h-[88px] md:min-h-0 flex flex-col rounded-lg md:rounded border overflow-hidden transition-all active:scale-[0.99]",
        bgClass,
        over && "ring-2 ring-amber-400",
        highlightHint && "ring-2 ring-amber-400 ring-offset-2 animate-pulse",
        selectedCardId && "cursor-pointer"
      )}
    >
      <div className={clsx("px-2 py-2 md:py-1 text-center font-bold text-xs md:text-[10px] uppercase shrink-0", colorClass)}>{title}</div>
      <div className="flex-1 min-h-0 overflow-hidden p-2 md:p-1 flex flex-wrap content-start gap-2 md:gap-1">
        {items.map((item) => {
          const style = CATEGORY_CARD_STYLE[item.cat];
          return (
            <MotionCard
              key={item.id}
              layoutId={item.id}
              layout
              className={clsx("p-1.5 rounded-md border-l-2 text-[10px] flex justify-between items-center gap-1 min-w-0 shadow-sm", style.border, style.bg)}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <span className={clsx("truncate font-medium", style.accent)}>{item.en}</span>
              <span className="font-mono shrink-0 font-bold">${item.val.toLocaleString()}</span>
            </MotionCard>
          );
        })}
        {items.length === 0 && <div className="w-full flex items-center justify-center text-slate-400 text-xs md:text-[10px] italic py-2">Tap card then tap here</div>}
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
  selectedCardId,
  onTapPlace,
}: {
  title: string;
  borderColorClass: string;
  headerColorClass: string;
  sections: { title: string; type: AccountCategory; items: AccountItem[]; total: number; colorClass: string; bgClass: string }[];
  onDrop: (cardId: string, targetType: AccountCategory) => void;
  hintTargetType?: AccountCategory | null;
  selectedCardId?: string | null;
  onTapPlace?: (cardId: string, type: AccountCategory) => void;
}) => (
  <div className={clsx("flex flex-col rounded-xl md:rounded-lg border-t-4 bg-white shadow-sm overflow-hidden min-w-0 flex-1 min-h-[200px] md:min-h-0", borderColorClass)}>
    <div className={clsx("px-3 py-2.5 md:py-1.5 text-center font-bold text-sm md:text-xs uppercase shrink-0", headerColorClass)}>{title}</div>
    <div className="flex-1 min-h-0 flex flex-col gap-2 md:gap-1 p-2.5 md:p-1.5">
      {sections.map((s) => (
        <DropSection key={s.type} title={s.title} type={s.type} items={s.items} total={s.total} colorClass={s.colorClass} bgClass={s.bgClass} onDrop={onDrop} highlightHint={hintTargetType === s.type} selectedCardId={selectedCardId} onTapPlace={onTapPlace} />
      ))}
    </div>
  </div>
);

// --- MAIN ---

const STREAK_BONUS = 20; // +20 XP for 3+ correct in a row

export default function BalanceQuest() {
  const { user: authUser } = useAppAuth();
  type SignedInLeaderboardUser = {
    id: string;
    displayName: string;
    avatarUrl: string;
  };
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(1);
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
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [practiceMode, setPracticeMode] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [totalLevelsWon, setTotalLevelsWon] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [levelCorrect, setLevelCorrect] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selfLeaderboardRank, setSelfLeaderboardRank] = useState<{ rank: number; bestLevel: number } | null>(null);
  const [newAchievementIds, setNewAchievementIds] = useState<string[]>([]);
  const [deckWidth, setDeckWidth] = useState(192);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = React.useRef({ x: 0, w: 0 });

  const config = DIFFICULTY_CONFIG[difficulty];
  const maxPlayerHp = practiceMode ? 999 : config.lives;
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const p = loadProgress();
    setLevel(p.level);
    setHighestLevel(p.highestLevel ?? p.level ?? 1);
    setXp(p.xp);
    setDifficulty(p.difficulty);
    setTotalLevelsWon(p.totalLevelsWon);
    setTotalCorrect(p.totalCorrect);
    setTotalAttempts(p.totalAttempts);
    setAchievements(p.achievements);
  }, []);

  useEffect(() => {
    const auth = getAuthInstance();
    if (!auth || !isFirebaseConfigured()) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const cloud = await loadProgressFromCloud(user.uid);
        if (cloud && (cloud.level ?? 0) > 0) {
          setLevel(cloud.level ?? 1);
          setHighestLevel(cloud.highestLevel ?? cloud.level ?? 1);
          setXp(cloud.xp ?? 0);
          setTotalLevelsWon(cloud.totalLevelsWon ?? 0);
          setTotalCorrect(cloud.totalCorrect ?? 0);
          setTotalAttempts(cloud.totalAttempts ?? 0);
          setAchievements(cloud.achievements ?? []);
          if (cloud.difficulty) setDifficulty(cloud.difficulty);
          saveProgress(cloud);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('balance-quest-muted') === '1';
      setMutedState(stored);
      setMuted(stored);
      const dw = localStorage.getItem('balance-quest-deck-width');
      if (dw) setDeckWidth(Math.min(400, Math.max(160, parseInt(dw, 10))));
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartRef.current.x;
      const newW = Math.min(400, Math.max(160, resizeStartRef.current.w + delta));
      setDeckWidth(newW);
      localStorage.setItem('balance-quest-deck-width', String(newW));
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizing]);

  useEffect(() => {
    if (!gameStarted) return;
    const p = { level, highestLevel, xp, totalLevelsWon, totalCorrect, totalAttempts, achievements, difficulty };
    saveProgress(p);
    const auth = getAuthInstance();
    if (auth?.currentUser && isFirebaseConfigured()) {
      saveProgressToCloud(auth.currentUser.uid, p).catch(() => {});
    }
  }, [level, highestLevel, xp, totalLevelsWon, totalCorrect, totalAttempts, achievements, difficulty, gameStarted]);

  useEffect(() => { if (gameStarted) startLevel(); }, [level, gameStarted]);

  useEffect(() => {
    if (practiceMode || gameState !== 'playing' || timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) {
          clearInterval(t);
          setGameState('lost');
          setLevel(1);
          setFeedback({ msg: "TIME'S UP! Back to Level 1.", type: 'error' });
          if (!muted) playDefeat();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameState, timeLeft, practiceMode, muted]);

  const getSignedInLeaderboardUser = useCallback((): SignedInLeaderboardUser | null => {
    if (authUser) {
      return {
        id: authUser.id,
        displayName: authUser.displayName || 'Anonymous',
        avatarUrl: authUser.avatarUrl || '',
      };
    }

    const firebaseUser = getAuthInstance()?.currentUser;
    if (firebaseUser) {
      return {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Anonymous',
        avatarUrl: firebaseUser.photoURL || '',
      };
    }

    return null;
  }, [authUser]);

  const refreshLeaderboard = useCallback(async (targetUserId?: string, achievedLevel?: number) => {
    const board = await getLeaderboard();
    setLeaderboard(board);

    if (!targetUserId) {
      setSelfLeaderboardRank(null);
      return;
    }
    const rank = board.findIndex((entry) => entry.userId === targetUserId);
    if (rank >= 0) {
      setSelfLeaderboardRank({
        rank: rank + 1,
        bestLevel: achievedLevel ?? board[rank].bestLevel,
      });
      return;
    }

    setSelfLeaderboardRank(null);
  }, []);

  const startLevel = () => {
    const items: AccountItem[] = [];
    let totalA = 0, totalL = 0;
    const shuf = (arr: { en: string }[]) => [...arr].sort(() => 0.5 - Math.random());
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
    setPlayerHp(practiceMode ? 999 : config.lives);
    setBossHp(items.length);
    setMaxBossHp(items.length);
    setGameState('playing');
    setTimeLeft(practiceMode ? 99999 : config.time);
    setFeedback({ msg: practiceMode ? `Practice • Level ${level}` : `Level ${level}`, type: 'neutral' });
    setHintUsed(false);
    setHintTargetType(null);
    setWrongDropExplanation(null);
    setShowAnswerReview(false);
    setCorrectStreak(0);
    setLevelTip(LEVEL_TIPS[(level - 1) % LEVEL_TIPS.length]);
    setSelectedCardId(null);
    setLevelCorrect(0);
    setLevelAttempts(0);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = useCallback((cardId: string, targetType: AccountCategory) => {
    if (gameState !== 'playing') return;
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;
    setHintTargetType(null);
    setSelectedCardId(null);
    setLevelAttempts((a) => a + 1);
    setTotalAttempts((a) => a + 1);

    if (card.cat === targetType) {
      setDeck((p) => p.filter((c) => c.id !== card.id));
      if (targetType === 'currentAssets') setCurrentAssets((p) => [...p, card]);
      if (targetType === 'fixedAssets') setFixedAssets((p) => [...p, card]);
      if (targetType === 'currentLiab') setCurrentLiab((p) => [...p, card]);
      if (targetType === 'longTermLiab') setLongTermLiab((p) => [...p, card]);
      if (targetType === 'equityCapital') setEquityCapital((p) => [...p, card]);
      if (targetType === 'equityRetained') setEquityRetained((p) => [...p, card]);
      setLevelCorrect((c) => c + 1);
      setTotalCorrect((c) => c + 1);
      setBossHp((p) => {
        const n = p - 1;
        if (n <= 0) {
          const newTotalWon = totalLevelsWon + 1;
          const previousHighestLevel = highestLevel;
          const newHighestLevel = Math.max(previousHighestLevel, level);
          setGameState('won');
          setTotalLevelsWon((w) => w + 1);
          setHighestLevel(newHighestLevel);
          confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
          setFeedback({ msg: "VICTORY!", type: 'success' });
          if (!muted) playVictory();
          const newXp = xp + 50 + (correctStreak >= 3 ? STREAK_BONUS : 0);
          const bestLevelReached = newHighestLevel;
          saveProgress({ highScore: Math.max(loadProgress().highScore, newXp) });
          console.log("LEVEL COMPLETED:", level);
          console.log("USER HIGHEST:", previousHighestLevel);
          // Sync only when a logged-in user reaches a strictly higher best level at/above level 5.
          const shouldSyncLeaderboard = bestLevelReached >= 5;
          if (shouldSyncLeaderboard) {
            console.log("UPDATING LEADERBOARD");
            const leaderboardUser = getSignedInLeaderboardUser();
            console.log("--- DEBUG INFO ---");
            console.log("User Information:", leaderboardUser);
            console.log("User's Target Highest Level:", bestLevelReached);
            console.log("------------------");

            if (leaderboardUser) {
              void addToLeaderboard(
                leaderboardUser.id,
                leaderboardUser.displayName,
                leaderboardUser.avatarUrl,
                newTotalWon,
                bestLevelReached,
              )
                .then(async (updated) => {
                  if (!updated) return;
                  await refreshLeaderboard(leaderboardUser.id, bestLevelReached);
                  setShowLeaderboard(true);
                })
                .catch((error) => {
                  console.error('Failed to sync leaderboard:', error);
                });
            }
          }
          const newAchievs = checkNewAchievements(
            { totalLevelsWon: totalLevelsWon + 1, level, totalCorrect: totalCorrect + 1, totalAttempts: totalAttempts + 1, xp: newXp, achievements },
            levelCorrect + 1, levelAttempts + 1, practiceMode
          );
          const streakAchiev = checkStreakAchievement(correctStreak + 1, achievements);
          if (streakAchiev) newAchievs.push(streakAchiev);
          if (newAchievs.length > 0) {
            setAchievements((a) => [...a, ...newAchievs]);
            setNewAchievementIds(newAchievs);
            setTimeout(() => setNewAchievementIds([]), 4000);
          }
        }
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
      if (!muted) playCorrect();
    } else {
      if (!practiceMode) {
        setPlayerHp((p) => {
          const n = p - 1;
          if (n <= 0) {
            setGameState('lost');
            setLevel(1);
            setFeedback({ msg: "DEFEAT! Back to Level 1.", type: 'error' });
            if (!muted) playDefeat();
          }
          return n;
        });
      }
      setShake(true);
      setTimeout(() => setShake(false), 300);
      setCorrectStreak(0);
      const ex = CATEGORY_EXPLANATIONS[card.cat];
      setWrongDropExplanation({ card, correctExplain: `${ex.title}: ${ex.explain}` });
      setFeedback({ msg: "Wrong!", type: 'error' });
      if (!muted) playWrong();
    }
  }, [gameState, deck, correctStreak, muted, xp, totalLevelsWon, totalCorrect, totalAttempts, level, highestLevel, levelCorrect, levelAttempts, achievements, practiceMode, getSignedInLeaderboardUser, refreshLeaderboard]);

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
      <div className="min-h-screen flex flex-col bg-white overflow-y-auto pt-safe pb-safe relative">
        {/* Login + Leaderboard in top-right corner */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 flex items-center gap-2">
          <button onClick={() => { const current = getSignedInLeaderboardUser(); setShowLeaderboard(true); void refreshLeaderboard(current?.id); }} className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-slate-100 transition-colors">
            <Users size={18} /> Leaderboard
          </button>
          <AuthButton />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 sm:py-16">
          <MotionDiv
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <div className="text-5xl sm:text-6xl mb-6 sm:mb-8">⚖️</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
              Balance <span className="text-amber-500">Quest</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mb-8 sm:mb-10">
              Learn the Balance Sheet through gameplay
            </p>

            {/* Difficulty - compact pills */}
            <div className="flex gap-2 justify-center mb-6 sm:mb-8">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all touch-manipulation",
                    difficulty === d
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                </button>
              ))}
            </div>

            {/* Main CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={() => { setPracticeMode(true); setLevel(1); setGameStarted(true); }}
                className="px-8 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all min-h-[52px] touch-manipulation"
              >
                Practice
              </button>
              <button
                onClick={() => { setPracticeMode(false); setLevel(1); setGameStarted(true); }}
                className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all min-h-[52px] touch-manipulation"
              >
                Start Game
              </button>
            </div>

            <p className="text-slate-400 text-xs mb-8">
              {difficulty === 'easy' && '90s • 5 lives'}
              {difficulty === 'medium' && '120s • 3 lives'}
              {difficulty === 'hard' && '90s • 2 lives'}
            </p>

            {/* Secondary links - minimal */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <button onClick={() => setShowMap(true)} className="text-slate-500 hover:text-slate-800 transition-colors py-1">
                Map
              </button>
              <button onClick={() => setShowStats(true)} className="text-slate-500 hover:text-slate-800 transition-colors py-1">
                Stats
              </button>
            </div>
            {isFirebaseConfigured() && <p className="text-slate-400 text-[11px] mt-3">Sign in (top right) to sync progress across devices</p>}
          </MotionDiv>
        </div>
        <p className="text-center text-slate-400 text-xs pb-6">Drag & drop or tap • Assets = Liabilities + Equity</p>

        {showLeaderboard && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto pt-safe pb-safe" onClick={() => setShowLeaderboard(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 my-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Users size={24} className="text-amber-500" /> Leaderboard
              </h2>
              <p className="text-slate-500 text-sm mb-4">Players who reached level 5+ (rank, avatar, name, highest level)</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {leaderboard.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">No entries yet. Be the first!</p>}
                {leaderboard.map((entry, i) => (
                  <div key={entry.userId} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-500 w-6">#{i + 1}</span>
                      {entry.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.avatarUrl} alt={entry.displayName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                          {(entry.displayName || 'A').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-800 truncate">{entry.displayName}</span>
                    </div>
                    <span className="text-sm font-bold text-amber-600 shrink-0">Lv {entry.bestLevel}</span>
                  </div>
                ))}
              </div>
              {selfLeaderboardRank && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  You reached level {selfLeaderboardRank.bestLevel} and are ranked #{selfLeaderboardRank.rank}.
                </div>
              )}
              <button onClick={() => setShowLeaderboard(false)} className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium min-h-[48px] touch-manipulation">Close</button>
            </div>
          </div>
        )}

        {showMap && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto pt-safe pb-safe" onClick={() => setShowMap(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Map size={24} className="text-amber-500" /> Progression Map
              </h2>
              <p className="text-slate-500 text-sm mb-4">{MAX_LEVEL} levels • Defeat the Imbalance King!</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => {
                  const completed = level > lvl;
                  const current = level === lvl;
                  const locked = level < lvl;
                  const bossName = BOSS_NAMES[lvl] || `Boss ${lvl}`;
                  const icon = BOSS_ICONS[lvl] || '👾';
                  return (
                    <div
                      key={lvl}
                      className={clsx(
                        "w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        completed && "bg-emerald-50 border-emerald-300 text-emerald-600",
                        current && "bg-amber-50 border-amber-400 text-amber-600 ring-2 ring-amber-200",
                        locked && "bg-slate-50 border-slate-200 text-slate-400"
                      )}
                    >
                      <span className="text-xl sm:text-2xl">{completed ? '✓' : locked ? '🔒' : icon}</span>
                      <span className="text-[10px] font-bold">{lvl}</span>
                      <span className="text-[8px] truncate w-full text-center px-0.5 hidden sm:block">{bossName}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-slate-500">
                <span><span className="text-emerald-500">✓</span> Completed</span>
                <span><span className="text-amber-500">{BOSS_ICONS[level] || '👾'}</span> Current</span>
                <span><span className="text-slate-400">🔒</span> Locked</span>
              </div>
              <button onClick={() => setShowMap(false)} className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium min-h-[48px] touch-manipulation">Close</button>
            </div>
          </div>
        )}

        {showStats && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 pt-safe pb-safe overflow-y-auto" onClick={() => setShowStats(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-auto border border-slate-200" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><BarChart3 size={20} /> Stats</h2>
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <p>Levels completed: <strong>{totalLevelsWon}</strong></p>
                <p>Highest level: <strong>{highestLevel}</strong></p>
                <p>Accuracy: <strong>{totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0}%</strong></p>
                <p>XP: <strong>{xp}</strong></p>
                <p>High score: <strong>{loadProgress().highScore}</strong></p>
              </div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2"><Award size={20} /> Achievements</h2>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.id} className={clsx("flex items-center gap-2 py-1 text-sm", achievements.includes(a.id) ? "text-slate-800" : "text-slate-400")}>
                    <span>{a.icon}</span>
                    <span className="font-medium">{a.name}</span>
                    <span className="text-xs hidden sm:inline">— {a.desc}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowStats(false)} className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium min-h-[48px] touch-manipulation">Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const KEY_BOSS_LEVELS = [1, 5, 10, 15, 20];

  return (
    <div className={clsx("min-h-screen md:h-screen flex flex-col overflow-y-auto md:overflow-hidden bg-slate-50", shake && "animate-shake", isResizing && "select-none cursor-col-resize")}>
      <header className="flex-shrink-0 bg-white border-b p-3 md:p-2 pt-safe">
        {/* Mobile: compact single-line header. Desktop: journey bar with icons only at key bosses */}
        <div className="max-w-6xl mx-auto">
          <div className="hidden md:block mb-2 overflow-x-auto">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: MAX_LEVEL }, (_, i) => {
                const lvl = i + 1;
                const completed = level > lvl;
                const current = level === lvl;
                const locked = level < lvl;
                const isKeyBoss = KEY_BOSS_LEVELS.includes(lvl);
                const icon = BOSS_ICONS[lvl] || '👾';
                return (
                  <div
                    key={lvl}
                    className={clsx(
                      "flex-1 min-w-[4px] flex flex-col items-center gap-0.5 transition-colors",
                      completed && "text-emerald-600",
                      current && "text-amber-500",
                      locked && "text-slate-300"
                    )}
                    title={`Lv${lvl} ${BOSS_NAMES[lvl] || ''}`}
                  >
                    <span className="text-[10px] leading-none">
                      {completed ? '✓' : isKeyBoss ? icon : '•'}
                    </span>
                    <div className={clsx("h-1 w-full rounded-sm transition-colors", completed && "bg-emerald-500", current && "bg-amber-500 ring-1 ring-amber-400", locked && "bg-slate-200")} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span>Lv1 {BOSS_ICONS[1]}</span>
              <span className="text-amber-600 font-bold">Lv{level} {BOSS_NAMES[level]}</span>
              <span>Lv{MAX_LEVEL} {BOSS_ICONS[20]} King</span>
            </div>
          </div>
          {/* Mobile: compact progress */}
          <div className="md:hidden flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(level / MAX_LEVEL) * 100}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-600 shrink-0">Lv {level}/{MAX_LEVEL}</span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-16 sm:w-24 h-3 bg-slate-200 rounded-full overflow-hidden shrink-0">
              <MotionDiv className="h-full bg-red-500" initial={{ width: '100%' }} animate={{ width: `${(bossHp / maxBossHp) * 100}%` }} />
            </div>
            <span className={clsx("text-2xl", bossShake && "scale-125")}>👾</span>
            <span className="text-xs font-medium text-slate-600 hidden sm:inline">{BOSS_NAMES[level] || `Lv${level}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500">Lv {level}</span>
            <span className="font-bold flex items-center gap-1"><Trophy size={14} className="text-yellow-500" />{xp}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={clsx("px-2 py-1 rounded font-mono font-bold text-sm", practiceMode ? "bg-emerald-100 text-emerald-600" : timeLeft <= 60 ? "bg-red-100 text-red-600" : timeLeft <= 120 ? "bg-amber-100 text-amber-600" : "bg-slate-100")}>
              {practiceMode ? "∞" : `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
            </div>
            <div className="flex gap-0.5">
              {!practiceMode && [...Array(Math.min(maxPlayerHp, 5))].map((_, i) => <Heart key={i} size={18} className={i < playerHp ? "fill-red-500 text-red-500" : "text-slate-200"} />)}
              {practiceMode && <span className="text-xs text-slate-500">∞</span>}
            </div>
            <button
              onClick={() => {
                const next = !muted;
                setMutedState(next);
                setMuted(next);
                if (typeof window !== 'undefined') localStorage.setItem('balance-quest-muted', next ? '1' : '0');
              }}
              className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-slate-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={20} className="text-slate-500" /> : <Volume2 size={20} className="text-slate-600" />}
            </button>
            <button onClick={() => setShowMap(true)} className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-slate-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center" title="Progression Map">
              <Map size={20} className="text-slate-600" />
            </button>
            <button onClick={() => setShowStats(true)} className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-slate-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center" title="Stats & Achievements">
              <BarChart3 size={20} className="text-slate-600" />
            </button>
            <button onClick={() => { const current = getSignedInLeaderboardUser(); setShowLeaderboard(true); void refreshLeaderboard(current?.id); }} className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-slate-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center" title="Leaderboard">
              <Users size={20} className="text-slate-600" />
            </button>
            <button onClick={() => { setGameStarted(false); setShowStats(false); }} className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-slate-100 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center" title="Back to menu">
              <Home size={20} className="text-slate-600" />
            </button>
            <div className="hidden sm:block">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {newAchievementIds.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-slate-900 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <Award size={20} />
          {newAchievementIds.map((id) => {
            const a = ACHIEVEMENTS.find((x) => x.id === id);
            return a ? <span key={id}>{a.icon} {a.name}!</span> : null;
          })}
        </div>
      )}

      {levelTip && (
        <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-4 py-3 md:px-3 md:py-2">
          <p className="text-sm md:text-xs text-amber-800 flex items-center gap-2">
            <Lightbulb size={18} className="text-amber-500 shrink-0" />
            <span>{levelTip}</span>
          </p>
        </div>
      )}

      <LayoutGroup>
      <main className="flex-1 min-h-0 p-3 md:p-2 flex flex-col md:flex-row gap-3 md:gap-0 overflow-visible md:overflow-hidden">
        <div
          className="w-full md:flex-shrink-0 flex flex-col bg-white rounded-xl md:rounded-lg border border-slate-200 shadow-sm overflow-hidden min-h-0 shrink-0"
          style={{ width: isDesktop ? deckWidth : undefined }}
        >
          <div className="flex justify-between items-center px-3 py-2 md:py-1 border-b border-slate-100 gap-2">
            <span className="text-xs font-medium text-slate-500">Deck ({deck.length})</span>
            <div className="flex items-center gap-1">
              {deck.length > 0 && !hintUsed && (
                <button
                  onClick={() => { setHintUsed(true); setHintTargetType(deck[0].cat); setTimeout(() => setHintTargetType(null), 4000); }}
                  className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-amber-100 text-amber-600 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center touch-manipulation"
                  title="Hint (1 per level)"
                >
                  <Lightbulb size={18} />
                </button>
              )}
              <button onClick={() => startLevel()} className="p-2.5 md:p-1 rounded-lg md:rounded hover:bg-slate-100 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center touch-manipulation" title="Restart level">
                <RefreshCw size={18} className="hover:rotate-180 transition shrink-0" />
              </button>
            </div>
          </div>
          <div className="min-h-[100px] md:flex-1 md:min-h-0 overflow-x-auto overflow-y-hidden p-2.5 md:p-1.5 flex flex-row md:flex-wrap md:content-start gap-2 md:gap-1 md:overflow-y-auto md:overflow-x-hidden">
            {deck.map((item) => <Card key={item.id} item={item} onDragStart={handleDragStart} onTap={(id) => setSelectedCardId((s) => s === id ? null : id)} selected={selectedCardId === item.id} inDeck />)}
            {deck.length === 0 && <span className="text-slate-300 text-[10px] italic">Empty</span>}
          </div>
        </div>

        {/* Resize handle - desktop only */}
        <div
          onMouseDown={(e) => { resizeStartRef.current = { x: e.clientX, w: deckWidth }; setIsResizing(true); }}
          className="hidden md:flex w-2 flex-shrink-0 cursor-col-resize hover:bg-amber-200 active:bg-amber-300 transition-colors group items-center justify-center"
          title="Drag to resize deck"
        >
          <div className="w-1 h-8 rounded-full bg-slate-300 group-hover:bg-amber-500 transition-colors" />
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-2 overflow-y-visible md:overflow-y-auto overflow-x-hidden p-2">
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
            selectedCardId={selectedCardId}
            onTapPlace={handleDrop}
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
            selectedCardId={selectedCardId}
            onTapPlace={handleDrop}
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
            selectedCardId={selectedCardId}
            onTapPlace={handleDrop}
          />
        </div>
      </main>
      </LayoutGroup>

      {/* Answer overlay when lost or "View Answers" after won */}
      {(gameState === 'lost' || showAnswerReview) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 pt-safe pb-safe overflow-y-auto overscroll-contain">
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
            <div className="p-4 border-t bg-slate-50 flex gap-3 justify-center flex-wrap">
              {showAnswerReview ? (
                <button onClick={() => setShowAnswerReview(false)} className="px-6 py-3 md:py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl min-h-[48px] touch-manipulation">
                  Close
                </button>
              ) : (
                <button onClick={() => startLevel()} className="px-6 py-3 md:py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl min-h-[48px] touch-manipulation">
                  Play Again
                </button>
              )}
            </div>
          </MotionDiv>
        </div>
      )}

      <footer className={clsx("flex-shrink-0 p-4 md:p-2 pb-safe border-t text-center", gameState === 'lost' ? "bg-red-100" : gameState === 'won' ? "bg-green-100" : "bg-white")}>
        {wrongDropExplanation && (
          <div className="mb-2 p-3 md:p-2 bg-amber-50 border border-amber-200 rounded-lg text-left text-sm md:text-xs text-amber-800">
            <strong>{wrongDropExplanation.card.en}</strong> belongs to {wrongDropExplanation.correctExplain}
          </div>
        )}
        <div className={clsx("font-bold text-base md:text-sm", feedback.type === 'error' ? "text-red-600" : feedback.type === 'success' ? "text-green-600" : "text-slate-600")}>
          {feedback.type === 'error' && <ShieldAlert size={14} className="inline mr-1" />}
          {feedback.type === 'success' && <Swords size={14} className="inline mr-1" />}
          {feedback.msg}
        </div>
        <div className="text-xs md:text-[10px] text-slate-400 font-mono mt-1">A: {tA.toLocaleString()} | L+E: {(tL + tE).toLocaleString()}</div>
        <div className="mt-2 flex gap-3 justify-center flex-wrap">
          {gameState === 'won' && (
            <>
              <button onClick={() => setShowAnswerReview(true)} className="bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 min-h-[44px] touch-manipulation">
                <BookOpen size={16} /> View Answers
              </button>
              <button onClick={() => setLevel((l) => l + 1)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg min-h-[44px] touch-manipulation">Next</button>
            </>
          )}
          {gameState === 'lost' && <button onClick={() => { setLevel(1); startLevel(); }} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg min-h-[44px] touch-manipulation">Retry</button>}
        </div>
      </footer>

      {showMap && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto pt-safe pb-safe" onClick={() => setShowMap(false)}>
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-700 my-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <Map size={24} className="text-amber-400" /> Progression Map
            </h2>
            <p className="text-slate-400 text-sm mb-4">Conquer bosses through {MAX_LEVEL} levels. Defeat the Imbalance King!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => {
                const completed = level > lvl;
                const current = level === lvl;
                const locked = level < lvl;
                const bossName = BOSS_NAMES[lvl] || `Boss ${lvl}`;
                const icon = BOSS_ICONS[lvl] || '👾';
                return (
                  <div
                    key={lvl}
                    className={clsx(
                      "w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                      completed && "bg-emerald-500/20 border-emerald-500 text-emerald-400",
                      current && "bg-amber-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/50",
                      locked && "bg-slate-800 border-slate-600 text-slate-500"
                    )}
                  >
                    <span className="text-2xl">{completed ? '✓' : locked ? '🔒' : icon}</span>
                    <span className="text-[10px] font-bold">{lvl}</span>
                    <span className="text-[8px] truncate w-full text-center px-0.5">{bossName}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-slate-400">
              <span><span className="text-emerald-400">✓</span> Completed</span>
              <span><span className="text-amber-400">{BOSS_ICONS[level] || '👾'}</span> Current</span>
              <span><span className="text-slate-500">🔒</span> Locked</span>
            </div>
            <button onClick={() => setShowMap(false)} className="mt-4 w-full py-3 md:py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold min-h-[48px] touch-manipulation">Close</button>
          </div>
        </div>
      )}

      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 pt-safe pb-safe overflow-y-auto" onClick={() => setShowLeaderboard(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-auto border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Users size={24} className="text-amber-500" /> Leaderboard
            </h2>
            <p className="text-slate-500 text-sm mb-4">Players who reached level 5+</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {leaderboard.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">No entries yet. Be the first!</p>}
              {leaderboard.map((entry, i) => (
                <div key={entry.userId} className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-500 w-6">#{i + 1}</span>
                    {entry.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.avatarUrl} alt={entry.displayName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                        {(entry.displayName || 'A').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-slate-800 truncate">{entry.displayName}</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600 shrink-0">Lv {entry.bestLevel}</span>
                </div>
              ))}
            </div>
            {selfLeaderboardRank && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                You reached level {selfLeaderboardRank.bestLevel} and are ranked #{selfLeaderboardRank.rank}.
              </div>
            )}
            <button onClick={() => setShowLeaderboard(false)} className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium min-h-[48px] touch-manipulation">Close</button>
          </div>
        </div>
      )}

      {showStats && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 pt-safe pb-safe overflow-y-auto" onClick={() => setShowStats(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 my-auto border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><BarChart3 size={20} /> Stats</h2>
            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p>Levels completed: <strong>{totalLevelsWon}</strong></p>
              <p>Highest level: <strong>{highestLevel}</strong></p>
              <p>Accuracy: <strong>{totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0}%</strong></p>
              <p>XP: <strong>{xp}</strong></p>
              <p>High score: <strong>{loadProgress().highScore}</strong></p>
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2"><Award size={20} /> Achievements</h2>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {ACHIEVEMENTS.map((a) => (
                <div key={a.id} className={clsx("flex items-center gap-2 py-1 text-sm", achievements.includes(a.id) ? "text-slate-800" : "text-slate-400")}>
                  <span>{a.icon}</span>
                  <span className="font-medium">{a.name}</span>
                  <span className="text-xs hidden sm:inline">— {a.desc}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowStats(false)} className="mt-4 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium min-h-[48px] touch-manipulation">Close</button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%,75%{transform:translateX(-3px)} 50%{transform:translateX(3px)} }
        .animate-shake { animation: shake 0.3s ease both; }
      `}</style>
    </div>
  );
}
