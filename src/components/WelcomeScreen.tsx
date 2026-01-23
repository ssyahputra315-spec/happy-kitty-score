import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, History } from 'lucide-react';
import { getAllRecords } from '@/lib/healthStorage';

interface WelcomeScreenProps {
  onStart: () => void;
  onViewHistory: () => void;
}

export const WelcomeScreen = ({ onStart, onViewHistory }: WelcomeScreenProps) => {
  const records = getAllRecords();
  const hasHistory = records.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="text-8xl mb-6"
      >
        🐱
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-foreground mb-3"
      >
        Cat Health Tracker
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-8 max-w-xs"
      >
        Track your cat's daily health with a quick check-up. 
        Get insights and keep your furry friend happy!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <Button 
          size="lg" 
          onClick={onStart}
          className="shadow-button text-lg py-6"
        >
          <ClipboardCheck className="w-5 h-5 mr-2" />
          Start Daily Check
        </Button>

        {hasHistory && (
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onViewHistory}
            className="text-lg py-6"
          >
            <History className="w-5 h-5 mr-2" />
            View History ({records.length})
          </Button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 flex items-center gap-2"
      >
        <div className="flex -space-x-1">
          <span className="text-lg">🩺</span>
          <span className="text-lg">💊</span>
          <span className="text-lg">❤️</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Quick & easy health tracking
        </span>
      </motion.div>
    </motion.div>
  );
};
