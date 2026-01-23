import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthQuestion } from './HealthQuestion';
import { ProgressBar } from './ProgressBar';
import { Button } from '@/components/ui/button';
import { HealthAnswers, saveRecord, HealthRecord } from '@/lib/healthStorage';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface HealthQuestionnaireProps {
  onComplete: (record: HealthRecord) => void;
  initialAnswers?: HealthAnswers;
}

const questions = [
  {
    key: 'eating' as const,
    question: 'How many times did your cat eat today?',
    icon: '🍽️',
    options: [
      { value: '0', label: "Didn't eat at all" },
      { value: '1', label: 'Once' },
      { value: '2-3', label: '2-3 times (normal)' },
      { value: '4+', label: '4+ times' },
    ],
  },
  {
    key: 'water' as const,
    question: 'How was the water intake today?',
    icon: '💧',
    options: [
      { value: 'very-little', label: 'Very little' },
      { value: 'normal', label: 'Normal amount' },
      { value: 'a-lot', label: 'More than usual' },
    ],
  },
  {
    key: 'pee' as const,
    question: 'How many times did your cat pee today?',
    icon: '🚿',
    options: [
      { value: '0-1', label: '0-1 times' },
      { value: '2-4', label: '2-4 times (normal)' },
      { value: '5+', label: '5+ times' },
    ],
  },
  {
    key: 'poop' as const,
    question: 'How was the poop condition today?',
    icon: '💩',
    options: [
      { value: 'normal', label: 'Normal & healthy' },
      { value: 'soft', label: 'Soft' },
      { value: 'diarrhea', label: 'Diarrhea' },
      { value: 'no-poop', label: "Didn't poop today" },
    ],
  },
  {
    key: 'activity' as const,
    question: "What was your cat's activity level?",
    icon: '🏃',
    options: [
      { value: 'very-active', label: 'Very active & playful' },
      { value: 'normal', label: 'Normal activity' },
      { value: 'lazy', label: 'Lazy, sleeping more' },
      { value: 'hiding', label: 'Hiding or unusual behavior' },
    ],
  },
  {
    key: 'mood' as const,
    question: "How was your cat's mood today?",
    icon: '😺',
    options: [
      { value: 'playful', label: 'Playful & happy' },
      { value: 'normal', label: 'Normal' },
      { value: 'aggressive', label: 'Aggressive or irritable' },
      { value: 'depressed', label: 'Depressed or withdrawn' },
    ],
  },
  {
    key: 'vomiting' as const,
    question: 'Any vomiting today?',
    icon: '🤢',
    options: [
      { value: 'no', label: 'No vomiting' },
      { value: 'once', label: 'Once' },
      { value: 'more-than-once', label: 'More than once' },
    ],
  },
  {
    key: 'appetite' as const,
    question: 'How was the appetite compared to usual?',
    icon: '😋',
    options: [
      { value: 'normal', label: 'Normal appetite' },
      { value: 'less-than-usual', label: 'Less than usual' },
      { value: 'refusing-food', label: 'Refusing food' },
    ],
  },
];

const defaultAnswers: HealthAnswers = {
  eating: '',
  water: '',
  pee: '',
  poop: '',
  activity: '',
  mood: '',
  vomiting: '',
  appetite: '',
};

export const HealthQuestionnaire = ({ onComplete, initialAnswers }: HealthQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<HealthAnswers>(initialAnswers || defaultAnswers);
  const [direction, setDirection] = useState(0);

  const currentQuestion = questions[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion.key] !== '';
  
  const answeredCount = Object.values(answers).filter(v => v !== '').length;

  const handleNext = () => {
    if (isLastStep) {
      const record = saveRecord(answers);
      onComplete(record);
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <ProgressBar current={answeredCount} total={questions.length} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
          transition={{ duration: 0.2 }}
        >
          <HealthQuestion
            question={currentQuestion.question}
            icon={currentQuestion.icon}
            options={currentQuestion.options}
            value={answers[currentQuestion.key]}
            onChange={handleAnswerChange}
            questionNumber={currentStep + 1}
            totalQuestions={questions.length}
          />
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 shadow-button"
        >
          {isLastStep ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Submit
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
