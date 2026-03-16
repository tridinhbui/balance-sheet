const STORAGE_KEY = 'balance-quest-progress';

export type SavedProgress = {
  level: number;
  highestLevel: number;
  xp: number;
  highScore: number;
  totalLevelsWon: number;
  totalCorrect: number;
  totalAttempts: number;
  achievements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
};

const DEFAULT: SavedProgress = {
  level: 1,
  highestLevel: 1,
  xp: 0,
  highScore: 0,
  totalLevelsWon: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  achievements: [],
  difficulty: 'medium',
};

export function loadProgress(): SavedProgress {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<SavedProgress>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

export function saveProgress(p: Partial<SavedProgress>) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadProgress();
    const merged = { ...current, ...p };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}
