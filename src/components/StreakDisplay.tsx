import { motion } from 'framer-motion';
import { Flame, Calendar } from 'lucide-react';
import { getRecordsForCat, getTodayKey } from '@/lib/healthStorage';

interface StreakDisplayProps {
  catId: string;
}

export const calculateStreak = (catId: string): { currentStreak: number; longestStreak: number; hasCheckedToday: boolean } => {
  const records = getRecordsForCat(catId);
  if (records.length === 0) {
    return { currentStreak: 0, longestStreak: 0, hasCheckedToday: false };
  }

  // Get unique dates sorted in descending order
  const dates = [...new Set(records.map(r => r.date))].sort((a, b) => b.localeCompare(a));
  const today = getTodayKey();
  const hasCheckedToday = dates[0] === today;

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  // If not checked today, start from yesterday
  if (!hasCheckedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (const date of dates) {
    const expectedDate = checkDate.toISOString().split('T')[0];
    if (date === expectedDate) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (date < expectedDate) {
      // Gap found, stop counting current streak
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;
  const sortedDates = [...dates].sort((a, b) => a.localeCompare(b));

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak, hasCheckedToday };
};

export const StreakDisplay = ({ catId }: StreakDisplayProps) => {
  const { currentStreak, longestStreak, hasCheckedToday } = calculateStreak(catId);

  if (currentStreak === 0 && longestStreak === 0) {
    return null;
  }

  const isOnFire = currentStreak >= 3;
  const isNewRecord = currentStreak === longestStreak && currentStreak > 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl p-4 shadow-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isOnFire ? 'bg-orange-500/20' : 'bg-primary/20'}`}>
            <Flame className={`w-5 h-5 ${isOnFire ? 'text-orange-500' : 'text-primary'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
              {isOnFire && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-lg"
                >
                  🔥
                </motion.span>
              )}
            </div>
            {isNewRecord && currentStreak > 1 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-orange-500 font-medium"
              >
                New personal best! 🎉
              </motion.p>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Best: {longestStreak} days</span>
          </div>
          {!hasCheckedToday && currentStreak > 0 && (
            <p className="text-xs text-status-warning mt-1">
              Check today to keep it!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
