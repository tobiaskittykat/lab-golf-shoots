import { useState, useEffect, useMemo } from "react";
import { Check, Wand2, Cloud, ChevronDown, ChevronUp, Plus, X, Upload, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SettingType, BackgroundPreset, WeatherCondition } from "./types";
import { studioBackgrounds, outdoorBackgrounds, weatherConditionOptions } from "./presets";
import { useCustomBackgrounds, CustomBackground } from "@/hooks/useCustomBackgrounds";
import { useBrands } from "@/hooks/useBrands";
import { useAuth } from "@/hooks/useAuth";
import { CreateCustomBackgroundModal } from "./CreateCustomBackgroundModal";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LAST_USED_BG_KEY = 'product-shoot-last-bg';
const PRESET_VISIBLE_COUNT = 3; // 3 presets + 1 Auto tile = 4 tiles in first row

interface BackgroundSelectorProps {
  settingType: SettingType;
  selectedBackgroundId?: string;
  customBackgroundPrompt?: string;
  weatherCondition?: WeatherCondition;
  onSettingTypeChange: (type: SettingType) => void;
  onBackgroundSelect: (id: string) => void;
  onCustomPromptChange: (prompt: string) => void;
  onWeatherChange?: (weather: WeatherCondition) => void;
  sceneImageUrl?: string;
  onSceneImageChange?: (url: string | undefined) => void;
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
  sceneImageUrl,
  onSceneImageChange,
}: BackgroundSelectorProps) => {
  const { currentBrand } = useBrands();
  const { user } = useAuth();
  const { backgrounds: customBackgrounds, isLoading: loadingCustom, createBackground, deleteBackground } = useCustomBackgrounds(currentBrand?.id);

  // Determine initial tab from current selection
  const getInitialTab = () => {
    if (settingType === 'scene' || selectedBackgroundId === 'scene-uploaded') return 'scene';
    if (selectedBackgroundId?.startsWith('custom-')) return 'custom';
    if (selectedBackgroundId?.startsWith('outdoor-')) return 'outdoor';
    if (selectedBackgroundId?.startsWith('studio-') || settingType === 'studio') return 'studio';
    if (settingType === 'outdoor') return 'outdoor';
    if (settingType === 'custom') return 'custom';
    return 'studio';
  };
  
  const [activeTab, setActiveTab] = useState<'studio' | 'outdoor' | 'custom' | 'scene'>(getInitialTab());
  const [showAllBackgrounds, setShowAllBackgrounds] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUploadingScene, setIsUploadingScene] = useState(false);

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
    if (selectedBackgroundId && !selectedBackgroundId.endsWith('-auto')) {
      try {
        localStorage.setItem(LAST_USED_BG_KEY, selectedBackgroundId);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [selectedBackgroundId]);

  // Sync tab when background selection changes externally
  useEffect(() => {
    if (selectedBackgroundId === 'scene-uploaded') {
      setActiveTab('scene');
    } else if (selectedBackgroundId?.startsWith('custom-')) {
      setActiveTab('custom');
    } else if (selectedBackgroundId?.startsWith('outdoor-')) {
      setActiveTab('outdoor');
    } else if (selectedBackgroundId?.startsWith('studio-')) {
      setActiveTab('studio');
    }
  }, [selectedBackgroundId]);

  const handleTabChange = (value: string) => {
    const tab = value as 'studio' | 'outdoor' | 'custom' | 'scene';
    setActiveTab(tab);
    onSettingTypeChange(tab);
    setShowAllBackgrounds(false);
    
    if (tab === 'scene') {
      if (sceneImageUrl) {
        onBackgroundSelect('scene-uploaded');
      }
    } else if (tab === 'custom') {
      // For custom tab, select first custom bg or clear
      if (customBackgrounds.length > 0 && !selectedBackgroundId?.startsWith('custom-')) {
        onBackgroundSelect(`custom-${customBackgrounds[0].id}`);
      }
    } else if (tab === 'outdoor' && !selectedBackgroundId?.startsWith('outdoor-')) {
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
    if (lastUsedIndex <= 0) return baseList;
    
    const sorted = [...baseList];
    const [lastUsed] = sorted.splice(lastUsedIndex, 1);
    sorted.unshift(lastUsed);
    return sorted;
  }, [activeTab, lastUsedBgId]);

  // Visible presets (excluding Auto tile which is always appended)
  const visiblePresets = showAllBackgrounds 
    ? sortedBackgrounds 
    : sortedBackgrounds.slice(0, PRESET_VISIBLE_COUNT);
  
  const hiddenCount = sortedBackgrounds.length - PRESET_VISIBLE_COUNT;
  const isOutdoorBackground = selectedBackgroundId?.startsWith('outdoor-') || settingType === 'outdoor';

  const autoTileId = activeTab === 'studio' ? 'studio-auto' : activeTab === 'outdoor' ? 'outdoor-auto' : 'custom-auto';
  const isAutoSelected = selectedBackgroundId === autoTileId;

  // Scene image upload handler
  const handleSceneUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingScene(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/scene/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('brand-assets')
        .upload(path, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(path);
      
      onSceneImageChange?.(publicUrl);
      onSettingTypeChange('scene');
      onBackgroundSelect('scene-uploaded');
      toast({ title: "Scene image uploaded" });
    } catch (err) {
      console.error('Scene upload error:', err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploadingScene(false);
    }
  };

  const handleRemoveScene = () => {
    onSceneImageChange?.(undefined);
    onBackgroundSelect('');
  };

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
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            background: bg.thumbnail 
              ? `url(${bg.thumbnail}) center/cover no-repeat` 
              : (bg.colorHint || 'linear-gradient(135deg, #f5f5f5, #e0e0e0)') 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className="text-xs font-medium text-white">{bg.name}</span>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}
      </button>
    );
  };

  const renderCustomCard = (bg: CustomBackground) => {
    const bgId = `custom-${bg.id}`;
    const isSelected = selectedBackgroundId === bgId;
    
    return (
      <button
        key={bg.id}
        onClick={() => {
          onBackgroundSelect(bgId);
          // Also set the custom prompt so the generation pipeline can use it
          onCustomPromptChange(bg.prompt);
        }}
        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
          isSelected 
            ? 'border-accent ring-2 ring-accent/20' 
            : 'border-border hover:border-accent/40'
        }`}
      >
        {bg.thumbnail_url ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ background: `url(${bg.thumbnail_url}) center/cover no-repeat` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-muted to-accent/10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <span className="text-xs font-medium text-white truncate block">{bg.name}</span>
        </div>
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}
        {/* Delete button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${bg.name}"?`)) {
              deleteBackground.mutate(bg.id);
              if (isSelected) {
                onBackgroundSelect('');
                onCustomPromptChange('');
              }
            }
          }}
          className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </button>
    );
  };

  const renderAutoTile = () => (
    <button
      key={autoTileId}
      onClick={() => {
        onSettingTypeChange(activeTab);
        onBackgroundSelect(autoTileId);
      }}
      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all group ${
        isAutoSelected
          ? 'border-accent ring-2 ring-accent/20' 
          : 'border-border hover:border-accent/40'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-muted to-accent/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isAutoSelected ? 'bg-accent text-accent-foreground' : 'bg-background/80 text-muted-foreground'
        }`}>
          <Wand2 className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-foreground">Auto (AI)</span>
      </div>
      {isAutoSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
          <Check className="w-3 h-3 text-accent-foreground" />
        </div>
      )}
    </button>
  );

  const renderNewBackgroundTile = () => (
    <button
      key="new-custom"
      onClick={() => setShowCreateModal(true)}
      className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-border hover:border-accent/50 transition-all flex flex-col items-center justify-center gap-1.5"
    >
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <Plus className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-xs font-medium text-muted-foreground">New Background</span>
    </button>
  );

  const renderPresetGrid = () => (
    <>
      <div className="grid grid-cols-4 gap-3">
        {visiblePresets.map(renderBackgroundCard)}
        {renderAutoTile()}
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
    </>
  );

  const renderCustomGrid = () => (
    <div className="grid grid-cols-4 gap-3">
      {customBackgrounds.map(renderCustomCard)}
      {renderNewBackgroundTile()}
    </div>
  );

  const renderSceneContent = () => (
    <div className="space-y-3">
      {sceneImageUrl ? (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-accent ring-2 ring-accent/20">
            <img src={sceneImageUrl} alt="Scene" className="w-full h-full object-cover" />
            <button
              onClick={handleRemoveScene}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-destructive transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-xs font-medium text-white flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Scene Reference
              </span>
            </div>
          </div>
          {/* Optional additional direction */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Placement direction (optional)
            </label>
            <Input
              value={customBackgroundPrompt || ''}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              placeholder="e.g., place shoes on the table in the foreground"
              className="text-sm"
            />
          </div>
        </div>
      ) : (
        <label className="relative aspect-video rounded-xl border-2 border-dashed border-border hover:border-accent/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleSceneUpload}
            className="hidden"
            disabled={isUploadingScene}
          />
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            {isUploadingScene ? (
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-foreground">Upload a scene image</span>
            <p className="text-xs text-muted-foreground mt-0.5">Your product will be placed directly into this scene</p>
          </div>
        </label>
      )}
    </div>
  );

  const handleCreateSave = (data: {
    name: string;
    prompt: string;
    thumbnail_url: string | null;
    reference_urls: string[];
    ai_analysis: Record<string, any> | null;
  }) => {
    createBackground.mutate(data, {
      onSuccess: (newBg) => {
        setShowCreateModal(false);
        onBackgroundSelect(`custom-${newBg.id}`);
        onCustomPromptChange(data.prompt);
        toast({ title: "Custom background saved!" });
      },
      onError: () => {
        toast({ title: "Failed to save background", variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Tabs for Studio / Outdoor / Custom / Scene */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="scene">Scene</TabsTrigger>
        </TabsList>
        
        <TabsContent value="studio" className="mt-4 space-y-3">
          {renderPresetGrid()}
        </TabsContent>
        
        <TabsContent value="outdoor" className="mt-4 space-y-3">
          {renderPresetGrid()}
        </TabsContent>

        <TabsContent value="custom" className="mt-4 space-y-3">
          {renderCustomGrid()}
        </TabsContent>

        <TabsContent value="scene" className="mt-4 space-y-3">
          {renderSceneContent()}
        </TabsContent>
      </Tabs>

      {/* Weather condition dropdown (only for outdoor backgrounds, not for auto) */}
      {isOutdoorBackground && !isAutoSelected && onWeatherChange && (
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

      {/* Custom background prompt - only show for studio/outdoor tabs */}
      {(activeTab === 'studio' || activeTab === 'outdoor') && (
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
      )}

      {/* Create Custom Background Modal */}
      <CreateCustomBackgroundModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSave={handleCreateSave}
        isSaving={createBackground.isPending}
      />
    </div>
  );
};
