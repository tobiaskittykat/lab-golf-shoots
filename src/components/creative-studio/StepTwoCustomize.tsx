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
  Wand2,
  ChevronRight,
  Package,
  Layers
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
import { MoodboardThumbnail } from "./MoodboardThumbnail";
import { MoodboardModal } from "./MoodboardModal";
import { ReferenceGalleryModal } from "./ReferenceGalleryModal";
import { 
  CreativeStudioState, 
  aspectRatios, 
  resolutions, 
  artisticStyles,
  lightingStyles,
  cameraAngles,
  aiModels,
  sampleMoodboards,
  sampleProductReferences,
  sampleContextReferences
} from "./types";

interface StepTwoCustomizeProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
}

export const StepTwoCustomize = ({ state, onUpdate }: StepTwoCustomizeProps) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [showMoodboardModal, setShowMoodboardModal] = useState(false);
  const [showProductRefModal, setShowProductRefModal] = useState(false);
  const [showContextRefModal, setShowContextRefModal] = useState(false);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !state.extraKeywords.includes(newKeyword.trim())) {
      onUpdate({ extraKeywords: [...state.extraKeywords, newKeyword.trim()] });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onUpdate({ extraKeywords: state.extraKeywords.filter(k => k !== keyword) });
  };

  // Show first 6 moodboards, rest in modal
  const visibleMoodboards = sampleMoodboards.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* ===== 1. CONCEPTS SECTION ===== */}
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

      {/* ===== CUSTOMIZATION PANEL ===== */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30">
          <h3 className="font-semibold text-foreground">Customize your creative</h3>
        </div>

        {/* ===== 2. MOODBOARD SECTION ===== */}
        <CustomizationSection 
          title="Moodboard" 
          icon={<Palette className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Set the visual mood and color palette</p>
            
            {/* Moodboard Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {visibleMoodboards.map((moodboard) => (
                <MoodboardThumbnail
                  key={moodboard.id}
                  moodboard={moodboard}
                  isSelected={state.moodboard === moodboard.id}
                  onSelect={() => onUpdate({ moodboard: moodboard.id })}
                />
              ))}
            </div>

            {/* View More Button */}
            <button 
              onClick={() => setShowMoodboardModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View more moodboards
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CustomizationSection>

        {/* ===== 3. PRODUCT REFERENCE SECTION ===== */}
        <CustomizationSection 
          title="Product Reference" 
          icon={<Package className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your product image for the creative</p>
            
            {/* Product Reference Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {sampleProductReferences.slice(0, 4).map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => onUpdate({ productReference: ref.id })}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-sm ${
                    state.productReference === ref.id
                      ? 'border-accent ring-1 ring-accent/30'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <img 
                    src={ref.thumbnail} 
                    alt={ref.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </button>
              ))}
              
              {/* Upload Button */}
              <button className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* View More */}
            <button 
              onClick={() => setShowProductRefModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View more options
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CustomizationSection>

        {/* ===== 4. CONTEXT REFERENCE SECTION ===== */}
        <CustomizationSection 
          title="Context Reference" 
          icon={<Layers className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Scene, environment, or setting for your product</p>
            
            {/* Context Reference Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {sampleContextReferences.slice(0, 5).map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => onUpdate({ contextReference: ref.id })}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-sm ${
                    state.contextReference === ref.id
                      ? 'border-accent ring-1 ring-accent/30'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <img 
                    src={ref.thumbnail} 
                    alt={ref.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-1 left-1 right-1 text-[10px] font-medium text-white truncate">
                    {ref.name}
                  </span>
                </button>
              ))}
              
              {/* Upload Button */}
              <button className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 bg-secondary/30 flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* View More */}
            <button 
              onClick={() => setShowContextRefModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
            >
              View more options
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CustomizationSection>

        {/* ===== 5. ARTISTIC STYLE SECTION ===== */}
        <CustomizationSection 
          title="Artistic Style" 
          icon={<ImageIcon className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose the visual rendering style</p>
            <div className="flex flex-wrap gap-2">
              {artisticStyles.map((style) => (
                <button
                  key={style.value}
                  onClick={() => onUpdate({ artisticStyle: state.artisticStyle === style.value ? null : style.value })}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    state.artisticStyle === style.value
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-accent/50'
                  }`}
                >
                  <span>{style.icon}</span>
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CustomizationSection>

        {/* ===== 6. PROMPT REFINEMENT SECTION ===== */}
        <CustomizationSection 
          title="Prompt Refinement" 
          icon={<Type className="w-4 h-4" />}
        >
          <div className="space-y-5">
            {/* Lighting & Camera Row */}
            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Camera Angle
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
          </div>
        </CustomizationSection>

        {/* ===== 7. OUTPUT SETTINGS SECTION ===== */}
        <CustomizationSection 
          title="Output" 
          icon={<Sliders className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Aspect Ratio</label>
                <Select 
                  value={state.aspectRatio} 
                  onValueChange={(v) => onUpdate({ aspectRatio: v })}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ar) => (
                      <SelectItem key={ar} value={ar}>{ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CustomizationSection>

        {/* ===== 8. AI MODEL SECTION ===== */}
        <CustomizationSection 
          title="AI Model" 
          icon={<Cpu className="w-4 h-4" />}
        >
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
        </CustomizationSection>

        {/* ===== 9. ADVANCED SETTINGS ===== */}
        <CustomizationSection 
          title="Advanced Settings" 
          icon={<Settings2 className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
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

            {/* Save to Folder */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Save to Folder
              </label>
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
          </div>
        </CustomizationSection>
      </div>

      {/* ===== MODALS ===== */}
      <MoodboardModal
        isOpen={showMoodboardModal}
        onClose={() => setShowMoodboardModal(false)}
        selectedMoodboard={state.moodboard}
        onSelect={(id) => onUpdate({ moodboard: id })}
      />

      <ReferenceGalleryModal
        isOpen={showProductRefModal}
        onClose={() => setShowProductRefModal(false)}
        title="Product Reference"
        references={sampleProductReferences}
        selectedReference={state.productReference}
        onSelect={(id) => onUpdate({ productReference: id })}
      />

      <ReferenceGalleryModal
        isOpen={showContextRefModal}
        onClose={() => setShowContextRefModal(false)}
        title="Context Reference"
        references={sampleContextReferences}
        selectedReference={state.contextReference}
        onSelect={(id) => onUpdate({ contextReference: id })}
      />
    </div>
  );
};
