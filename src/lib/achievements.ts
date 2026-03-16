export type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', name: 'First Win', desc: 'Complete your first level', icon: '🏆' },
  { id: 'level_10', name: 'Level 10', desc: 'Reach level 10', icon: '⭐' },
  { id: 'perfect_level', name: 'Perfect Level', desc: 'Complete a level with no mistakes', icon: '💯' },
  { id: 'streak_5', name: 'Hot Streak', desc: '5 correct answers in a row', icon: '🔥' },
  { id: 'xp_500', name: 'XP Master', desc: 'Earn 500 total XP', icon: '📈' },
  { id: 'practice_10', name: 'Dedicated Learner', desc: 'Complete a level in Practice mode', icon: '📚' },
];

export function checkNewAchievements(
  progress: { totalLevelsWon: number; level: number; totalCorrect: number; totalAttempts: number; xp: number; achievements: string[] },
  currentLevelCorrect: number,
  currentLevelAttempts: number,
  isPractice: boolean
): string[] {
  const newIds: string[] = [];
  const has = (id: string) => progress.achievements.includes(id);

  if (progress.totalLevelsWon >= 1 && !has('first_win')) newIds.push('first_win');
  if (progress.level >= 10 && !has('level_10')) newIds.push('level_10');
  if (currentLevelCorrect > 0 && currentLevelAttempts === currentLevelCorrect && !has('perfect_level')) newIds.push('perfect_level');
  if (progress.xp >= 500 && !has('xp_500')) newIds.push('xp_500');
  if (isPractice && progress.totalLevelsWon >= 1 && !has('practice_10')) newIds.push('practice_10');

  return newIds;
}

export function checkStreakAchievement(streak: number, achievements: string[]): string | null {
  if (streak >= 5 && !achievements.includes('streak_5')) return 'streak_5';
  return null;
}
