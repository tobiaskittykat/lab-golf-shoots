import { RefreshCw, Package, Users, Globe, Camera, Image, Video } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CreativeStudioState } from "./types";
import { Badge } from "@/components/ui/badge";
import BrandSelector from "@/components/BrandSelector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const typeChips = [
  { id: 'product', label: 'Product Shot', icon: Package, colorClass: 'bg-pink-100 text-pink-500', comingSoon: false },
  { id: 'lifestyle', label: 'Lifestyle', icon: Users, colorClass: 'bg-purple-100 text-purple-500', comingSoon: false },
  { id: 'localization', label: 'Media Localization', icon: Globe, colorClass: 'bg-blue-100 text-blue-500', comingSoon: true },
  { id: 'ugc', label: 'UGC Content', icon: Camera, colorClass: 'bg-orange-100 text-orange-500', comingSoon: true },
];

interface CreativeStudioHeaderProps {
  state: CreativeStudioState;
  onUpdate: (updates: Partial<CreativeStudioState>) => void;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
  hideBriefInput?: boolean;
  disableTypeSwitch?: boolean; // Locks type selection in Step 2
}

export const CreativeStudioHeader = ({ 
  state, 
  onUpdate, 
  onRegenerate,
  showRegenerate = false,
  hideBriefInput = false,
  disableTypeSwitch = false,
}: CreativeStudioHeaderProps) => {

  const handleTypeChipClick = (chipId: string) => {
    // Don't allow switching if disabled (Step 2)
    if (disableTypeSwitch) return;
    
    onUpdate({ 
      selectedTypeCard: chipId,
      useCase: chipId as CreativeStudioState['useCase'],
    });
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto space-y-8">
      {/* Image/Video Toggle - Top Right */}
      <div className="w-full flex justify-end">
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
            <SelectItem value="video" disabled>
              <span className="flex items-center gap-2">
                Video
                <Badge variant="secondary" className="text-xs px-1.5 py-0">Coming Soon</Badge>
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visual-focused Header with inline brand selector */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Create <span className="text-gradient">stunning visuals</span> for <BrandSelector variant="inline" />
        </h1>
        <p className="text-muted-foreground text-lg">
          Share your brief and let's bring it to life together
        </p>
      </div>

      {/* Type Chips - Horizontal pills with colored icons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {typeChips.map((chip) => {
          const Icon = chip.icon;
          const isSelected = state.selectedTypeCard === chip.id;
          const isDisabled = chip.comingSoon || (disableTypeSwitch && !isSelected);
          
          if (isDisabled) {
            return (
              <Tooltip key={chip.id}>
                <TooltipTrigger asChild>
                  <span className="action-chip opacity-50 cursor-not-allowed">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    {chip.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {chip.comingSoon ? 'Coming Soon' : 'Return to Step 1 to change'}
                </TooltipContent>
              </Tooltip>
            );
          }
          
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

      {/* Brief Input - hidden for product shots */}
      {!hideBriefInput && (
        <div className="w-full">
          <input
            type="text"
            value={state.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            placeholder="Enter your creative brief..."
            className="command-input"
          />
        </div>
      )}

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
