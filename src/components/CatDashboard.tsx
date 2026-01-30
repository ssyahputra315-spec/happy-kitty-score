import { motion } from 'framer-motion';
import { 
  Cat, 
  getTodayRecordForCat, 
  getRecordsForCat, 
  getStatusInfo,
  getLatestWeightForCat,
  getPreferredWeightUnit,
  convertWeight,
  getWeightGoalForCat
} from '@/lib/healthStorage';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, History, ArrowLeft, Scale, Target, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeightAlert, WeightStatusBadge } from './WeightAlert';

interface CatDashboardProps {
  cat: Cat;
  onStartCheck: () => void;
  onViewHistory: () => void;
  onLogWeight: () => void;
  onSetWeightGoal: () => void;
  onBack: () => void;
}

export const CatDashboard = ({ cat, onStartCheck, onViewHistory, onLogWeight, onSetWeightGoal, onBack }: CatDashboardProps) => {
  const todayRecord = getTodayRecordForCat(cat.id);
  const allRecords = getRecordsForCat(cat.id);
  const hasCheckedToday = !!todayRecord;
  
  const latestWeight = getLatestWeightForCat(cat.id);
  const preferredUnit = getPreferredWeightUnit();
  const displayWeight = latestWeight 
    ? convertWeight(latestWeight.weight, latestWeight.unit, preferredUnit)
    : null;
  const hasWeightGoal = !!getWeightGoalForCat(cat.id);

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-status-excellent';
      case 'good': return 'text-status-good';
      case 'warning': return 'text-status-warning';
      case 'critical': return 'text-status-critical';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Back to Cats</h1>
      </div>

      {/* Daily Reminder Banner */}
      {!hasCheckedToday && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/30 rounded-xl p-4 cursor-pointer hover:bg-primary/15 transition-colors"
          onClick={onStartCheck}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Time for today's check! 🐱</p>
              <p className="text-sm text-muted-foreground">
                Tap here to complete {cat.name}'s daily health assessment
              </p>
            </div>
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
        </motion.div>
      )}

      {/* Cat Profile Card */}
      <div className="bg-card rounded-2xl p-6 shadow-card text-center">
        <div className="w-24 h-24 rounded-full bg-secondary mx-auto overflow-hidden flex items-center justify-center text-5xl mb-4">
          {cat.photo ? (
            <img 
              src={cat.photo} 
              alt={cat.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            '🐱'
          )}
        </div>
        <h2 className="text-2xl font-bold text-foreground">{cat.name}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {allRecords.length} health record{allRecords.length !== 1 ? 's' : ''}
        </p>

        {/* Today's Status */}
        {hasCheckedToday && todayRecord && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-accent/50 rounded-xl"
          >
            <p className="text-sm text-muted-foreground">Today's Score</p>
            <p className={cn("text-3xl font-bold", getStatusColorClass(todayRecord.status))}>
              {todayRecord.percentage}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {getStatusInfo(todayRecord.status).label}
            </p>
          </motion.div>
        )}
      </div>

      {/* Weight Alert */}
      <WeightAlert cat={cat} />

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button 
          size="lg" 
          onClick={onStartCheck}
          className="shadow-button text-lg py-6"
        >
          <ClipboardCheck className="w-5 h-5 mr-2" />
          {hasCheckedToday ? "Update Today's Check" : 'Start Daily Check'}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onLogWeight}
            className="py-6"
          >
            <Scale className="w-5 h-5 mr-2" />
            Log Weight
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onSetWeightGoal}
            className="py-6"
          >
            <Target className="w-5 h-5 mr-2" />
            {hasWeightGoal ? 'Edit Goal' : 'Set Goal'}
          </Button>
        </div>

        {allRecords.length > 0 && (
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onViewHistory}
            className="w-full py-6"
          >
            <History className="w-5 h-5 mr-2" />
            View History
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      {(allRecords.length > 0 || displayWeight) && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-foreground">{allRecords.length}</p>
            <p className="text-xs text-muted-foreground">Total Checks</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <p className="text-2xl font-bold text-foreground">
              {allRecords.length > 0 
                ? `${Math.round(allRecords.reduce((sum, r) => sum + r.percentage, 0) / allRecords.length)}%`
                : '-'
              }
            </p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center shadow-card">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Scale className="w-4 h-4 text-status-good" />
                <p className="text-2xl font-bold text-foreground">
                  {displayWeight ?? '-'}
                </p>
              </div>
              <WeightStatusBadge cat={cat} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {displayWeight ? preferredUnit : 'Weight'}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
