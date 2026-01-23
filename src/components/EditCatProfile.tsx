import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X, Check, Trash2, ArrowLeft } from 'lucide-react';
import { Cat, updateCat, deleteCat } from '@/lib/healthStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EditCatProfileProps {
  cat: Cat;
  onSave: (cat: Cat) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const EditCatProfile = ({ cat, onSave, onDelete, onCancel }: EditCatProfileProps) => {
  const [name, setName] = useState(cat.name);
  const [photo, setPhoto] = useState<string | undefined>(cat.photo);
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

    const savedCat = updateCat(cat.id, { name: name.trim(), photo }) as Cat;
    onSave(savedCat);
  };

  const handleDelete = () => {
    deleteCat(cat.id);
    onDelete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
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
          />
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={!name.trim()}
          className="w-full shadow-button"
          size="lg"
        >
          <Check className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </form>

      {/* Delete Section */}
      <div className="pt-4 border-t border-border">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {cat.name}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {cat.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {cat.name}'s profile and all health records. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
};
