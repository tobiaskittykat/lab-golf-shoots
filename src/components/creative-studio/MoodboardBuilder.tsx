import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Wand2, RefreshCw, Check, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useAuditLog } from "@/hooks/useAuditLog";

interface MoodboardImage {
  url: string;
  thumbnailUrl: string;
  source: string;
  title: string;
  description?: string;
  score?: number;
}

interface MoodboardBuilderProps {
  onComplete: (moodboardId: string) => void;
  onCancel: () => void;
}

export const MoodboardBuilder = ({ onComplete, onCancel }: MoodboardBuilderProps) => {
  const [mood, setMood] = useState("");
  const [style, setStyle] = useState<'editorial' | 'commercial' | 'mixed'>('mixed');
  const [warmth, setWarmth] = useState([0]); // -100 to 100
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [images, setImages] = useState<MoodboardImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { log: auditLog } = useAuditLog();

  const handleBuild = useCallback(async () => {
    if (!mood.trim()) {
      toast({ title: 'Please enter a mood description', variant: 'destructive' });
      return;
    }

    setIsBuilding(true);
    setImages([]);
    setSelectedImages(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('build-moodboard', {
        body: {
          mood: mood.trim(),
          style,
          warmth: warmth[0] / 100,
          targetCount: 12, // Fetch more to allow selection
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to build moodboard');
      }

      setImages(data.images || []);
      setSearchTerms(data.searchTerms || []);
      
      // Auto-select first 9
      const autoSelected = new Set<number>();
      for (let i = 0; i < Math.min(9, data.images?.length || 0); i++) {
        autoSelected.add(i);
      }
      setSelectedImages(autoSelected);

      toast({ 
        title: 'Moodboard built!', 
        description: `Found ${data.images?.length || 0} images from ${data.sources?.join(', ') || 'various sources'}` 
      });

    } catch (err) {
      console.error('Build error:', err);
      toast({ 
        title: 'Failed to build moodboard', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setIsBuilding(false);
    }
  }, [mood, style, warmth, toast]);

  const toggleImage = (index: number) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < 9) {
        next.add(index);
      } else {
        toast({ title: 'Maximum 9 images allowed', variant: 'destructive' });
      }
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    if (!user?.id) {
      toast({ title: 'Please sign in to save', variant: 'destructive' });
      return;
    }

    if (selectedImages.size === 0) {
      toast({ title: 'Please select at least one image', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      // Get selected image URLs
      const selectedUrls = Array.from(selectedImages).map(i => images[i]?.url).filter(Boolean);
      
      // Use the first selected image as thumbnail for now
      // In future, could create a composite image
      const thumbnailUrl = images[Array.from(selectedImages)[0]]?.thumbnailUrl || selectedUrls[0];

      // Create moodboard record
      const moodboardName = mood.length > 50 ? mood.substring(0, 50) + '...' : mood;
      
      const { data: moodboard, error: dbError } = await supabase
        .from('custom_moodboards')
        .insert({
          user_id: user.id,
          name: moodboardName,
          description: `AI-built moodboard: ${mood}`,
          thumbnail_url: thumbnailUrl,
          file_path: `ai-built/${user.id}/${Date.now()}`, // Virtual path for AI-built moodboards
          visual_analysis: {
            builtWith: 'ai',
            mood,
            style,
            searchTerms,
            imageUrls: selectedUrls,
            sources: [...new Set(Array.from(selectedImages).map(i => images[i]?.source))],
          },
        })
        .select('id')
        .single();

      if (dbError) throw dbError;

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
      
      // Audit log
      auditLog({
        action: 'build_moodboard',
        resourceType: 'custom_moodboards',
        resourceId: moodboard.id,
        resourceName: moodboardName,
      });

      toast({ title: 'Moodboard saved!' });
      onComplete(`custom-${moodboard.id}`);

    } catch (err) {
      console.error('Save error:', err);
      toast({ 
        title: 'Failed to save moodboard', 
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  }, [user, images, selectedImages, mood, style, searchTerms, toast, queryClient, auditLog, onComplete]);

  const moodExamples = [
    "Mediterranean summer, terracotta, golden hour",
    "Nordic minimalism, soft light, organic textures",
    "90s nostalgia, grainy film, pastel tones",
    "Brutalist architecture, concrete, bold shadows",
    "Tropical lush, emerald greens, humid atmosphere",
  ];

  return (
    <div className="space-y-6">
      {/* Mood Input */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Describe your mood</label>
        <Input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mediterranean summer, terracotta, golden hour warmth..."
          className="text-base"
          disabled={isBuilding}
        />
        <div className="flex flex-wrap gap-2">
          {moodExamples.map((example, i) => (
            <button
              key={i}
              onClick={() => setMood(example)}
              className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isBuilding}
            >
              {example.split(',')[0]}...
            </button>
          ))}
        </div>
      </div>

      {/* Style Toggle */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Style preference</label>
        <div className="flex gap-2">
          {(['editorial', 'mixed', 'commercial'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                style === s 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
              disabled={isBuilding}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Warmth Slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-foreground">Temperature</label>
          <span className="text-xs text-muted-foreground">
            {warmth[0] < -30 ? 'Cool' : warmth[0] > 30 ? 'Warm' : 'Neutral'}
          </span>
        </div>
        <Slider
          value={warmth}
          onValueChange={setWarmth}
          min={-100}
          max={100}
          step={10}
          disabled={isBuilding}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cool</span>
          <span>Warm</span>
        </div>
      </div>

      {/* Build Button */}
      <Button
        onClick={handleBuild}
        disabled={isBuilding || !mood.trim()}
        className="w-full gap-2"
      >
        {isBuilding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Building moodboard...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Build Moodboard
          </>
        )}
      </Button>

      {/* Search Terms Used */}
      {searchTerms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground">Searched:</span>
          {searchTerms.map((term, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {term}
            </span>
          ))}
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Select up to 9 images ({selectedImages.size} selected)
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBuild}
              disabled={isBuilding}
              className="gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <Card
                key={i}
                className={`relative overflow-hidden cursor-pointer transition-all ${
                  selectedImages.has(i) 
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' 
                    : 'hover:ring-1 hover:ring-accent/50'
                }`}
                onClick={() => toggleImage(i)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={img.thumbnailUrl || img.url}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Selection indicator */}
                    {selectedImages.has(i) && (
                      <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-5 h-5 text-accent-foreground" />
                        </div>
                      </div>
                    )}
                    {/* Source badge */}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px]">
                      {img.source}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save/Cancel */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || selectedImages.size === 0}
              className="flex-1 gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save Moodboard
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
