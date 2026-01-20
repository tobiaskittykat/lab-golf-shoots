import { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Concept, 
  campaignObjectives, 
  targetPersonas, 
  outputFormats 
} from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConceptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  concept?: Concept | null;
  onSave: (concept: Concept) => void;
  isNew?: boolean;
  defaultUseCase?: string;
}

export const ConceptEditModal = ({
  isOpen,
  onClose,
  concept,
  onSave,
  isNew = false,
  defaultUseCase
}: ConceptEditModalProps) => {
  const { toast } = useToast();
  const [isPolishing, setIsPolishing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Concept>>({
    title: '',
    description: '',
    tags: [],
    objective: '',
    targetPersona: '',
    keyMessage: '',
    outputFormat: '',
    callToAction: '',
  });
  
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens or concept changes
  useEffect(() => {
    if (concept) {
      setFormData({
        id: concept.id,
        title: concept.title,
        description: concept.description,
        tags: concept.tags || [],
        objective: concept.objective || '',
        targetPersona: concept.targetPersona || '',
        keyMessage: concept.keyMessage || '',
        outputFormat: concept.outputFormat || '',
        callToAction: concept.callToAction || '',
        presets: concept.presets,
      });
    } else if (isNew) {
      setFormData({
        title: '',
        description: '',
        tags: [],
        objective: '',
        targetPersona: '',
        keyMessage: '',
        outputFormat: '',
        callToAction: '',
      });
    }
  }, [concept, isNew, isOpen]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    });
  };

  const handlePolishWithAI = async () => {
    if (!formData.title && !formData.description) {
      toast({ 
        title: 'Add some content first', 
        description: 'Enter a title or description to polish',
        variant: 'destructive' 
      });
      return;
    }

    setIsPolishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-concepts', {
        body: {
          prompt: `Polish this concept: Title: "${formData.title || 'Untitled'}", Description: "${formData.description || 'No description'}". Make the description more vivid and visual for photography. Keep it concise (2-3 sentences).`,
          useCase: defaultUseCase,
          targetPersona: formData.targetPersona,
        }
      });

      if (error) throw error;

      // Take the first concept's description and tags as polish suggestions
      const polished = data?.concepts?.[0];
      if (polished) {
        setFormData({
          ...formData,
          description: polished.description,
          tags: polished.tags,
          objective: polished.objective || formData.objective,
          targetPersona: polished.targetPersona || formData.targetPersona,
        });
        toast({ title: 'Polished!', description: 'Description has been refined' });
      }
    } catch (err) {
      console.error('Failed to polish concept:', err);
      toast({ title: 'Failed to polish', variant: 'destructive' });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    const savedConcept: Concept = {
      id: formData.id || `custom-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      tags: formData.tags || [],
      objective: formData.objective || undefined,
      targetPersona: formData.targetPersona || undefined,
      keyMessage: formData.keyMessage || undefined,
      outputFormat: formData.outputFormat || undefined,
      callToAction: formData.callToAction || undefined,
      presets: formData.presets,
    };

    onSave(savedConcept);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create New Concept' : 'Edit Concept'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Summer Vibes Campaign"
            />
          </div>

          {/* Description with AI Polish */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Visual Description</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePolishWithAI}
                disabled={isPolishing}
                className="text-accent hover:text-accent/80"
              >
                {isPolishing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-1" />
                )}
                Polish with AI
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the visual scene, mood, and key elements..."
              rows={3}
            />
          </div>

          {/* Objective & Target Persona Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Campaign Objective</Label>
              <Select
                value={formData.objective || ''}
                onValueChange={(v) => setFormData({ ...formData, objective: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  {campaignObjectives.map((obj) => (
                    <SelectItem key={obj.value} value={obj.value}>
                      {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Persona</Label>
              <Select
                value={formData.targetPersona || ''}
                onValueChange={(v) => setFormData({ ...formData, targetPersona: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select persona" />
                </SelectTrigger>
                <SelectContent>
                  {targetPersonas.map((persona) => (
                    <SelectItem key={persona.value} value={persona.value}>
                      {persona.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Key Message */}
          <div className="space-y-2">
            <Label htmlFor="keyMessage">Key Message / Tagline</Label>
            <Input
              id="keyMessage"
              value={formData.keyMessage || ''}
              onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
              placeholder="e.g., Feel the summer freedom"
            />
          </div>

          {/* Output Format & CTA Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={formData.outputFormat || ''}
                onValueChange={(v) => setFormData({ ...formData, outputFormat: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {outputFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">Call to Action</Label>
              <Input
                id="cta"
                value={formData.callToAction || ''}
                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                placeholder="e.g., Shop Now"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add tag..."
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isNew ? 'Create Concept' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
