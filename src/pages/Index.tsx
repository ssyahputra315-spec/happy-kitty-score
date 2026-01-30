import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CatSelector } from '@/components/CatSelector';
import { CatProfile } from '@/components/CatProfile';
import { EditCatProfile } from '@/components/EditCatProfile';
import { CatDashboard } from '@/components/CatDashboard';
import { WeightGoalSetter } from '@/components/WeightGoalSetter';
import { HealthQuestionnaire } from '@/components/HealthQuestionnaire';
import { HealthResult } from '@/components/HealthResult';
import { HealthHistory } from '@/components/HealthHistory';
import { WeightLogger } from '@/components/WeightLogger';
import { 
  Cat, 
  HealthRecord, 
  getAllCats, 
  getTodayRecordForCat,
  getSelectedCatId,
  setSelectedCatId 
} from '@/lib/healthStorage';

type Screen = 
  | 'cat-selector' 
  | 'add-cat' 
  | 'edit-cat' 
  | 'cat-dashboard'
  | 'questionnaire' 
  | 'result' 
  | 'history'
  | 'weight-logger'
  | 'weight-goal';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('cat-selector');
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  const [currentRecord, setCurrentRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = () => {
    const allCats = getAllCats();
    setCats(allCats);
    
    // Auto-select last used cat
    const lastCatId = getSelectedCatId();
    if (lastCatId && allCats.length > 0) {
      const lastCat = allCats.find(c => c.id === lastCatId);
      if (lastCat) {
        handleSelectCat(lastCat);
      }
    }
  };

  const handleSelectCat = (cat: Cat) => {
    setSelectedCat(cat);
    setSelectedCatId(cat.id);
    
    const todayRecord = getTodayRecordForCat(cat.id);
    if (todayRecord) {
      setCurrentRecord(todayRecord);
      setScreen('result');
    } else {
      setScreen('cat-dashboard');
    }
  };

  const handleAddCat = () => {
    setScreen('add-cat');
  };

  const handleEditCat = (cat: Cat) => {
    setEditingCat(cat);
    setScreen('edit-cat');
  };

  const handleCatSaved = (cat: Cat) => {
    loadCats();
    if (screen === 'add-cat') {
      handleSelectCat(cat);
    } else {
      setScreen('cat-selector');
    }
    setEditingCat(null);
  };

  const handleCatDeleted = () => {
    loadCats();
    setSelectedCat(null);
    setCurrentRecord(null);
    setEditingCat(null);
    setScreen('cat-selector');
  };

  const handleStartCheck = () => {
    setScreen('questionnaire');
  };

  const handleLogWeight = () => {
    setScreen('weight-logger');
  };

  const handleSetWeightGoal = () => {
    setScreen('weight-goal');
  };

  const handleWeightSaved = () => {
    setScreen('cat-dashboard');
  };

  const handleWeightGoalSaved = () => {
    setScreen('cat-dashboard');
  };

  const handleQuestionnaireComplete = (record: HealthRecord) => {
    setCurrentRecord(record);
    setScreen('result');
  };

  const handleBackToCats = () => {
    setSelectedCat(null);
    setCurrentRecord(null);
    setScreen('cat-selector');
  };

  const handleBackToDashboard = () => {
    if (currentRecord) {
      setScreen('result');
    } else {
      setScreen('cat-dashboard');
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container max-w-md mx-auto px-4 py-8 pb-20">
        <AnimatePresence mode="wait">
          {screen === 'cat-selector' && (
            <motion.div
              key="cat-selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CatSelector
                cats={cats}
                onSelectCat={handleSelectCat}
                onAddCat={handleAddCat}
                onEditCat={handleEditCat}
              />
            </motion.div>
          )}

          {screen === 'add-cat' && (
            <motion.div
              key="add-cat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CatProfile
                onSave={handleCatSaved}
                onCancel={() => setScreen('cat-selector')}
              />
            </motion.div>
          )}

          {screen === 'edit-cat' && editingCat && (
            <motion.div
              key="edit-cat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EditCatProfile
                cat={editingCat}
                onSave={handleCatSaved}
                onDelete={handleCatDeleted}
                onCancel={() => setScreen('cat-selector')}
              />
            </motion.div>
          )}

          {screen === 'cat-dashboard' && selectedCat && (
            <motion.div
              key="cat-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CatDashboard
                cat={selectedCat}
                onStartCheck={handleStartCheck}
                onViewHistory={() => setScreen('history')}
                onLogWeight={handleLogWeight}
                onSetWeightGoal={handleSetWeightGoal}
                onBack={handleBackToCats}
              />
            </motion.div>
          )}

          {screen === 'weight-logger' && selectedCat && (
            <motion.div
              key="weight-logger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WeightLogger
                cat={selectedCat}
                onSave={handleWeightSaved}
                onCancel={handleBackToDashboard}
              />
            </motion.div>
          )}

          {screen === 'weight-goal' && selectedCat && (
            <motion.div
              key="weight-goal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <WeightGoalSetter
                cat={selectedCat}
                onSave={handleWeightGoalSaved}
                onCancel={handleBackToDashboard}
              />
            </motion.div>
          )}

          {screen === 'questionnaire' && selectedCat && (
            <motion.div
              key="questionnaire"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HealthQuestionnaire
                cat={selectedCat}
                onComplete={handleQuestionnaireComplete}
                onCancel={handleBackToDashboard}
                initialAnswers={currentRecord?.answers}
              />
            </motion.div>
          )}

          {screen === 'result' && currentRecord && selectedCat && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HealthResult
                record={currentRecord}
                cat={selectedCat}
                onReset={handleStartCheck}
                onViewHistory={() => setScreen('history')}
                onBack={handleBackToCats}
              />
            </motion.div>
          )}

          {screen === 'history' && selectedCat && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <HealthHistory
                cat={selectedCat}
                onBack={handleBackToDashboard}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
