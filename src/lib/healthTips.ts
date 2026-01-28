import { HealthAnswers, getScoreForAnswer } from './healthStorage';

export interface HealthTip {
  category: string;
  icon: string;
  title: string;
  tips: string[];
  urgency: 'low' | 'medium' | 'high';
}

const tipsByCategory: Record<keyof HealthAnswers, Record<string, HealthTip>> = {
  eating: {
    '0': {
      category: 'eating',
      icon: '🍽️',
      title: 'No Eating Today',
      tips: [
        'Try warming up their food slightly to enhance aroma',
        'Offer a different protein source (chicken, fish, beef)',
        'Check if food is fresh and hasn\'t spoiled',
        'If this continues for 24+ hours, consult your vet',
      ],
      urgency: 'high',
    },
    '1': {
      category: 'eating',
      icon: '🍽️',
      title: 'Reduced Appetite',
      tips: [
        'Monitor for any other symptoms like lethargy',
        'Try adding a small amount of wet food or broth',
        'Ensure the feeding area is quiet and stress-free',
        'Consider if there have been recent changes in routine',
      ],
      urgency: 'medium',
    },
    '4+': {
      category: 'eating',
      icon: '🍽️',
      title: 'Excessive Eating',
      tips: [
        'Consider portion control with measured meals',
        'Rule out conditions like hyperthyroidism or diabetes',
        'Use puzzle feeders to slow down eating',
        'Ensure they\'re not eating out of boredom',
      ],
      urgency: 'low',
    },
  },
  water: {
    'very-little': {
      category: 'water',
      icon: '💧',
      title: 'Low Water Intake',
      tips: [
        'Try a cat water fountain - many cats prefer running water',
        'Place multiple water bowls around the house',
        'Add water or broth to wet food',
        'Ensure water is fresh and bowls are clean',
      ],
      urgency: 'medium',
    },
    'a-lot': {
      category: 'water',
      icon: '💧',
      title: 'Increased Thirst',
      tips: [
        'Excessive thirst can indicate kidney issues or diabetes',
        'Monitor how often your cat visits the water bowl',
        'Check if the environment is unusually warm',
        'Consider a vet visit if this persists for several days',
      ],
      urgency: 'medium',
    },
  },
  pee: {
    '0-1': {
      category: 'pee',
      icon: '🚽',
      title: 'Low Urination',
      tips: [
        'Ensure your cat has access to clean litter boxes',
        'Watch for signs of straining or discomfort',
        'Encourage water intake with fountains or wet food',
        'Urinary blockage is an emergency - contact vet if no urination in 24h',
      ],
      urgency: 'high',
    },
    '5+': {
      category: 'pee',
      icon: '🚽',
      title: 'Frequent Urination',
      tips: [
        'Could indicate urinary tract infection or diabetes',
        'Check if urine appears normal in color',
        'Note any signs of straining or blood',
        'Schedule a vet appointment for urinalysis',
      ],
      urgency: 'medium',
    },
  },
  poop: {
    'soft': {
      category: 'poop',
      icon: '💩',
      title: 'Soft Stool',
      tips: [
        'Temporarily switch to a bland diet (boiled chicken)',
        'Add a small amount of pumpkin puree to food',
        'Ensure food hasn\'t been changed recently',
        'Probiotics may help restore gut balance',
      ],
      urgency: 'low',
    },
    'diarrhea': {
      category: 'poop',
      icon: '💩',
      title: 'Diarrhea',
      tips: [
        'Withhold food for 12 hours, then offer bland diet',
        'Keep your cat hydrated - offer water frequently',
        'Watch for blood or mucus in stool',
        'If diarrhea persists 24+ hours, see a vet',
      ],
      urgency: 'high',
    },
    'no-poop': {
      category: 'poop',
      icon: '💩',
      title: 'Constipation',
      tips: [
        'Increase water intake with wet food or fountains',
        'Add a teaspoon of pumpkin puree to meals',
        'Ensure adequate exercise and play',
        'Hairball remedies may help if fur ingestion is suspected',
      ],
      urgency: 'medium',
    },
  },
  activity: {
    'lazy': {
      category: 'activity',
      icon: '🏃',
      title: 'Low Activity',
      tips: [
        'Introduce new interactive toys to spark interest',
        'Schedule regular play sessions (15 mins, 2x daily)',
        'Create vertical spaces for climbing',
        'Rule out pain or illness if lethargy is sudden',
      ],
      urgency: 'low',
    },
    'hiding': {
      category: 'activity',
      icon: '🏃',
      title: 'Hiding Behavior',
      tips: [
        'Check for new stressors in the environment',
        'Provide safe hiding spots where they feel secure',
        'Look for signs of pain or illness',
        'Sudden hiding often indicates something is wrong - monitor closely',
      ],
      urgency: 'high',
    },
  },
  mood: {
    'aggressive': {
      category: 'mood',
      icon: '😸',
      title: 'Aggressive Behavior',
      tips: [
        'Identify and remove potential stress triggers',
        'Ensure they have their own safe space',
        'Never punish - redirect behavior with toys',
        'Consider Feliway or calming supplements',
      ],
      urgency: 'medium',
    },
    'depressed': {
      category: 'mood',
      icon: '😸',
      title: 'Depressed Mood',
      tips: [
        'Spend extra quality time with your cat',
        'Introduce new enrichment activities',
        'Check for any recent changes that may have caused stress',
        'Depression can indicate underlying health issues',
      ],
      urgency: 'high',
    },
  },
  vomiting: {
    'once': {
      category: 'vomiting',
      icon: '🤢',
      title: 'Occasional Vomiting',
      tips: [
        'Monitor for additional episodes',
        'Check if they ate too quickly - try a slow feeder',
        'Hairballs are common - consider hairball remedies',
        'Note what was eaten before vomiting',
      ],
      urgency: 'low',
    },
    'more-than-once': {
      category: 'vomiting',
      icon: '🤢',
      title: 'Frequent Vomiting',
      tips: [
        'Withhold food for a few hours, then offer small amounts',
        'Check for potential toxins or foreign objects ingested',
        'Monitor for blood in vomit',
        'Multiple vomiting episodes require vet attention',
      ],
      urgency: 'high',
    },
  },
  appetite: {
    'less-than-usual': {
      category: 'appetite',
      icon: '😋',
      title: 'Decreased Appetite',
      tips: [
        'Try different food temperatures and textures',
        'Check for dental issues - pain can reduce appetite',
        'Ensure food bowls are clean and in a quiet location',
        'Stress or changes can temporarily reduce appetite',
      ],
      urgency: 'medium',
    },
    'refusing-food': {
      category: 'appetite',
      icon: '😋',
      title: 'Refusing Food',
      tips: [
        'Cats refusing food for 24+ hours need vet attention',
        'Try highly palatable foods like tuna or baby food (meat only)',
        'Check for mouth sores or dental pain',
        'This is often a sign of illness - don\'t wait too long',
      ],
      urgency: 'high',
    },
  },
};

