import { useState } from "react";
import { 
  ArrowLeft, 
  Sparkles, 
  ImageIcon, 
  Type, 
  Settings2, 
  FolderOpen,
  Palette,
  Sun,
  Camera,
  Sliders,
  Hash,
  X,
  Upload,
  Plus
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ConceptCard, AddConceptCard } from "./ConceptCard";
import { CustomizationSection } from "./CustomizationSection";
import { 
  CreativeStudioState, 
  aspectRatios, 
  resolutions, 
  imageStyles,
  lightingStyles,
  cameraAngles,
  aiModels
} from "./types";

interface StepTwoCustomizeProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onBack: () => void;
  onGenerate: () => void;
}

export const StepTwoCustomize = ({ state, onUpdate, onBack, onGenerate }: StepTwoCustomizeProps) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !state.extraKeywords.includes(newKeyword.trim())) {
      onUpdate({ extraKeywords: [...state.extraKeywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onUpdate({ extraKeywords: state.extraKeywords.filter(k => k !== keyword) });
  };

  const handleStyleToggle = (style: string) => {
    if (state.imageStyle.includes(style)) {
      onUpdate({ imageStyle: state.imageStyle.filter(s => s !== style) });
    } else {
      onUpdate({ imageStyle: [...state.imageStyle, style] });
    }
  };

  const tokenEstimate = 1700 + (state.imageCount - 1) * 400;

  return (
    <div className="space-y-6">
      {/* Concepts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Concepts
          </h3>
          <span className="text-sm text-muted-foreground">Pick one or add your own</span>
        </div>

        {state.isLoadingConcepts ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-full" />
                    <div className="h-3 bg-secondary rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {state.concepts.map((concept, index) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                index={index}
                isSelected={state.selectedConcept === concept.id}
                onSelect={() => onUpdate({ selectedConcept: concept.id })}
              />
            ))}
            <AddConceptCard onClick={() => {/* TODO: Add custom concept modal */}} />
          </div>
        )}
      </div>

      {/* Customization Panel */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-semibold text-foreground">Customize your creative</h3>
        </div>

        {/* References & Inspiration */}
        <CustomizationSection 
          title="References & Inspiration" 
          icon={<ImageIcon className="w-4 h-4" />}
        >
          <div className="grid grid-cols-3 gap-3">
            {/* Moodboard */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Moodboard</label>
              <button className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-1 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Select</span>
              </button>
            </div>
            {/* Product Reference */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Product Ref</label>
              <button className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-1 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </button>
            </div>
            {/* Master Reference */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Master Ref</label>
              <button className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-1 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
              </button>
            </div>
          </div>
        </CustomizationSection>

        {/* Content */}
        <CustomizationSection 
          title="Content" 
          icon={<Type className="w-4 h-4" />}
        >
          {/* Text on Image */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Text on Image</label>
            <input
              type="text"
              value={state.textOnImage}
              onChange={(e) => onUpdate({ textOnImage: e.target.value })}
              placeholder="e.g., 'New Collection' or 'Sale 50% Off'"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Extra Keywords */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Extra Keywords</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {state.extraKeywords.map((keyword) => (
                <span 
                  key={keyword}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10 text-accent text-sm"
                >
                  {keyword}
                  <button 
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Add keyword..."
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button 
                onClick={handleAddKeyword}
                className="px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Negative Prompt</label>
            <input
              type="text"
              value={state.negativePrompt}
              onChange={(e) => onUpdate({ negativePrompt: e.target.value })}
              placeholder="e.g., 'blurry, low quality, text artifacts'"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </CustomizationSection>

        {/* Output Settings */}
        <CustomizationSection 
          title="Output Settings" 
          icon={<Sliders className="w-4 h-4" />}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Number of Images */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Images</label>
              <Select 
                value={String(state.imageCount)} 
                onValueChange={(v) => onUpdate({ imageCount: Number(v) })}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 4, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}x</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resolution */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Resolution</label>
              <Select 
                value={state.resolution} 
                onValueChange={(v) => onUpdate({ resolution: v })}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resolutions.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="col-span-2 space-y-2">
              <label className="text-sm text-muted-foreground">Aspect Ratio</label>
              <div className="flex flex-wrap gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar}
                    onClick={() => onUpdate({ aspectRatio: ar })}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      state.aspectRatio === ar
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Style */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Style</label>
            <div className="flex flex-wrap gap-2">
              {imageStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleToggle(style)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    state.imageStyle.includes(style)
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </CustomizationSection>

        {/* Advanced Settings */}
        <CustomizationSection 
          title="Advanced Settings" 
          icon={<Settings2 className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* AI Model */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">AI Model</label>
              <Select 
                value={state.aiModel} 
                onValueChange={(v) => onUpdate({ aiModel: v })}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lighting Style */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Sun className="w-3 h-3" /> Lighting
              </label>
              <Select 
                value={state.lightingStyle} 
                onValueChange={(v) => onUpdate({ lightingStyle: v })}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lightingStyles.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Camera Angle */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <Camera className="w-3 h-3" /> Camera
              </label>
              <Select 
                value={state.cameraAngle} 
                onValueChange={(v) => onUpdate({ cameraAngle: v })}
              >
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cameraAngles.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Guidance Scale */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Guidance Scale</label>
              <span className="text-sm font-medium text-foreground">{state.guidanceScale}</span>
            </div>
            <Slider
              value={[state.guidanceScale]}
              onValueChange={([v]) => onUpdate({ guidanceScale: v })}
              min={1}
              max={20}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Seed */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" /> Seed (optional)
            </label>
            <input
              type="number"
              value={state.seed || ''}
              onChange={(e) => onUpdate({ seed: e.target.value ? Number(e.target.value) : null })}
              placeholder="Random"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </CustomizationSection>

        {/* Organization */}
        <CustomizationSection 
          title="Organization" 
          icon={<FolderOpen className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Save to Folder</label>
            <Select 
              value={state.saveToFolder || ''} 
              onValueChange={(v) => onUpdate({ saveToFolder: v })}
            >
              <SelectTrigger className="bg-secondary">
                <SelectValue placeholder="Select folder..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campaign-assets">Campaign Assets</SelectItem>
                <SelectItem value="product-photos">Product Photos</SelectItem>
                <SelectItem value="social-content">Social Content</SelectItem>
                <SelectItem value="archive">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CustomizationSection>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 -mx-6 -mb-6 p-4 bg-card border-t border-border flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <span className="text-sm text-muted-foreground">
          {state.selectedConcept ? '1 concept selected' : 'No concept selected'}
        </span>

        <button
          onClick={onGenerate}
          disabled={state.isGenerating}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          Generate ({tokenEstimate.toLocaleString()} tokens)
        </button>
      </div>
    </div>
  );
};
