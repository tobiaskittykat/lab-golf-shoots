import { useState } from "react";
import { 
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
  Plus,
  Cpu,
  Wand2
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
}

// Sample moodboards for selection
const moodboardOptions = [
  { id: 'minimal', label: 'Minimal', thumbnail: '🤍' },
  { id: 'vibrant', label: 'Vibrant', thumbnail: '🌈' },
  { id: 'moody', label: 'Moody', thumbnail: '🌑' },
  { id: 'warm', label: 'Warm', thumbnail: '🔥' },
  { id: 'cool', label: 'Cool', thumbnail: '❄️' },
  { id: 'natural', label: 'Natural', thumbnail: '🌿' },
];

export const StepTwoCustomize = ({ state, onUpdate }: StepTwoCustomizeProps) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>('minimal');

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
    <div className="space-y-8">
      {/* Concepts Section - Bigger, Gamma-style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Concepts
          </h3>
          <span className="text-sm text-muted-foreground">Pick one or add your own</span>
        </div>

        {state.isLoadingConcepts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card animate-pulse overflow-hidden">
                <div className="flex">
                  <div className="w-2 bg-secondary" />
                  <div className="flex-1 p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-secondary rounded w-3/4" />
                        <div className="h-4 bg-secondary rounded w-full" />
                        <div className="h-4 bg-secondary rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
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

        {/* Moodboard Section - Bigger with options */}
        <CustomizationSection 
          title="Moodboard" 
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a mood or upload your own</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {moodboardOptions.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMoodboard(mood.id)}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedMoodboard === mood.id
                      ? 'border-accent bg-accent/10 shadow-md'
                      : 'border-border bg-secondary/30 hover:border-accent/50'
                  }`}
                >
                  <span className="text-2xl">{mood.thumbnail}</span>
                  <span className="text-xs font-medium text-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
            <button className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex items-center justify-center gap-2 transition-colors text-muted-foreground hover:text-foreground">
              <Upload className="w-5 h-5" />
              <span className="font-medium">Upload custom moodboard</span>
            </button>
          </div>
        </CustomizationSection>

        {/* AI Model Section - Prominent */}
        <CustomizationSection 
          title="AI Model" 
          icon={<Cpu className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {aiModels.map((model) => (
                <button
                  key={model.value}
                  onClick={() => onUpdate({ aiModel: model.value })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    state.aiModel === model.value
                      ? 'border-accent bg-accent/10 shadow-md'
                      : 'border-border bg-secondary/30 hover:border-accent/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {model.value === 'auto' && <Wand2 className="w-5 h-5 text-accent" />}
                    {model.value === 'gemini' && <span className="text-lg">✨</span>}
                    {model.value === 'flux' && <span className="text-lg">⚡</span>}
                    <span className="text-sm font-medium text-foreground">{model.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CustomizationSection>

        {/* Additional References */}
        <CustomizationSection 
          title="Additional References" 
          icon={<ImageIcon className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Product Reference */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product Reference</label>
              <p className="text-xs text-muted-foreground">Upload your product image</p>
              <button className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload</span>
              </button>
            </div>
            {/* Style Reference */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Style Reference</label>
              <p className="text-xs text-muted-foreground">Reference for visual style</p>
              <button className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex flex-col items-center justify-center gap-2 transition-colors">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload</span>
              </button>
            </div>
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

            {/* Lighting */}
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

            {/* Camera */}
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

          {/* Aspect Ratio */}
          <div className="space-y-2">
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

        {/* Content */}
        <CustomizationSection 
          title="Content" 
          icon={<Type className="w-4 h-4" />}
          defaultOpen={false}
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

        {/* Advanced Settings */}
        <CustomizationSection 
          title="Advanced Settings" 
          icon={<Settings2 className="w-4 h-4" />}
          defaultOpen={false}
        >
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

      {/* Footer is now in parent CreativeStudioWizard */}
    </div>
  );
};