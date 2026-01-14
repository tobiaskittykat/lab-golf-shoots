import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Grid3X3, Wand2, Check } from "lucide-react";
import { sampleMoodboards, Moodboard } from "./types";

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMoodboard: string | null;
  onSelect: (moodboardId: string) => void;
}

export const MoodboardModal = ({ 
  isOpen, 
  onClose, 
  selectedMoodboard, 
  onSelect 
}: MoodboardModalProps) => {
  const [activeTab, setActiveTab] = useState("browse");

  const handleSelect = (moodboardId: string) => {
    onSelect(moodboardId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Moodboard</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Browse Gallery
            </TabsTrigger>
            <TabsTrigger value="build" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Build Your Own
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sampleMoodboards.map((moodboard) => (
                <button
                  key={moodboard.id}
                  onClick={() => handleSelect(moodboard.id)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${
                    selectedMoodboard === moodboard.id
                      ? 'border-accent ring-2 ring-accent/30'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <img 
                    src={moodboard.thumbnail} 
                    alt={moodboard.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="font-medium text-white text-sm">{moodboard.name}</h4>
                    {moodboard.description && (
                      <p className="text-xs text-white/70 mt-0.5">{moodboard.description}</p>
                    )}
                  </div>
                  {selectedMoodboard === moodboard.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="build" className="flex-1 mt-4">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Build Your Own Moodboard</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Coming soon! You'll be able to combine colors, textures, and reference images to create a custom moodboard.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 mt-4">
            <div className="flex flex-col items-center justify-center h-64">
              <button className="w-full max-w-md aspect-video rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-3 transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-foreground">Upload a moodboard image</p>
                  <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
