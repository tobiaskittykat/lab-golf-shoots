import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Check, RotateCcw, Pipette, Upload, X, Loader2, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ComponentType, 
  getMaterialsForComponent, 
  COLOR_PRESETS,
  findColorPreset,
  MaterialOption,
} from '@/lib/birkenstockMaterials';
import { cn } from '@/lib/utils';
import { hexToColorName } from '@/lib/colorNames';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useColorSamples } from '@/hooks/useColorSamples';

interface ComponentOverridePopoverProps {
  componentType: ComponentType;
  currentMaterial: string;
  currentColor: string;
  currentColorHex?: string;
  override?: { material: string; color: string; sampleImageUrl?: string; attachSampleToGen?: boolean };
  onApply: (override: { material: string; color: string; sampleImageUrl?: string; attachSampleToGen?: boolean } | null) => void;
  // For color-matched materials (buckles inherit upper color)
  upperColor?: string;
  upperColorHex?: string;
}

export function ComponentOverridePopover({
  componentType,
  currentMaterial,
  currentColor,
  currentColorHex,
  override,
  onApply,
  upperColor,
  upperColorHex,
}: ComponentOverridePopoverProps) {
  const [open, setOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(override?.material || currentMaterial);
  // Parse hex from canonical color string if present (e.g. "Medium Sea Green (#1DAF64)")
  const _initColor = override?.color || currentColor;
  const _initHexMatch = _initColor.match(/\(#([0-9A-Fa-f]{6})\)\s*$/);
  const [selectedColor, setSelectedColor] = useState(_initHexMatch ? _initColor.replace(/\s*\(#[0-9A-Fa-f]{6}\)\s*$/, '') : _initColor);
  const [selectedHex, setSelectedHex] = useState(_initHexMatch ? '#' + _initHexMatch[1] : (currentColorHex || ''));
  const [customHex, setCustomHex] = useState('');
  const [sampleImageUrl, setSampleImageUrl] = useState(override?.sampleImageUrl || '');
  const [attachSampleToGen, setAttachSampleToGen] = useState(override?.attachSampleToGen || false);
  const [isUploadingSample, setIsUploadingSample] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { samples, saveSample, updateSample, deleteSample } = useColorSamples();
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null);
  const [editMaterial, setEditMaterial] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editHex, setEditHex] = useState('');

  const RECENT_COLORS_KEY = 'component-override-recent-colors';
  type RecentColor = { name: string; hex: string };

  const [recentColors, setRecentColors] = useState<RecentColor[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_COLORS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
    } catch {}
    return [];
  });

  const saveRecentColor = (name: string, hex: string) => {
    if (!hex) return;
    try {
      const deduped = [{ name, hex }, ...recentColors.filter(c => c.hex.toUpperCase() !== hex.toUpperCase())].slice(0, 5);
      setRecentColors(deduped);
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(deduped));
    } catch {}
  };

  const materials = getMaterialsForComponent(componentType);
  const isModified = selectedMaterial !== currentMaterial || selectedColor !== currentColor;
  
  // Look up metadata for the selected material
  const selectedMaterialOption = materials.find(m => m.value === selectedMaterial);
  const hasFixedColor = selectedMaterialOption?.fixedColor != null;
  
  // Check if this material is color-matched (inherits from upper)
  const isColorMatched = selectedMaterial === 'Matte Plastic (Coordinated)' || selectedMaterial === 'Metal (Coordinated)' || selectedMaterial === 'Translucent (Coordinated)';

  // Group materials by category
  const groupedMaterials = useMemo(() => {
    const groups: Record<string, MaterialOption[]> = {};
    materials.forEach(mat => {
      const cat = mat.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(mat);
    });
    return groups;
  }, [materials]);

  // Reset local state when popover opens
  useEffect(() => {
    if (open) {
      setSelectedMaterial(override?.material || currentMaterial);
      const rawColor = override?.color || currentColor;
      const hexMatch = rawColor.match(/\(#([0-9A-Fa-f]{6})\)\s*$/);
      setSelectedColor(hexMatch ? rawColor.replace(/\s*\(#[0-9A-Fa-f]{6}\)\s*$/, '') : rawColor);
      setSelectedHex(hexMatch ? '#' + hexMatch[1] : (currentColorHex || ''));
      setCustomHex('');
      setSampleImageUrl(override?.sampleImageUrl || '');
      setAttachSampleToGen(override?.attachSampleToGen || false);
    }
  }, [open, override, currentMaterial, currentColor, currentColorHex]);
  
  // Auto-sync color when color-matched material is selected
  useEffect(() => {
    if (isColorMatched && upperColor) {
      setSelectedColor(upperColor);
      setSelectedHex(upperColorHex || '');
    }
  }, [isColorMatched, upperColor, upperColorHex]);

  // Auto-set color when a fixed-color material is selected
  useEffect(() => {
    if (hasFixedColor && selectedMaterialOption) {
      setSelectedColor(selectedMaterialOption.fixedColor!);
      setSelectedHex(selectedMaterialOption.fixedColorHex || '');
    }
  }, [selectedMaterial, hasFixedColor]);

  const handleColorPresetClick = (preset: typeof COLOR_PRESETS[number]) => {
    setSelectedColor(preset.name);
    setSelectedHex(preset.hex);
    setCustomHex('');
  };

  const handleCustomHexChange = (raw: string) => {
    const stripped = raw.replace(/^#/, '');
    setCustomHex(stripped);
    if (/^[0-9A-Fa-f]{6}$/.test(stripped)) {
      const fullHex = '#' + stripped.toUpperCase();
      const preset = findColorPreset(fullHex);
      setSelectedColor(preset?.name || hexToColorName(fullHex));
      setSelectedHex(fullHex);
    }
  };

  const handleSampleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    setIsUploadingSample(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/color-samples/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { contentType: file.type, cacheControl: '3600' });
      
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;
      setSampleImageUrl(publicUrl);
      setAttachSampleToGen(true);
      
      // Trigger AI analysis of the swatch
      setIsAnalyzing(true);
      try {
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-color-sample', {
          body: { imageUrl: publicUrl, componentType },
        });
        if (!analysisError && analysisData?.material) {
          // Auto-fill material if it's in our list
          const matchedMaterial = materials.find(m => m.value === analysisData.material);
          if (matchedMaterial) {
            setSelectedMaterial(matchedMaterial.value);
          }
          if (analysisData.color) {
            setSelectedColor(analysisData.color);
          }
          if (analysisData.colorHex) {
            setSelectedHex(analysisData.colorHex);
          }
          // Auto-save to sample repository
          saveSample({
            image_url: publicUrl,
            material: analysisData.material,
            color: analysisData.color,
            color_hex: analysisData.colorHex,
            component_type: componentType,
          });
        }
      } catch (analysisErr) {
        console.error('Swatch analysis failed (non-blocking):', analysisErr);
      } finally {
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error('Sample upload failed:', err);
    } finally {
      setIsUploadingSample(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const handleRemoveSample = () => {
    setSampleImageUrl('');
    setAttachSampleToGen(false);
  };

  const handleApply = () => {
    if (isModified || sampleImageUrl) {
      // Serialize hex into canonical single-field color: "Name (#HEX)"
      let canonicalColor = selectedColor;
      if (selectedHex) {
        const hex = selectedHex.replace(/^#/, '').toUpperCase();
        if (/^[0-9A-F]{6}$/.test(hex)) {
          const name = canonicalColor && canonicalColor !== 'Custom' && canonicalColor !== 'custom'
            ? canonicalColor
            : hexToColorName('#' + hex);
          canonicalColor = name && name !== 'Custom' ? `${name} (#${hex})` : `#${hex}`;
        }
      }
      onApply({
        material: selectedMaterial,
        color: canonicalColor,
        sampleImageUrl: sampleImageUrl || undefined,
        attachSampleToGen: sampleImageUrl ? attachSampleToGen : undefined,
      });
      // Save to recent colors
      if (selectedColor && selectedHex) {
        saveRecentColor(selectedColor, selectedHex);
      }
    } else {
      onApply(null);
    }
    setOpen(false);
  };

  const handleReset = () => {
    setSelectedMaterial(currentMaterial);
    setSelectedColor(currentColor);
    setSelectedHex(currentColorHex || '');
    setSampleImageUrl('');
    setAttachSampleToGen(false);
    onApply(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'text-xs h-7 gap-1',
            override ? 'text-accent' : 'text-muted-foreground'
          )}
        >
          {override ? 'Edit' : 'Override'}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 pointer-events-auto" align="end">
        <div className="space-y-4">
          {/* Material Selection - Grouped by Category */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Material
            </Label>
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
              {Object.entries(groupedMaterials).map(([category, mats]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {category}
                  </p>
                  <RadioGroup
                    value={selectedMaterial}
                    onValueChange={setSelectedMaterial}
                    className="grid grid-cols-2 gap-1.5"
                  >
                    {mats.map((mat) => (
                      <div key={mat.value} className="flex items-center">
                        <RadioGroupItem
                          value={mat.value}
                          id={`${componentType}-mat-${mat.value}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`${componentType}-mat-${mat.value}`}
                          className={cn(
                            'flex items-center justify-between w-full px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors',
                            selectedMaterial === mat.value
                              ? 'border-accent bg-accent/10 text-foreground'
                              : 'border-border/50 hover:border-border hover:bg-muted/30 text-muted-foreground'
                          )}
                        >
                          <span className="truncate">{mat.label}</span>
                          {mat.value === currentMaterial && (
                            <span className="text-[9px] text-muted-foreground ml-1">(current)</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Color
            </Label>
            
            {isColorMatched ? (
              /* Color-matched: show locked state with upper color */
              <div className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                <div className="flex items-center gap-2">
                  {upperColorHex && (
                    <div
                      className="w-5 h-5 rounded border border-border/50 flex-shrink-0"
                      style={{ backgroundColor: upperColorHex }}
                    />
                  )}
                  <span className="text-sm">
                    Matches Upper: <strong>{upperColor || 'Unknown'}</strong>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Color automatically synced with upper component
                </p>
              </div>
            ) : hasFixedColor ? (
              /* Fixed color: show locked state with material's inherent color */
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded border border-border/50 flex-shrink-0"
                    style={{ backgroundColor: selectedMaterialOption?.fixedColorHex || '#888' }}
                  />
                  <span className="text-sm">
                    <strong>{selectedMaterialOption?.fixedColor}</strong>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Inherent finish — color defined by material
                </p>
              </div>
            ) : (
              /* Normal color picker */
              <>
                {/* Last Used colors */}
                {recentColors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Last Used</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {recentColors.map((rc, i) => (
                        <button
                          key={`recent-${i}`}
                          type="button"
                          onClick={() => {
                            setSelectedColor(rc.name);
                            setSelectedHex(rc.hex);
                            setCustomHex('');
                          }}
                          className={cn(
                            'relative w-full aspect-square rounded-md border-2 transition-all',
                            selectedColor === rc.name && selectedHex === rc.hex
                              ? 'border-accent ring-1 ring-accent/30 scale-105'
                              : 'border-transparent hover:border-border'
                          )}
                          style={{ backgroundColor: rc.hex }}
                          title={rc.name}
                        >
                          {selectedColor === rc.name && selectedHex === rc.hex && (
                            <Check className="w-3 h-3 absolute inset-0 m-auto text-white drop-shadow-md" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standard Colors */}
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Standard Colors</p>
                  <div className="grid grid-cols-5 gap-1.5 max-h-[120px] overflow-y-auto pr-0.5">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleColorPresetClick(preset)}
                        className={cn(
                          'relative w-full aspect-square rounded-md border-2 transition-all',
                          selectedColor === preset.name
                            ? 'border-accent ring-1 ring-accent/30 scale-105'
                            : 'border-transparent hover:border-border'
                        )}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.name}
                      >
                        {selectedColor === preset.name && (
                          <Check className="w-3 h-3 absolute inset-0 m-auto text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom hex input + native picker */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">#</span>
                    <Input
                      type="text"
                      placeholder="FFFFFF"
                      value={customHex}
                      onChange={(e) => handleCustomHexChange(e.target.value)}
                      className="pl-6 h-8 text-xs font-mono"
                      maxLength={7}
                    />
                  </div>
                  <label
                    className="relative w-8 h-8 rounded-md border border-border cursor-pointer flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: selectedHex || '#888888' }}
                    title="Open color picker"
                  >
                    <input
                      type="color"
                      value={selectedHex || '#888888'}
                      onChange={(e) => handleCustomHexChange(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
                
                <p className="text-[10px] text-muted-foreground">
                  Selected: {selectedColor} {selectedHex && `(${selectedHex})`}
                </p>
              </>
            )}
          </div>

          {/* Color/Material Sample */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Color/Material Sample
            </Label>

            {/* Saved Swatches */}
            {samples.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Saved Swatches
                </p>
                <div className="grid grid-cols-5 gap-1.5 max-h-[80px] overflow-y-auto">
                  {samples.slice(0, 10).map((sample) => (
                    <div key={sample.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => {
                          setSampleImageUrl(sample.image_url);
                          setAttachSampleToGen(true);
                          if (sample.material) {
                            const matchedMat = materials.find(m => m.value === sample.material);
                            if (matchedMat) setSelectedMaterial(matchedMat.value);
                          }
                          if (sample.color) setSelectedColor(sample.color);
                          if (sample.color_hex) setSelectedHex(sample.color_hex);
                        }}
                        className="relative w-full aspect-square rounded-md border border-border/50 overflow-hidden hover:border-accent transition-all"
                        title={sample.name || `${sample.material} – ${sample.color}`}
                      >
                        <img src={sample.image_url} alt={sample.name || 'Swatch'} className="w-full h-full object-cover" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSampleId(sample.id);
                          setEditMaterial(sample.material || '');
                          setEditColor(sample.color || '');
                          setEditHex(sample.color_hex || '');
                        }}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-background/80 border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit swatch"
                      >
                        <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* Inline edit panel */}
                {editingSampleId && (() => {
                  const editSample = samples.find(s => s.id === editingSampleId);
                  if (!editSample) return null;
                  return (
                    <div className="mt-2 p-2.5 rounded-lg border border-border bg-muted/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <img src={editSample.image_url} alt="Editing" className="w-8 h-8 rounded border border-border/50 object-cover flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground truncate">Editing swatch</span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Material</Label>
                          <Input value={editMaterial} onChange={e => setEditMaterial(e.target.value)} className="h-7 text-xs" placeholder="e.g. Suede" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Color</Label>
                          <Input value={editColor} onChange={e => setEditColor(e.target.value)} className="h-7 text-xs" placeholder="e.g. Thyme" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Hex</Label>
                          <Input value={editHex} onChange={e => setEditHex(e.target.value)} className="h-7 text-xs font-mono" placeholder="#8B9467" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={async () => {
                            await deleteSample(editingSampleId);
                            setEditingSampleId(null);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingSampleId(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-7"
                            onClick={async () => {
                              await updateSample(editingSampleId, {
                                material: editMaterial || undefined,
                                color: editColor || undefined,
                                color_hex: editHex || undefined,
                              });
                              setEditingSampleId(null);
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            
            {sampleImageUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                    <img src={sampleImageUrl} alt="Color sample" className="w-full h-full object-cover" />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        <span className="text-[9px] text-accent mt-0.5">Analyzing</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveSample}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingSample}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-border/50 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
                  >
                    {isUploadingSample ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    Replace
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`attach-sample-${componentType}`}
                    checked={attachSampleToGen}
                    onCheckedChange={(checked) => setAttachSampleToGen(checked === true)}
                  />
                  <Label htmlFor={`attach-sample-${componentType}`} className="text-xs text-muted-foreground cursor-pointer">
                    Attach to generation
                  </Label>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingSample}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed text-xs transition-colors',
                  isUploadingSample
                    ? 'border-muted bg-muted/20 text-muted-foreground cursor-wait'
                    : 'border-border/50 hover:border-border hover:bg-muted/20 text-muted-foreground cursor-pointer'
                )}
              >
                {isUploadingSample ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
                ) : (
                  <><Upload className="w-3.5 h-3.5" /> Upload swatch photo</>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSampleUpload}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs h-8"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="text-xs h-8"
              disabled={!isModified && !override && !sampleImageUrl}
            >
              <Check className="w-3 h-3 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