export const getHealthTips = (answers: HealthAnswers): HealthTip[] => {
  const tips: HealthTip[] = [];
  
  // Get scores for each category and find problematic ones
  const categoryScores: { category: keyof HealthAnswers; score: number; answer: string }[] = [];
  
  for (const [category, answer] of Object.entries(answers)) {
    const score = getScoreForAnswer(category as keyof HealthAnswers, answer);
    categoryScores.push({ category: category as keyof HealthAnswers, score, answer });
  }
  
  // Sort by score (lowest first) and get categories with issues
  categoryScores.sort((a, b) => a.score - b.score);
  
  // Get tips for categories with less than perfect scores
  for (const { category, score, answer } of categoryScores) {
    if (score < 10) {
      const categoryTips = tipsByCategory[category];
      if (categoryTips && categoryTips[answer]) {
        tips.push(categoryTips[answer]);
      }
    }
    // Limit to top 3 most concerning categories
    if (tips.length >= 3) break;
  }
  
  return tips;
};

export const getUrgencyColor = (urgency: HealthTip['urgency']): string => {
  switch (urgency) {
    case 'high': return 'text-status-critical';
    case 'medium': return 'text-status-warning';
    case 'low': return 'text-status-good';
  }
};

export const getUrgencyBgColor = (urgency: HealthTip['urgency']): string => {
  switch (urgency) {
    case 'high': return 'bg-status-critical/10 border-status-critical/30';
    case 'medium': return 'bg-status-warning/10 border-status-warning/30';
    case 'low': return 'bg-status-good/10 border-status-good/30';
  }
};
