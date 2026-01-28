import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { HealthTip, getUrgencyBgColor, getUrgencyColor } from '@/lib/healthTips';
import { cn } from '@/lib/utils';

interface HealthTipsProps {
  tips: HealthTip[];
}

export const HealthTips = ({ tips }: HealthTipsProps) => {
  if (tips.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 bg-status-excellent/10 border border-status-excellent/30 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-status-excellent/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-status-excellent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">All Looking Great!</h3>
            <p className="text-sm text-muted-foreground">
              No health concerns detected. Keep up the great care!
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const getUrgencyIcon = (urgency: HealthTip['urgency']) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'low': return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getUrgencyLabel = (urgency: HealthTip['urgency']) => {
    switch (urgency) {
      case 'high': return 'High Priority';
      case 'medium': return 'Monitor';
      case 'low': return 'Tip';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Health Tips</h3>
      </div>

      <div className="space-y-3">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.category}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className={cn(
              "p-4 rounded-xl border",
              getUrgencyBgColor(tip.urgency)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{tip.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-foreground">{tip.title}</h4>
                  <span className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                    getUrgencyColor(tip.urgency),
                    tip.urgency === 'high' && 'bg-status-critical/20',
                    tip.urgency === 'medium' && 'bg-status-warning/20',
                    tip.urgency === 'low' && 'bg-status-good/20'
                  )}>
                    {getUrgencyIcon(tip.urgency)}
                    {getUrgencyLabel(tip.urgency)}
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {tip.tips.map((tipText, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{tipText}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
