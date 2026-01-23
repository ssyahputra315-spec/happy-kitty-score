import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { HealthQuestionnaire } from '@/components/HealthQuestionnaire';
import { HealthResult } from '@/components/HealthResult';
import { HealthHistory } from '@/components/HealthHistory';
import { getTodayRecord, HealthRecord } from '@/lib/healthStorage';

type Screen = 'welcome' | 'questionnaire' | 'result' | 'history';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [currentRecord, setCurrentRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    const todayRecord = getTodayRecord();
    if (todayRecord) {
      setCurrentRecord(todayRecord);
      setScreen('result');
    }
  }, []);

  const handleStartQuestionnaire = () => {
    setScreen('questionnaire');
  };

  const handleQuestionnaireComplete = (record: HealthRecord) => {
    setCurrentRecord(record);
    setScreen('result');
  };

  const handleReset = () => {
    setScreen('questionnaire');
  };

  const handleViewHistory = () => {
    setScreen('history');
  };

  const handleBackFromHistory = () => {
    if (currentRecord) {
      setScreen('result');
    } else {
      setScreen('welcome');
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container max-w-md mx-auto px-4 py-8 pb-20">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WelcomeScreen
                onStart={handleStartQuestionnaire}
                onViewHistory={handleViewHistory}
              />
            </motion.div>
          )}

          {screen === 'questionnaire' && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">Daily Health Check</h1>
                <p className="text-sm text-muted-foreground">
                  Answer these quick questions about your cat
                </p>
              </div>
              <HealthQuestionnaire
                onComplete={handleQuestionnaireComplete}
                initialAnswers={currentRecord?.answers}
              />
            </motion.div>
          )}

          {screen === 'result' && currentRecord && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HealthResult
                record={currentRecord}
                onReset={handleReset}
                onViewHistory={handleViewHistory}
              />
            </motion.div>
          )}

          {screen === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HealthHistory onBack={handleBackFromHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
