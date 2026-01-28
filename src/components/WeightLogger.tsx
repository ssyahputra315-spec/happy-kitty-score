import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Scale, Check } from 'lucide-react';
import { 
  Cat, 
  saveWeightRecord, 
  getPreferredWeightUnit, 
  getLatestWeightForCat,
  convertWeight 
} from '@/lib/healthStorage';
import { cn } from '@/lib/utils';

interface WeightLoggerProps {
  cat: Cat;
  onSave: () => void;
  onCancel: () => void;
}

export const WeightLogger = ({ cat, onSave, onCancel }: WeightLoggerProps) => {
  const [unit, setUnit] = useState<'kg' | 'lbs'>(getPreferredWeightUnit());
  const [weight, setWeight] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const latestWeight = getLatestWeightForCat(cat.id);
  const displayLatestWeight = latestWeight 
    ? convertWeight(latestWeight.weight, latestWeight.unit, unit)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight);
    
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 50) {
      return;
    }

    setIsSaving(true);
    saveWeightRecord(cat.id, weightValue, unit);
    
    setTimeout(() => {
      onSave();
    }, 300);
  };

  const isValidWeight = () => {
    const w = parseFloat(weight);
    return !isNaN(w) && w > 0 && w <= 50;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-lg">
          {cat.photo ? (
            <img src={cat.photo} alt={cat.name} className="w-full h-full object-cover" />
          ) : (
            '🐱'
          )}
        </div>
        <div>
          <h1 className="font-bold text-foreground">Log Weight</h1>
          <p className="text-xs text-muted-foreground">{cat.name}</p>
        </div>
      </div>

      {/* Weight Input Card */}
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Scale className="w-8 h-8 text-primary" />
          <span className="text-2xl">⚖️</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unit Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex bg-secondary rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUnit('kg')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  unit === 'kg' 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Kilograms (kg)
              </button>
              <button
                type="button"
                onClick={() => setUnit('lbs')}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all",
                  unit === 'lbs' 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Pounds (lbs)
              </button>
            </div>
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Today's Weight
            </label>
            <div className="relative">
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="50"
                placeholder={`Enter weight in ${unit}`}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="text-lg pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {unit}
              </span>
            </div>
            {displayLatestWeight && (
              <p className="text-sm text-muted-foreground">
                Last recorded: {displayLatestWeight} {unit} on{' '}
                {new Date(latestWeight!.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            )}
          </div>

          {/* Healthy Weight Info */}
          <div className="p-4 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Most adult cats weigh between{' '}
              {unit === 'kg' ? '3.5 - 5.5 kg' : '7.7 - 12 lbs'}. 
              Regular weigh-ins help track health changes early.
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            size="lg" 
            className="w-full shadow-button"
            disabled={!isValidWeight() || isSaving}
          >
            {isSaving ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Scale className="w-4 h-4 mr-2" />
                Log Weight
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};
