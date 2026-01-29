import { useState, useEffect, useMemo } from "react";
import { Check, Wand2, Cloud, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SettingType, BackgroundPreset, WeatherCondition } from "./types";
import { studioBackgrounds, outdoorBackgrounds, weatherConditionOptions } from "./presets";

const LAST_USED_BG_KEY = 'product-shoot-last-bg';
const VISIBLE_COUNT = 4;

interface BackgroundSelectorProps {
  settingType: SettingType;
  selectedBackgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: WeatherCondition;
  onSettingTypeChange: (type: SettingType) => void;
  onBackgroundSelect: (id: string) => void;
  onCustomPromptChange: (prompt: string) => void;
  onWeatherChange?: (weather: WeatherCondition) => void;
}

export const BackgroundSelector = ({
  settingType,
  selectedBackgroundId,
  customBackgroundPrompt,
  weatherCondition = 'auto',
  onSettingTypeChange,
  onBackgroundSelect,
  onCustomPromptChange,
  onWeatherChange,
}: BackgroundSelectorProps) => {
  // Determine initial tab from current selection
  const getInitialTab = () => {
    if (selectedBackgroundId?.startsWith('outdoor-')) return 'outdoor';
    if (selectedBackgroundId?.startsWith('studio-') || settingType === 'studio') return 'studio';
    if (settingType === 'outdoor') return 'outdoor';
    return 'studio';
  };
  
  const [activeTab, setActiveTab] = useState<'studio' | 'outdoor'>(getInitialTab());
  const [showAllBackgrounds, setShowAllBackgrounds] = useState(false);

  // Get last used background from localStorage
  const lastUsedBgId = useMemo(() => {
    try {
      return localStorage.getItem(LAST_USED_BG_KEY) || null;
    } catch {
      return null;
    }
  }, []);

  // Save last used background when selection changes
  useEffect(() => {
    if (selectedBackgroundId) {
      try {
        localStorage.setItem(LAST_USED_BG_KEY, selectedBackgroundId);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [selectedBackgroundId]);

  // Sync tab when background selection changes externally
  useEffect(() => {
    if (selectedBackgroundId?.startsWith('outdoor-')) {
      setActiveTab('outdoor');
    } else if (selectedBackgroundId?.startsWith('studio-')) {
      setActiveTab('studio');
    }
  }, [selectedBackgroundId]);

  const handleTabChange = (value: string) => {
    const tab = value as 'studio' | 'outdoor';
    setActiveTab(tab);
    onSettingTypeChange(tab);
    setShowAllBackgrounds(false); // Reset expand state on tab change
    // If switching to outdoor and no outdoor background selected, select first one
    if (tab === 'outdoor' && !selectedBackgroundId?.startsWith('outdoor-')) {
      onBackgroundSelect(outdoorBackgrounds[0].id);
    } else if (tab === 'studio' && !selectedBackgroundId?.startsWith('studio-')) {
      onBackgroundSelect(studioBackgrounds[0].id);
    }
  };

  // Sort backgrounds: recently used first, then default order
  const sortedBackgrounds = useMemo(() => {
    const baseList = activeTab === 'studio' ? studioBackgrounds : outdoorBackgrounds;
    if (!lastUsedBgId) return baseList;
    
    const lastUsedIndex = baseList.findIndex(bg => bg.id === lastUsedBgId);
    if (lastUsedIndex <= 0) return baseList; // Already first or not found
    
    // Move last used to front
    const sorted = [...baseList];
    const [lastUsed] = sorted.splice(lastUsedIndex, 1);
    sorted.unshift(lastUsed);
    return sorted;
  }, [activeTab, lastUsedBgId]);

  const visibleBackgrounds = showAllBackgrounds 
    ? sortedBackgrounds 
    : sortedBackgrounds.slice(0, VISIBLE_COUNT);
  
  const hiddenCount = sortedBackgrounds.length - VISIBLE_COUNT;
  const isOutdoorBackground = selectedBackgroundId?.startsWith('outdoor-') || settingType === 'outdoor';

  const renderBackgroundCard = (bg: BackgroundPreset) => {
    const isSelected = selectedBackgroundId === bg.id;
    
    return (
      <button
        key={bg.id}
        onClick={() => onBackgroundSelect(bg.id)}
        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
          isSelected 
            ? 'border-accent ring-2 ring-accent/20' 
            : 'border-border hover:border-accent/40'
        }`}
      >
        {/* Thumbnail image or gradient fallback */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            background: bg.thumbnail 
              ? `url(${bg.thumbnail}) center/cover no-repeat` 
              : (bg.colorHint || 'linear-gradient(135deg, #f5f5f5, #e0e0e0)') 
          }}
        />
        
        {/* Overlay with name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className="text-xs font-medium text-white">{bg.name}</span>
        </div>
        
        {/* Selection check */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Auto option */}
      <button
        onClick={() => {
          onSettingTypeChange('auto');
          onBackgroundSelect('');
        }}
        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
          settingType === 'auto' && !selectedBackgroundId
            ? 'border-accent bg-accent/10'
            : 'border-border hover:border-accent/40'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          settingType === 'auto' ? 'bg-accent text-accent-foreground' : 'bg-muted'
        }`}>
          <Wand2 className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="font-medium text-foreground">Auto</div>
          <div className="text-xs text-muted-foreground">Let AI choose the best background</div>
        </div>
      </button>

      {/* Tabs for Studio / Outdoor */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="studio" className="mt-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {visibleBackgrounds.map(renderBackgroundCard)}
          </div>
          {hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllBackgrounds(!showAllBackgrounds)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {showAllBackgrounds ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show {hiddenCount} More
                </>
              )}
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="outdoor" className="mt-4 space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {visibleBackgrounds.map(renderBackgroundCard)}
          </div>
          {hiddenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllBackgrounds(!showAllBackgrounds)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {showAllBackgrounds ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show {hiddenCount} More
                </>
              )}
            </Button>
          )}
        </TabsContent>
      </Tabs>

      {/* Weather condition dropdown (only for outdoor backgrounds) */}
      {isOutdoorBackground && onWeatherChange && (
        <div className="pt-2">
          <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Weather / Lighting
          </label>
          <Select 
            value={weatherCondition} 
            onValueChange={(v) => onWeatherChange(v as WeatherCondition)}
          >
            <SelectTrigger className="bg-muted/50 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weatherConditionOptions.map(w => (
                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Controls natural lighting conditions for outdoor shots
          </p>
        </div>
      )}

      {/* Custom background prompt */}
      <div className="pt-2">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Or describe a custom background
        </label>
        <Input
          value={customBackgroundPrompt || ''}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="e.g., rustic Italian villa courtyard at sunset"
          className="text-sm"
        />
      </div>
    </div>
  );
};
