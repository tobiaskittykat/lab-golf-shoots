import { useState, useEffect } from "react";
import { X, Sparkles, Loader2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Concept, 
  ProductFocus, 
  VisualWorld, 
  ContentPillar, 
  TargetAudience, 
  Tonality 
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

// Chip input component for arrays
const ChipInput = ({ 
  values, 
  onChange, 
  placeholder 
}: { 
  values: string[]; 
  onChange: (values: string[]) => void; 
  placeholder: string;
}) => {
  const [input, setInput] = useState('');
  
  const handleAdd = () => {
    if (input.trim() && !values.includes(input.trim())) {
      onChange([...values, input.trim()]);
      setInput('');
    }
  };
  
  const handleRemove = (val: string) => {
    onChange(values.filter(v => v !== val));
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs"
          >
            {val}
            <button
              type="button"
              onClick={() => handleRemove(val)}
              className="hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="flex-1 h-8 text-sm"
        />
        <Button type="button" variant="secondary" size="sm" onClick={handleAdd}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

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
  
  // Section open states
  const [openSections, setOpenSections] = useState({
    core: true,
    product: false,
    visual: false,
    messaging: false,
    audience: false,
  });
  
  // Form data state
  const [title, setTitle] = useState('');
  const [coreIdea, setCoreIdea] = useState('');
  const [consumerInsight, setConsumerInsight] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  // Product Focus
  const [productFocus, setProductFocus] = useState<ProductFocus>({
    heroProduct: '',
    keyDetails: [],
    accessories: [],
    contextCues: [],
  });
  
  // Visual World
  const [visualWorld, setVisualWorld] = useState<VisualWorld>({
    atmosphere: '',
    materials: [],
    palette: [],
    composition: '',
    mustHave: [],
  });
  
  // Taglines
  const [taglines, setTaglines] = useState<string[]>([]);
  
  // Content Pillars
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([]);
  
  // Target Audience
  const [targetAudience, setTargetAudience] = useState<TargetAudience>({
    persona: '',
    situation: '',
  });
  
  // Tonality
  const [tonality, setTonality] = useState<Tonality>({
    adjectives: [],
    neverRules: [],
  });

  // Reset form when modal opens or concept changes
  useEffect(() => {
    if (concept) {
      setTitle(concept.title);
      setCoreIdea(concept.coreIdea || '');
      setConsumerInsight(concept.consumerInsight || '');
      setDescription(concept.description || '');
      setTags(concept.tags || []);
      setProductFocus(concept.productFocus || { heroProduct: '', keyDetails: [], accessories: [], contextCues: [] });
      setVisualWorld(concept.visualWorld || { atmosphere: '', materials: [], palette: [], composition: '', mustHave: [] });
      setTaglines(concept.taglines || []);
      setContentPillars(concept.contentPillars || []);
      setTargetAudience(concept.targetAudience || { persona: '', situation: '' });
      setTonality(concept.tonality || { adjectives: [], neverRules: [] });
    } else if (isNew) {
      // Reset all fields
      setTitle('');
      setCoreIdea('');
      setConsumerInsight('');
      setDescription('');
      setTags([]);
      setProductFocus({ heroProduct: '', keyDetails: [], accessories: [], contextCues: [] });
      setVisualWorld({ atmosphere: '', materials: [], palette: [], composition: '', mustHave: [] });
      setTaglines([]);
      setContentPillars([]);
      setTargetAudience({ persona: '', situation: '' });
      setTonality({ adjectives: [], neverRules: [] });
    }
  }, [concept, isNew, isOpen]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddContentPillar = () => {
    setContentPillars([...contentPillars, { name: '', description: '' }]);
  };

  const handleUpdateContentPillar = (index: number, field: keyof ContentPillar, value: string) => {
    const updated = [...contentPillars];
    updated[index] = { ...updated[index], [field]: value };
    setContentPillars(updated);
  };

  const handleRemoveContentPillar = (index: number) => {
    setContentPillars(contentPillars.filter((_, i) => i !== index));
  };

  const handlePolishWithAI = async () => {
    if (!title && !productFocus.heroProduct) {
      toast({ 
        title: 'Add some content first', 
        description: 'Enter a title or hero product to generate a full concept',
        variant: 'destructive' 
      });
      return;
    }

    setIsPolishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-concepts', {
        body: {
          prompt: `Create a complete campaign concept for: "${title || 'Campaign'}" featuring "${productFocus.heroProduct || 'product'}". 
          Target: ${targetAudience.persona || 'general audience'}. 
          Generate all 9 elements of a professional creative brief.`,
          useCase: defaultUseCase,
        }
      });

      if (error) throw error;

      const polished = data?.concepts?.[0];
      if (polished) {
        // Map the AI response to our form fields
        if (polished.coreIdea) setCoreIdea(polished.coreIdea);
        if (polished.consumerInsight) setConsumerInsight(polished.consumerInsight);
        if (polished.description) setDescription(polished.description);
        if (polished.tags) setTags(polished.tags);
        if (polished.taglines) setTaglines(polished.taglines);
        if (polished.productFocus) setProductFocus(polished.productFocus);
        if (polished.visualWorld) setVisualWorld(polished.visualWorld);
        if (polished.contentPillars) setContentPillars(polished.contentPillars);
        if (polished.targetAudience) setTargetAudience(polished.targetAudience);
        if (polished.tonality) setTonality(polished.tonality);
        
        // Open all sections to show the generated content
        setOpenSections({
          core: true,
          product: true,
          visual: true,
          messaging: true,
          audience: true,
        });
        
        toast({ title: 'Concept generated!', description: 'Review and customize the details' });
      }
    } catch (err) {
      console.error('Failed to generate concept:', err);
      toast({ title: 'Failed to generate', variant: 'destructive' });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSave = () => {
    if (!title?.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    // Build description from visual world if not set
    const finalDescription = description || 
      `${visualWorld.atmosphere}. Materials: ${visualWorld.materials.join(', ')}. ${visualWorld.composition}`;

    const savedConcept: Concept = {
      id: concept?.id || `custom-${Date.now()}`,
      title: title.trim(),
      description: finalDescription.trim(),
      tags,
      coreIdea: coreIdea || undefined,
      consumerInsight: consumerInsight || undefined,
      productFocus: productFocus.heroProduct ? productFocus : undefined,
      visualWorld: visualWorld.atmosphere ? visualWorld : undefined,
      taglines: taglines.length > 0 ? taglines : undefined,
      contentPillars: contentPillars.length > 0 ? contentPillars.filter(p => p.name) : undefined,
      targetAudience: targetAudience.persona ? targetAudience : undefined,
      tonality: tonality.adjectives.length > 0 ? tonality : undefined,
      presets: concept?.presets,
    };

    onSave(savedConcept);
    onClose();
  };

  const SectionHeader = ({ 
    title, 
    section, 
    icon 
  }: { 
    title: string; 
    section: keyof typeof openSections; 
    icon: string;
  }) => (
    <CollapsibleTrigger 
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-2 text-left hover:bg-secondary/30 rounded-lg px-2 -mx-2 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      {openSections[section] ? (
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      )}
    </CollapsibleTrigger>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>{isNew ? 'Create Campaign Concept' : 'Edit Campaign Concept'}</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePolishWithAI}
              disabled={isPolishing}
              className="text-accent border-accent/30 hover:bg-accent/10"
            >
              {isPolishing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate with AI
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          
          {/* SECTION A: Core Concept */}
          <Collapsible open={openSections.core}>
            <SectionHeader title="Core Concept" section="core" icon="💡" />
            <CollapsibleContent className="pt-3 space-y-4">
              {/* 1. Name */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs text-muted-foreground">1. Campaign Name *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Hands Free, Heat On"
                  className="font-medium"
                />
              </div>

              {/* 3. Single-minded Idea */}
              <div className="space-y-1.5">
                <Label htmlFor="coreIdea" className="text-xs text-muted-foreground">3. Single-minded Idea (one sentence)</Label>
                <Input
                  id="coreIdea"
                  value={coreIdea}
                  onChange={(e) => setCoreIdea(e.target.value)}
                  placeholder="e.g., Winter is hands-full—your essentials shouldn't be."
                />
              </div>

              {/* 8. Consumer Insight */}
              <div className="space-y-1.5">
                <Label htmlFor="insight" className="text-xs text-muted-foreground">8. Consumer Insight / Tension</Label>
                <Input
                  id="insight"
                  value={consumerInsight}
                  onChange={(e) => setConsumerInsight(e.target.value)}
                  placeholder="e.g., Gloves + layers make pockets annoying and phones easy to drop."
                />
              </div>
              
              {/* Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tags</Label>
                <ChipInput 
                  values={tags} 
                  onChange={setTags} 
                  placeholder="Add tag..." 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* SECTION B: Product Focus */}
          <Collapsible open={openSections.product}>
            <SectionHeader title="Product Focus" section="product" icon="📦" />
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Hero Product */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">2. Hero Product (what's "in frame")</Label>
                <Input
                  value={productFocus.heroProduct}
                  onChange={(e) => setProductFocus({ ...productFocus, heroProduct: e.target.value })}
                  placeholder="e.g., crossbody phone case with card pocket"
                />
              </div>
              
              {/* Key Details */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Key Details to Show</Label>
                <ChipInput 
                  values={productFocus.keyDetails} 
                  onChange={(vals) => setProductFocus({ ...productFocus, keyDetails: vals })} 
                  placeholder="e.g., leather grain, clasp, pocket open" 
                />
              </div>
              
              {/* Accessories */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Accessories</Label>
                <ChipInput 
                  values={productFocus.accessories} 
                  onChange={(vals) => setProductFocus({ ...productFocus, accessories: vals })} 
                  placeholder="e.g., strap, pouch" 
                />
              </div>
              
              {/* Context Cues */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Context Cues</Label>
                <ChipInput 
                  values={productFocus.contextCues} 
                  onChange={(vals) => setProductFocus({ ...productFocus, contextCues: vals })} 
                  placeholder="e.g., coats, coffee, commute" 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* SECTION C: Visual World */}
          <Collapsible open={openSections.visual}>
            <SectionHeader title="Visual World" section="visual" icon="🎨" />
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Atmosphere */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">4. Atmosphere (art direction)</Label>
                <Textarea
                  value={visualWorld.atmosphere}
                  onChange={(e) => setVisualWorld({ ...visualWorld, atmosphere: e.target.value })}
                  placeholder="e.g., Night city glow + steam breath + wool coats"
                  rows={2}
                />
              </div>
              
              {/* Materials */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Materials</Label>
                <ChipInput 
                  values={visualWorld.materials} 
                  onChange={(vals) => setVisualWorld({ ...visualWorld, materials: vals })} 
                  placeholder="e.g., leather, metal, knit" 
                />
              </div>
              
              {/* Color Palette */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Color Palette</Label>
                <ChipInput 
                  values={visualWorld.palette} 
                  onChange={(vals) => setVisualWorld({ ...visualWorld, palette: vals })} 
                  placeholder="e.g., black, cream, deep green, chrome" 
                />
              </div>
              
              {/* Composition */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Composition Rules</Label>
                <Input
                  value={visualWorld.composition}
                  onChange={(e) => setVisualWorld({ ...visualWorld, composition: e.target.value })}
                  placeholder="e.g., 60% on-body, 40% macro details"
                />
              </div>
              
              {/* Must-have Elements */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Must-have Visual Elements</Label>
                <ChipInput 
                  values={visualWorld.mustHave} 
                  onChange={(vals) => setVisualWorld({ ...visualWorld, mustHave: vals })} 
                  placeholder="e.g., always show strap line across torso" 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* SECTION D: Messaging */}
          <Collapsible open={openSections.messaging}>
            <SectionHeader title="Messaging & Content" section="messaging" icon="💬" />
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Taglines */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">5. Taglines (set of options)</Label>
                <ChipInput 
                  values={taglines} 
                  onChange={setTaglines} 
                  placeholder='e.g., "Hands free. Winter on."' 
                />
              </div>
              
              {/* Content Pillars */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">6. Content Pillars (repeatable story buckets)</Label>
                {contentPillars.map((pillar, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Input
                        value={pillar.name}
                        onChange={(e) => handleUpdateContentPillar(index, 'name', e.target.value)}
                        placeholder="Pillar name"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={pillar.description}
                        onChange={(e) => handleUpdateContentPillar(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="h-8 text-sm"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveContentPillar(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddContentPillar}
                  className="w-full"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Content Pillar
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* SECTION E: Audience & Tone */}
          <Collapsible open={openSections.audience}>
            <SectionHeader title="Audience & Tone" section="audience" icon="🎯" />
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Target Audience */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">7. Target Persona</Label>
                <Input
                  value={targetAudience.persona}
                  onChange={(e) => setTargetAudience({ ...targetAudience, persona: e.target.value })}
                  placeholder="e.g., Style-led urban women 25–45"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Situation / Context</Label>
                <Input
                  value={targetAudience.situation}
                  onChange={(e) => setTargetAudience({ ...targetAudience, situation: e.target.value })}
                  placeholder='e.g., who commute, travel, want "bag-level polish"'
                />
              </div>
              
              {/* Tonality */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">9. Tonality Adjectives (3)</Label>
                <ChipInput 
                  values={tonality.adjectives} 
                  onChange={(vals) => setTonality({ ...tonality, adjectives: vals.slice(0, 3) })} 
                  placeholder="e.g., polished, confident, warm" 
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">"Never" Rules (what to avoid)</Label>
                <ChipInput 
                  values={tonality.neverRules} 
                  onChange={(vals) => setTonality({ ...tonality, neverRules: vals.slice(0, 2) })} 
                  placeholder='e.g., "techy", "cheap hacks"' 
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

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
