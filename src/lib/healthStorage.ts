export interface Cat {
  id: string;
  name: string;
  photo?: string;
  createdAt: string;
}

export interface WeightRecord {
  date: string;
  catId: string;
  weight: number; // in kg or lbs based on user preference
  unit: 'kg' | 'lbs';
}

export interface WeightGoal {
  catId: string;
  minWeight: number;
  maxWeight: number;
  unit: 'kg' | 'lbs';
}

export interface HealthAnswers {
  eating: string;
  water: string;
  pee: string;
  poop: string;
  activity: string;
  mood: string;
  vomiting: string;
  appetite: string;
}

export interface HealthRecord {
  date: string;
  catId: string;
  answers: HealthAnswers;
  score: number;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const CATS_STORAGE_KEY = 'cat_health_cats';
const RECORDS_STORAGE_KEY = 'cat_health_records';
const SELECTED_CAT_KEY = 'cat_health_selected_cat';
const WEIGHT_RECORDS_KEY = 'cat_health_weight_records';
const WEIGHT_UNIT_KEY = 'cat_health_weight_unit';
const WEIGHT_GOALS_KEY = 'cat_health_weight_goals';

// Cat Management
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getAllCats = (): Cat[] => {
  try {
    const data = localStorage.getItem(CATS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getCatById = (id: string): Cat | null => {
  const cats = getAllCats();
  return cats.find(c => c.id === id) || null;
};

export const saveCat = (cat: Omit<Cat, 'id' | 'createdAt'>): Cat => {
  const newCat: Cat = {
    ...cat,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  
  const cats = getAllCats();
  cats.push(newCat);
  localStorage.setItem(CATS_STORAGE_KEY, JSON.stringify(cats));
  
  return newCat;
};

export const updateCat = (id: string, updates: Partial<Omit<Cat, 'id' | 'createdAt'>>): Cat | null => {
  const cats = getAllCats();
  const index = cats.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  cats[index] = { ...cats[index], ...updates };
  localStorage.setItem(CATS_STORAGE_KEY, JSON.stringify(cats));
  
  return cats[index];
};

export const deleteCat = (id: string): void => {
  const cats = getAllCats().filter(c => c.id !== id);
  localStorage.setItem(CATS_STORAGE_KEY, JSON.stringify(cats));
  
  // Also delete all health records for this cat
  const records = getAllRecords().filter(r => r.catId !== id);
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  
  // Clear selected cat if it was deleted
  if (getSelectedCatId() === id) {
    localStorage.removeItem(SELECTED_CAT_KEY);
  }
};

export const getSelectedCatId = (): string | null => {
  return localStorage.getItem(SELECTED_CAT_KEY);
};

export const setSelectedCatId = (id: string): void => {
  localStorage.setItem(SELECTED_CAT_KEY, id);
};

// Health Score Logic
export const getScoreForAnswer = (question: keyof HealthAnswers, answer: string): number => {
  const scoreMap: Record<keyof HealthAnswers, Record<string, number>> = {
    eating: {
      '0': 0,
      '1': 5,
      '2-3': 10,
      '4+': 8,
    },
    water: {
      'very-little': 3,
      'normal': 10,
      'a-lot': 7,
    },
    pee: {
      '0-1': 5,
      '2-4': 10,
      '5+': 6,
    },
    poop: {
      'normal': 10,
      'soft': 6,
      'diarrhea': 2,
      'no-poop': 4,
    },
    activity: {
      'very-active': 10,
      'normal': 10,
      'lazy': 5,
      'hiding': 2,
    },
    mood: {
      'playful': 10,
      'normal': 10,
      'aggressive': 4,
      'depressed': 2,
    },
    vomiting: {
      'no': 10,
      'once': 5,
      'more-than-once': 1,
    },
    appetite: {
      'normal': 10,
      'less-than-usual': 5,
      'refusing-food': 1,
    },
  };

  return scoreMap[question][answer] ?? 0;
};

export const calculateHealth = (answers: HealthAnswers): { score: number; percentage: number; status: HealthRecord['status'] } => {
  const totalScore = Object.entries(answers).reduce((sum, [question, answer]) => {
    return sum + getScoreForAnswer(question as keyof HealthAnswers, answer);
  }, 0);

  const percentage = Math.round((totalScore / 80) * 100);
  
  let status: HealthRecord['status'];
  if (percentage >= 85) status = 'excellent';
  else if (percentage >= 65) status = 'good';
  else if (percentage >= 40) status = 'warning';
  else status = 'critical';

  return { score: totalScore, percentage, status };
};

export const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getAllRecords = (): HealthRecord[] => {
  try {
    const data = localStorage.getItem(RECORDS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getRecordsForCat = (catId: string): HealthRecord[] => {
  return getAllRecords()
    .filter(r => r.catId === catId)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getTodayRecordForCat = (catId: string): HealthRecord | null => {
  const records = getRecordsForCat(catId);
  const today = getTodayKey();
  return records.find(r => r.date === today) || null;
};

export const saveRecord = (catId: string, answers: HealthAnswers): HealthRecord => {
  const { score, percentage, status } = calculateHealth(answers);
  const today = getTodayKey();
  
  const record: HealthRecord = {
    date: today,
    catId,
    answers,
    score,
    percentage,
    status,
  };

  const records = getAllRecords().filter(r => !(r.date === today && r.catId === catId));
  records.push(record);
  records.sort((a, b) => b.date.localeCompare(a.date));
  
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  
  return record;
};

export const getStatusInfo = (status: HealthRecord['status']) => {
  const info = {
    excellent: {
      label: 'Excellent',
      message: 'Your cat is healthy and happy! 🎉',
      emoji: '😺',
      color: 'status-excellent',
    },
    good: {
      label: 'Good',
      message: 'Mostly healthy, keep monitoring.',
      emoji: '😸',
      color: 'status-good',
    },
    warning: {
      label: 'Warning',
      message: 'Possible health issues. Pay attention.',
      emoji: '😿',
      color: 'status-warning',
    },
    critical: {
      label: 'Critical',
      message: 'High risk. Please consult a veterinarian.',
      emoji: '🙀',
      color: 'status-critical',
    },
  };
  return info[status];
};

// Weight Management
export const getPreferredWeightUnit = (): 'kg' | 'lbs' => {
  return (localStorage.getItem(WEIGHT_UNIT_KEY) as 'kg' | 'lbs') || 'kg';
};

export const setPreferredWeightUnit = (unit: 'kg' | 'lbs'): void => {
  localStorage.setItem(WEIGHT_UNIT_KEY, unit);
};

export const getAllWeightRecords = (): WeightRecord[] => {
  try {
    const data = localStorage.getItem(WEIGHT_RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getWeightRecordsForCat = (catId: string): WeightRecord[] => {
  return getAllWeightRecords()
    .filter(r => r.catId === catId)
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getLatestWeightForCat = (catId: string): WeightRecord | null => {
  const records = getWeightRecordsForCat(catId);
  return records.length > 0 ? records[0] : null;
};

export const saveWeightRecord = (catId: string, weight: number, unit: 'kg' | 'lbs'): WeightRecord => {
  const today = getTodayKey();
  
  const record: WeightRecord = {
    date: today,
    catId,
    weight,
    unit,
  };

  // Remove existing record for today if any, then add new one
  const records = getAllWeightRecords().filter(r => !(r.date === today && r.catId === catId));
  records.push(record);
  records.sort((a, b) => b.date.localeCompare(a.date));
  
  localStorage.setItem(WEIGHT_RECORDS_KEY, JSON.stringify(records));
  setPreferredWeightUnit(unit);
  
  return record;
};

export const deleteWeightRecord = (catId: string, date: string): void => {
  const records = getAllWeightRecords().filter(r => !(r.date === date && r.catId === catId));
  localStorage.setItem(WEIGHT_RECORDS_KEY, JSON.stringify(records));
};

export const convertWeight = (weight: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number => {
  if (from === to) return weight;
  if (from === 'kg' && to === 'lbs') return Math.round(weight * 2.20462 * 10) / 10;
  return Math.round(weight / 2.20462 * 10) / 10;
};

// Weight Goals
export const getAllWeightGoals = (): WeightGoal[] => {
  try {
    const data = localStorage.getItem(WEIGHT_GOALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getWeightGoalForCat = (catId: string): WeightGoal | null => {
  const goals = getAllWeightGoals();
  return goals.find(g => g.catId === catId) || null;
};

export const saveWeightGoal = (catId: string, minWeight: number, maxWeight: number, unit: 'kg' | 'lbs'): WeightGoal => {
  const goal: WeightGoal = { catId, minWeight, maxWeight, unit };
  
  const goals = getAllWeightGoals().filter(g => g.catId !== catId);
  goals.push(goal);
  localStorage.setItem(WEIGHT_GOALS_KEY, JSON.stringify(goals));
  
  return goal;
};

export const deleteWeightGoal = (catId: string): void => {
  const goals = getAllWeightGoals().filter(g => g.catId !== catId);
  localStorage.setItem(WEIGHT_GOALS_KEY, JSON.stringify(goals));
};

export type WeightStatus = 'in-range' | 'underweight' | 'overweight' | 'no-goal' | 'no-weight';

export const getWeightStatus = (catId: string): { status: WeightStatus; currentWeight?: number; goal?: WeightGoal; deviation?: number } => {
  const goal = getWeightGoalForCat(catId);
  const latestWeight = getLatestWeightForCat(catId);
  
  if (!goal) return { status: 'no-goal' };
  if (!latestWeight) return { status: 'no-weight', goal };
  
  const preferredUnit = getPreferredWeightUnit();
  const currentWeight = convertWeight(latestWeight.weight, latestWeight.unit, preferredUnit);
  const minWeight = convertWeight(goal.minWeight, goal.unit, preferredUnit);
  const maxWeight = convertWeight(goal.maxWeight, goal.unit, preferredUnit);
  
  if (currentWeight < minWeight) {
    const deviation = Math.round((minWeight - currentWeight) * 10) / 10;
    return { status: 'underweight', currentWeight, goal, deviation };
  }
  if (currentWeight > maxWeight) {
    const deviation = Math.round((currentWeight - maxWeight) * 10) / 10;
    return { status: 'overweight', currentWeight, goal, deviation };
  }
  
  return { status: 'in-range', currentWeight, goal };
};
