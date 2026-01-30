import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Cat, 
  WeightGoal,
  getWeightGoalForCat, 
  saveWeightGoal, 
  deleteWeightGoal,
  getPreferredWeightUnit,
  convertWeight
} from '@/lib/healthStorage';
import { ArrowLeft, Target, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WeightGoalSetterProps {
  cat: Cat;
  onSave: () => void;
  onCancel: () => void;
}

export const WeightGoalSetter = ({ cat, onSave, onCancel }: WeightGoalSetterProps) => {
  const preferredUnit = getPreferredWeightUnit();
  const existingGoal = getWeightGoalForCat(cat.id);
  
  const [minWeight, setMinWeight] = useState(() => {
    if (existingGoal) {
      return convertWeight(existingGoal.minWeight, existingGoal.unit, preferredUnit).toString();
    }
    return '';
  });
  
  const [maxWeight, setMaxWeight] = useState(() => {
    if (existingGoal) {
      return convertWeight(existingGoal.maxWeight, existingGoal.unit, preferredUnit).toString();
    }
    return '';
  });

  const handleSave = () => {
    const min = parseFloat(minWeight);
    const max = parseFloat(maxWeight);
    
    if (isNaN(min) || isNaN(max)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid weight values.",
        variant: "destructive",
      });
      return;
    }
    
    if (min <= 0 || max <= 0) {
      toast({
        title: "Invalid values",
        description: "Weight must be greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    if (min >= max) {
      toast({
        title: "Invalid range",
        description: "Minimum weight must be less than maximum.",
        variant: "destructive",
      });
      return;
    }
    
    saveWeightGoal(cat.id, min, max, preferredUnit);
    toast({
      title: "Weight goal saved! 🎯",
      description: `Target range: ${min} - ${max} ${preferredUnit}`,
    });
    onSave();
  };

  const handleDelete = () => {
    deleteWeightGoal(cat.id);
    toast({
      title: "Weight goal removed",
      description: "You can set a new goal anytime.",
    });
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Weight Goal</h1>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto overflow-hidden flex items-center justify-center text-3xl mb-3">
            {cat.photo ? (
              <img src={cat.photo} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              '🐱'
            )}
          </div>
          <h2 className="font-bold text-foreground">{cat.name}</h2>
          <p className="text-sm text-muted-foreground">Set a healthy weight range</p>
        </div>

        <div className="bg-accent/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Consult your veterinarian for the ideal weight range based on your cat's breed, age, and body condition.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minWeight">Minimum ({preferredUnit})</Label>
            <Input
              id="minWeight"
              type="number"
              step="0.1"
              min="0"
              placeholder={preferredUnit === 'kg' ? '3.5' : '7.7'}
              value={minWeight}
              onChange={(e) => setMinWeight(e.target.value)}
              className="text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxWeight">Maximum ({preferredUnit})</Label>
            <Input
              id="maxWeight"
              type="number"
              step="0.1"
              min="0"
              placeholder={preferredUnit === 'kg' ? '5.5' : '12.1'}
              value={maxWeight}
              onChange={(e) => setMaxWeight(e.target.value)}
              className="text-lg"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={handleSave} size="lg" className="w-full">
            <Target className="w-4 h-4 mr-2" />
            {existingGoal ? 'Update Goal' : 'Set Goal'}
          </Button>
          
          {existingGoal && (
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Goal
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
