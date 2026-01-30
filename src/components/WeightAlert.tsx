import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Target } from 'lucide-react';
import { 
  Cat, 
  getWeightStatus, 
  getPreferredWeightUnit,
  convertWeight
} from '@/lib/healthStorage';
import { cn } from '@/lib/utils';

interface WeightAlertProps {
  cat: Cat;
  onSetGoal?: () => void;
}

export const WeightAlert = ({ cat, onSetGoal }: WeightAlertProps) => {
  const weightStatus = getWeightStatus(cat.id);
  const preferredUnit = getPreferredWeightUnit();

  if (weightStatus.status === 'no-goal' || weightStatus.status === 'no-weight') {
    return null;
  }

  const { status, currentWeight, goal, deviation } = weightStatus;

  if (status === 'in-range') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-status-excellent/10 border border-status-excellent/30 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-status-excellent/20">
            <CheckCircle className="w-5 h-5 text-status-excellent" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">Weight on track! ✨</p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentWeight} {preferredUnit} is within the healthy range of {convertWeight(goal!.minWeight, goal!.unit, preferredUnit)} - {convertWeight(goal!.maxWeight, goal!.unit, preferredUnit)} {preferredUnit}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const isUnderweight = status === 'underweight';
  const alertColor = isUnderweight ? 'status-warning' : 'status-critical';
  const Icon = isUnderweight ? TrendingDown : TrendingUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl p-4 border",
        isUnderweight 
          ? "bg-status-warning/10 border-status-warning/30" 
          : "bg-status-critical/10 border-status-critical/30"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-full",
          isUnderweight ? "bg-status-warning/20" : "bg-status-critical/20"
        )}>
          <Icon className={cn("w-5 h-5", `text-${alertColor}`)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn("w-4 h-4", `text-${alertColor}`)} />
            <p className="font-medium text-foreground">
              {isUnderweight ? 'Underweight Alert' : 'Overweight Alert'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {cat.name} is <strong>{deviation} {preferredUnit}</strong> {isUnderweight ? 'below' : 'above'} the healthy range.
            Current: {currentWeight} {preferredUnit} | Target: {convertWeight(goal!.minWeight, goal!.unit, preferredUnit)} - {convertWeight(goal!.maxWeight, goal!.unit, preferredUnit)} {preferredUnit}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {isUnderweight 
              ? '💡 Consider consulting your vet if weight loss continues.' 
              : '💡 Monitor food intake and consider more playtime.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Compact version for dashboard
export const WeightStatusBadge = ({ cat }: { cat: Cat }) => {
  const weightStatus = getWeightStatus(cat.id);
  
  if (weightStatus.status === 'no-goal' || weightStatus.status === 'no-weight') {
    return null;
  }

  const { status } = weightStatus;

  if (status === 'in-range') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-status-excellent/20 text-status-excellent">
        <CheckCircle className="w-3 h-3" />
        Healthy
      </span>
    );
  }

  const isUnderweight = status === 'underweight';

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
      isUnderweight 
        ? "bg-status-warning/20 text-status-warning" 
        : "bg-status-critical/20 text-status-critical"
    )}>
      {isUnderweight ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
      {isUnderweight ? 'Under' : 'Over'}
    </span>
  );
};
