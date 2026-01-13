import { RefreshCw, Send, Package, Users, Megaphone, Share2, Palette, FolderOpen, Image, Video, UserCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBrands } from "@/hooks/useBrands";
import { CreativeStudioState, targetPersonas } from "./types";

const typeChips = [
  { id: 'product', label: 'Product Shot', icon: Package, colorClass: 'bg-pink-100 text-pink-500' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Users, colorClass: 'bg-purple-100 text-purple-500' },
  { id: 'ad', label: 'Ad Creative', icon: Megaphone, colorClass: 'bg-orange-100 text-orange-500' },
  { id: 'social', label: 'Social Post', icon: Share2, colorClass: 'bg-accent/10 text-accent' },
];

interface CreativeStudioHeaderProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export const CreativeStudioHeader = ({ 
  state, 
  onUpdate, 
  onRegenerate,
  showRegenerate = false 
}: CreativeStudioHeaderProps) => {
  const { brands, currentBrand } = useBrands();

  const handleTypeChipClick = (chipId: string) => {
    onUpdate({ 
      selectedTypeCard: chipId,
      useCase: chipId as CreativeStudioState['useCase'],
    });
  };

  const displayBrandName = currentBrand?.name || brands.find(b => b.id === state.selectedBrand)?.name || "your brand";

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-8">
      {/* Conversational Header matching Landing Page */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          How can <span className="text-gradient">KittyKat</span> help you with{" "}
          <span className="text-gradient">{displayBrandName}</span> today?
        </h1>
        <p className="text-muted-foreground text-lg">
          Describe your vision and let us bring it to life
        </p>
      </div>

      {/* Type Chips - Horizontal pills with colored icons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {typeChips.map((chip) => {
          const Icon = chip.icon;
          const isSelected = state.selectedTypeCard === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => handleTypeChipClick(chip.id)}
              className={`action-chip ${isSelected ? 'border-accent bg-accent/10 text-accent' : ''}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${chip.colorClass}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Settings Pills Row with colored icons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Brand Selector */}
        <Select 
          value={state.selectedBrand || currentBrand?.id || ''} 
          onValueChange={(value) => onUpdate({ selectedBrand: value })}
        >
          <SelectTrigger className="action-chip w-auto gap-2 border-border">
            <span className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center">
              <Palette className="w-3 h-3 text-pink-500" />
            </span>
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Campaign Selector */}
        <Select value={state.selectedCampaign || ''} onValueChange={(value) => onUpdate({ selectedCampaign: value })}>
          <SelectTrigger className="action-chip w-auto gap-2 border-border">
            <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
              <FolderOpen className="w-3 h-3 text-purple-500" />
            </span>
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summer-2025">Summer 2025</SelectItem>
            <SelectItem value="holiday-collection">Holiday Collection</SelectItem>
            <SelectItem value="new-arrivals">New Arrivals</SelectItem>
          </SelectContent>
        </Select>

        {/* Media Type Dropdown */}
        <Select 
          value={state.mediaType} 
          onValueChange={(value) => onUpdate({ mediaType: value as 'image' | 'video' })}
        >
          <SelectTrigger className="action-chip w-auto gap-2 border-border">
            <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              {state.mediaType === 'video' ? (
                <Video className="w-3 h-3 text-green-500" />
              ) : (
                <Image className="w-3 h-3 text-green-500" />
              )}
            </span>
            <SelectValue placeholder="Media Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>

        {/* Target Persona Dropdown */}
        <Select 
          value={state.targetPersona || ''} 
          onValueChange={(value) => onUpdate({ targetPersona: value })}
        >
          <SelectTrigger className="action-chip w-auto gap-2 border-border">
            <span className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
              <UserCircle className="w-3 h-3 text-accent" />
            </span>
            <SelectValue placeholder="Target Persona" />
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

      {/* Brief Input with embedded Send button */}
      <div className="w-full relative">
        <input
          type="text"
          value={state.prompt}
          onChange={(e) => onUpdate({ prompt: e.target.value })}
          placeholder="Describe your ad creative..."
          className="command-input pr-16"
        />
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:opacity-90 transition-opacity shadow-md"
          title="Generate"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Regenerate button when showing */}
      {showRegenerate && (
        <button
          onClick={onRegenerate}
          className="action-chip"
          title="Regenerate concepts"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  );
};
