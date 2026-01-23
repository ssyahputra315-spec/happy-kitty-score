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
  answers: HealthAnswers;
  score: number;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const STORAGE_KEY = 'cat_health_records';

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
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getTodayRecord = (): HealthRecord | null => {
  const records = getAllRecords();
  const today = getTodayKey();
  return records.find(r => r.date === today) || null;
};

export const saveRecord = (answers: HealthAnswers): HealthRecord => {
  const { score, percentage, status } = calculateHealth(answers);
  const today = getTodayKey();
  
  const record: HealthRecord = {
    date: today,
    answers,
    score,
    percentage,
    status,
  };

  const records = getAllRecords().filter(r => r.date !== today);
  records.push(record);
  records.sort((a, b) => b.date.localeCompare(a.date));
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  
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
