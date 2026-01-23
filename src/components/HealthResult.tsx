import { motion } from 'framer-motion';
import { HealthRecord, getStatusInfo } from '@/lib/healthStorage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCcw, History } from 'lucide-react';

interface HealthResultProps {
  record: HealthRecord;
  onReset: () => void;
  onViewHistory: () => void;
}

export const HealthResult = ({ record, onReset, onViewHistory }: HealthResultProps) => {
  const statusInfo = getStatusInfo(record.status);
  
  const getStatusColorClass = () => {
    switch (record.status) {
      case 'excellent': return 'text-status-excellent';
      case 'good': return 'text-status-good';
      case 'warning': return 'text-status-warning';
      case 'critical': return 'text-status-critical';
    }
  };

  const getStatusBgClass = () => {
    switch (record.status) {
      case 'excellent': return 'bg-status-excellent';
      case 'good': return 'bg-status-good';
      case 'warning': return 'bg-status-warning';
      case 'critical': return 'bg-status-critical';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl"
        >
          {statusInfo.emoji}
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Today's Health Check</h2>
        <p className="text-muted-foreground">
          {new Date(record.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-secondary"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className={getStatusColorClass()}
              strokeDasharray={2 * Math.PI * 80}
              initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 80 * (1 - record.percentage / 100) 
              }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={cn("text-4xl font-bold", getStatusColorClass())}
            >
              {record.percentage}%
            </motion.span>
            <span className="text-sm text-muted-foreground">Health Score</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <span className={cn(
          "inline-block px-4 py-2 rounded-full text-white font-semibold",
          getStatusBgClass()
        )}>
          {statusInfo.label}
        </span>
        <p className="mt-3 text-foreground font-medium">
          {statusInfo.message}
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col gap-3 pt-4"
      >
        <Button 
          onClick={onReset}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Update Today's Entry
        </Button>
        <Button 
          onClick={onViewHistory}
          size="lg"
          className="w-full shadow-button"
        >
          <History className="w-4 h-4 mr-2" />
          View History
        </Button>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-secondary/50 rounded-lg"
      >
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ This app does not replace professional veterinary care. If your cat shows 
          severe or persistent symptoms, please consult a licensed veterinarian.
        </p>
      </motion.div>
    </motion.div>
  );
};
