import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, Check } from 'lucide-react';
import { Cat, saveCat, updateCat } from '@/lib/healthStorage';

interface CatProfileProps {
  cat?: Cat;
  onSave: (cat: Cat) => void;
  onCancel: () => void;
}

export const CatProfile = ({ cat, onSave, onCancel }: CatProfileProps) => {
  const [name, setName] = useState(cat?.name || '');
  const [photo, setPhoto] = useState<string | undefined>(cat?.photo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let savedCat: Cat;
    if (cat) {
      savedCat = updateCat(cat.id, { name: name.trim(), photo }) as Cat;
    } else {
      savedCat = saveCat({ name: name.trim(), photo });
    }
    
    onSave(savedCat);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          {cat ? 'Edit Cat Profile' : 'Add New Cat'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {cat ? 'Update your cat\'s information' : 'Create a profile for your furry friend'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="flex justify-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full bg-secondary border-4 border-dashed border-border flex items-center justify-center overflow-hidden transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {photo ? (
                <img 
                  src={photo} 
                  alt="Cat photo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Camera className="w-8 h-8" />
                  <span className="text-xs mt-1">Add Photo</span>
                </div>
              )}
            </button>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto(undefined)}
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="cat-name" className="text-sm font-medium text-foreground">
            Cat's Name
          </label>
          <Input
            id="cat-name"
            type="text"
            placeholder="e.g., Whiskers, Luna, Oliver..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-lg py-6"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 shadow-button"
          >
            <Check className="w-4 h-4 mr-2" />
            {cat ? 'Save Changes' : 'Add Cat'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
