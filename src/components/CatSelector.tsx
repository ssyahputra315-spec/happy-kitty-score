import { motion } from 'framer-motion';
import { Cat, getAllCats, getRecordsForCat, getTodayRecordForCat } from '@/lib/healthStorage';
import { Button } from '@/components/ui/button';
import { Plus, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CatSelectorProps {
  cats: Cat[];
  onSelectCat: (cat: Cat) => void;
  onAddCat: () => void;
  onEditCat: (cat: Cat) => void;
}

export const CatSelector = ({ cats, onSelectCat, onAddCat, onEditCat }: CatSelectorProps) => {
  const getStatusColorClass = (status: string | null) => {
    switch (status) {
      case 'excellent': return 'bg-status-excellent';
      case 'good': return 'bg-status-good';
      case 'warning': return 'bg-status-warning';
      case 'critical': return 'bg-status-critical';
      default: return 'bg-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🐱
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Cat Health Tracker</h1>
        <p className="text-muted-foreground mt-1">
          {cats.length === 0 
            ? 'Add your first cat to get started!' 
            : 'Select a cat to track their health'}
        </p>
      </div>

      <div className="space-y-3">
        {cats.map((cat, index) => {
          const todayRecord = getTodayRecordForCat(cat.id);
          const allRecords = getRecordsForCat(cat.id);
          const hasCheckedToday = !!todayRecord;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl shadow-card overflow-hidden"
            >
              <button
                onClick={() => onSelectCat(cat)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-accent/50 transition-colors"
              >
                {/* Cat Avatar */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-2xl">
                    {cat.photo ? (
                      <img 
                        src={cat.photo} 
                        alt={cat.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      '🐱'
                    )}
                  </div>
                  {/* Status dot */}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card",
                    getStatusColorClass(todayRecord?.status || null)
                  )} />
                </div>

                {/* Cat Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {hasCheckedToday 
                      ? `Today: ${todayRecord.percentage}%` 
                      : allRecords.length > 0 
                        ? `${allRecords.length} record${allRecords.length > 1 ? 's' : ''}`
                        : 'No health checks yet'}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Edit button */}
              <div className="border-t border-border">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCat(cat);
                  }}
                  className="w-full py-2 px-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Cat Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: cats.length * 0.1 + 0.2 }}
      >
        <Button
          onClick={onAddCat}
          variant="outline"
          size="lg"
          className="w-full py-6 border-dashed border-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Cat
        </Button>
      </motion.div>
    </motion.div>
  );
};
