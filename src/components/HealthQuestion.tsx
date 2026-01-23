import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface HealthQuestionProps {
  question: string;
  icon: React.ReactNode;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const HealthQuestion = ({
  question,
  icon,
  options,
  value,
  onChange,
  questionNumber,
  totalQuestions,
}: HealthQuestionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Question {questionNumber} of {totalQuestions}</span>
      </div>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xl">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-foreground leading-tight pt-2">
          {question}
        </h2>
      </div>

      <div className="grid gap-2 pt-2">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.value)}
            className={cn(
              "w-full p-4 rounded-lg text-left font-medium transition-all duration-200",
              "border-2",
              value === option.value
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
