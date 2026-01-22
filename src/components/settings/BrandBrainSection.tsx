import { useState, useEffect, useRef, useCallback } from "react";
import { Brain, Upload, Trash2, RefreshCw, Palette, Camera, Type, Sparkles, X, Edit2, Check, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useBrandImages, BrandBrain, VisualDNA, ColorPalette, ModelStyling } from "@/hooks/useBrandImages";
import { useBrands } from "@/hooks/useBrands";
import { cn } from "@/lib/utils";

const IMAGE_CATEGORIES = [
  { value: "logo", label: "Logo" },
  { value: "campaign", label: "Campaign" },
  { value: "product", label: "Product" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "texture", label: "Texture" },
  { value: "general", label: "General" },
];

interface BrandBrainSectionProps {
  variant?: "standalone" | "embedded";
}

export function BrandBrainSection({ variant = "standalone" }: BrandBrainSectionProps) {
  const { currentBrand } = useBrands();
  const {
    images,
    isLoading,
    isUploading,
    isRegenerating,
    isScraping,
    fetchImages,
    uploadImage,
    deleteImage,
    regenerateBrandBrain,
    getBrandBrain,
    updateBrandBrain,
    scrapeFromWebsite,
  } = useBrandImages();

  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [isEditingDNA, setIsEditingDNA] = useState(false);
  const [isEditingModelStyling, setIsEditingModelStyling] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [editedPalette, setEditedPalette] = useState<ColorPalette>({
    description: "",
    foundation: [],
    accents: [],
    seasonalPops: [],
  });
  const [editedAvoid, setEditedAvoid] = useState<string[]>([]);
  const [editedPhotographyStyle, setEditedPhotographyStyle] = useState("");
  const [editedColorMood, setEditedColorMood] = useState("");
  const [editedLightingStyle, setEditedLightingStyle] = useState("");
  const [editedTextures, setEditedTextures] = useState<string[]>([]);
  const [editedModelStyling, setEditedModelStyling] = useState<ModelStyling>({
    usesModels: false,
    demographics: "",
    expression: "",
    poseStyle: "",
    stylingAesthetic: "",
    hairAndMakeup: "",
    bodyLanguage: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brandBrain = getBrandBrain();

  // Load images on mount and when brand changes
  useEffect(() => {
    if (currentBrand) {
      fetchImages();
    }
  }, [currentBrand?.id, fetchImages]);

  // Sync edited values when brandBrain changes
  useEffect(() => {
    if (brandBrain) {
      setEditedSummary(brandBrain.creativeDirectionSummary || "");
      // Handle backwards compatibility - convert old primaryColors to new colorPalette
      const palette = brandBrain.visualDNA?.colorPalette || {
        description: brandBrain.visualDNA?.colorMood || "Brand color palette",
        foundation: brandBrain.visualDNA?.primaryColors?.slice(0, 3) || [],
        accents: brandBrain.visualDNA?.primaryColors?.slice(3) || [],
        seasonalPops: [],
      };
      setEditedPalette(palette);
      setEditedAvoid(brandBrain.visualDNA?.avoidElements || []);
      setEditedPhotographyStyle(brandBrain.visualDNA?.photographyStyle || "");
      setEditedColorMood(brandBrain.visualDNA?.colorMood || "");
      setEditedLightingStyle(brandBrain.visualDNA?.lightingStyle || "");
      setEditedTextures(brandBrain.visualDNA?.texturePreferences || []);
      // Sync model styling
      setEditedModelStyling(brandBrain.visualDNA?.modelStyling || {
        usesModels: false,
        demographics: "",
        expression: "",
        poseStyle: "",
        stylingAesthetic: "",
        hairAndMakeup: "",
        bodyLanguage: "",
      });
    }
  }, [brandBrain]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      await uploadImage(file, selectedCategory);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [uploadImage, selectedCategory]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await uploadImage(file, selectedCategory);
      }
    }
  }, [uploadImage, selectedCategory]);

  const handleSaveSummary = async () => {
    await updateBrandBrain({ creativeDirectionSummary: editedSummary });
    setIsEditingSummary(false);
  };

  const handleSaveDNA = async () => {
    if (!brandBrain) return;
    
    const updatedDNA: VisualDNA = {
      ...brandBrain.visualDNA,
      colorPalette: editedPalette,
      avoidElements: editedAvoid,
      photographyStyle: editedPhotographyStyle,
      colorMood: editedColorMood,
      lightingStyle: editedLightingStyle,
      texturePreferences: editedTextures,
    };
    
    await updateBrandBrain({ visualDNA: updatedDNA });
    setIsEditingDNA(false);
  };

  const updatePaletteField = (field: keyof ColorPalette, value: string | string[]) => {
    setEditedPalette(prev => ({ ...prev, [field]: value }));
  };

  const addToPaletteArray = (field: 'foundation' | 'accents' | 'seasonalPops', value: string) => {
    if (value.trim() && !editedPalette[field]?.includes(value.trim())) {
      setEditedPalette(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
    }
  };

  const removeFromPaletteArray = (field: 'foundation' | 'accents' | 'seasonalPops', index: number) => {
    setEditedPalette(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };


  const addAvoidItem = (item: string) => {
    if (item.trim() && !editedAvoid.includes(item.trim())) {
      setEditedAvoid([...editedAvoid, item.trim()]);
    }
  };

  const removeAvoidItem = (index: number) => {
    setEditedAvoid(editedAvoid.filter((_, i) => i !== index));
  };

  const updateModelStylingField = (field: keyof ModelStyling, value: string | boolean) => {
    setEditedModelStyling(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveModelStyling = async () => {
    if (!brandBrain) return;
    
    const updatedDNA: VisualDNA = {
      ...brandBrain.visualDNA,
      modelStyling: editedModelStyling,
    };
    
    await updateBrandBrain({ visualDNA: updatedDNA });
    setIsEditingModelStyling(false);
  };

  if (!currentBrand) {
    return null;
  }

  const content = (
    <div className="space-y-6">
      {/* Header for embedded mode */}
      {variant === "embedded" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
              <Brain className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                Brand Brain
                {brandBrain && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                Visual identity synthesized from your brand assets
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => regenerateBrandBrain()}
            disabled={isRegenerating || images.length === 0}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRegenerating && "animate-spin")} />
            {isRegenerating ? `Analyzing ${images.length} images...` : "Regenerate"}
          </Button>
        </div>
      )}

      {/* Image Upload Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Brand Reference Images</h4>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs border rounded px-2 py-1 bg-background"
            >
              {IMAGE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrapeFromWebsite()}
              disabled={isScraping || !currentBrand?.website}
              title={!currentBrand?.website ? "Add a website URL to your brand first" : "Scrape lifestyle images from website"}
            >
              <Globe className="h-4 w-4 mr-2" />
              {isScraping ? "Scraping..." : "Scrape Website"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Drop Zone / Image Grid */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "border-2 border-dashed rounded-lg p-4 transition-colors",
            "hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading images...
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Drop brand images here or click upload</p>
              <p className="text-xs mt-1">Logo, campaign shots, product photos, lifestyle imagery</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square">
                  <img
                    src={img.thumbnail_url || img.image_url}
                    alt={img.category}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:text-destructive"
                      onClick={() => deleteImage(img.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0"
                  >
                    {img.category}
                  </Badge>
                  {img.visual_analysis && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visual DNA Section */}
      {brandBrain && (
        <>
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Visual DNA
              </h4>
              {isEditingDNA ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingDNA(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveDNA}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingDNA(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            <div className="space-y-4 text-sm">
              {/* Color Palette - Full Width */}
              <div className="space-y-3">
                <span className="text-muted-foreground">Color Palette</span>
                
                {/* Palette Description */}
                {(() => {
                  const palette = isEditingDNA 
                    ? editedPalette 
                    : (brandBrain.visualDNA.colorPalette || {
                        description: brandBrain.visualDNA.colorMood || "Brand color palette",
                        foundation: brandBrain.visualDNA.primaryColors?.slice(0, 3) || [],
                        accents: brandBrain.visualDNA.primaryColors?.slice(3) || [],
                        seasonalPops: [],
                      });
                  
                  return (
                    <>
                      {isEditingDNA ? (
                        <Input
                          value={editedPalette.description}
                          onChange={(e) => updatePaletteField('description', e.target.value)}
                          placeholder="Describe the palette character..."
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-foreground font-medium">{palette.description}</p>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        {/* Foundation Colors */}
                        <div className="space-y-1.5">
                          <span className="text-muted-foreground">Foundation</span>
                          <div className="flex flex-wrap gap-1">
                            {palette.foundation?.map((color, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className={cn("text-xs", isEditingDNA && "pr-1")}
                              >
                                {color}
                                {isEditingDNA && (
                                  <X
                                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                                    onClick={() => removeFromPaletteArray('foundation', i)}
                                  />
                                )}
                              </Badge>
                            ))}
                            {isEditingDNA && (
                              <Input
                                placeholder="Add..."
                                className="h-6 w-20 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addToPaletteArray('foundation', (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Accent Colors */}
                        <div className="space-y-1.5">
                          <span className="text-muted-foreground">Accents</span>
                          <div className="flex flex-wrap gap-1">
                            {palette.accents?.map((color, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className={cn("text-xs", isEditingDNA && "pr-1")}
                              >
                                {color}
                                {isEditingDNA && (
                                  <X
                                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                                    onClick={() => removeFromPaletteArray('accents', i)}
                                  />
                                )}
                              </Badge>
                            ))}
                            {isEditingDNA && (
                              <Input
                                placeholder="Add..."
                                className="h-6 w-20 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addToPaletteArray('accents', (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Seasonal Pops */}
                        <div className="space-y-1.5">
                          <span className="text-muted-foreground">Seasonal Pops</span>
                          <div className="flex flex-wrap gap-1">
                            {palette.seasonalPops?.map((color, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className={cn("text-xs border-dashed", isEditingDNA && "pr-1")}
                              >
                                {color}
                                {isEditingDNA && (
                                  <X
                                    className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                                    onClick={() => removeFromPaletteArray('seasonalPops', i)}
                                  />
                                )}
                              </Badge>
                            ))}
                            {isEditingDNA && (
                              <Input
                                placeholder="Add..."
                                className="h-6 w-20 text-xs"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    addToPaletteArray('seasonalPops', (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                            )}
                            {!isEditingDNA && (!palette.seasonalPops || palette.seasonalPops.length === 0) && (
                              <span className="text-muted-foreground italic">None defined</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Color Mood */}
                <div className="space-y-2">
                  <span className="text-muted-foreground">Color Mood</span>
                  {isEditingDNA ? (
                    <Input
                      value={editedColorMood}
                      onChange={(e) => setEditedColorMood(e.target.value)}
                      placeholder="e.g., warm and inviting, cool and sophisticated"
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-foreground">{brandBrain.visualDNA.colorMood}</p>
                  )}
                </div>

                {/* Photography Style */}
                <div className="space-y-2">
                  <span className="text-muted-foreground">Photography Style</span>
                  {isEditingDNA ? (
                    <Textarea
                      value={editedPhotographyStyle}
                      onChange={(e) => setEditedPhotographyStyle(e.target.value)}
                      placeholder="Describe your photography style..."
                      className="text-sm min-h-[60px]"
                    />
                  ) : (
                    <p className="text-foreground">{brandBrain.visualDNA.photographyStyle}</p>
                  )}
                </div>

                {/* Lighting */}
                <div className="space-y-2">
                  <span className="text-muted-foreground">Lighting</span>
                  {isEditingDNA ? (
                    <Input
                      value={editedLightingStyle}
                      onChange={(e) => setEditedLightingStyle(e.target.value)}
                      placeholder="e.g., soft natural light, dramatic studio lighting"
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-foreground">{brandBrain.visualDNA.lightingStyle}</p>
                  )}
                </div>

                {/* Textures */}
                <div className="space-y-2">
                  <span className="text-muted-foreground">Textures</span>
                  <div className="flex flex-wrap gap-1">
                    {(isEditingDNA ? editedTextures : brandBrain.visualDNA.texturePreferences).map((tex, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn("text-xs", isEditingDNA && "pr-1")}
                      >
                        {tex}
                        {isEditingDNA && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                            onClick={() => setEditedTextures(editedTextures.filter((_, idx) => idx !== i))}
                          />
                        )}
                      </Badge>
                    ))}
                    {isEditingDNA && (
                      <Input
                        placeholder="Add..."
                        className="h-6 w-20 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const value = (e.target as HTMLInputElement).value.trim();
                            if (value && !editedTextures.includes(value)) {
                              setEditedTextures([...editedTextures, value]);
                            }
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Avoid */}
                <div className="space-y-2">
                  <span className="text-muted-foreground">Avoid</span>
                  <div className="flex flex-wrap gap-1">
                    {(isEditingDNA ? editedAvoid : brandBrain.visualDNA.avoidElements).map((item, i) => (
                      <Badge
                        key={i}
                        variant="destructive"
                        className={cn("text-xs", isEditingDNA && "pr-1")}
                      >
                        {item}
                        {isEditingDNA && (
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => removeAvoidItem(i)}
                          />
                        )}
                      </Badge>
                    ))}
                    {isEditingDNA && (
                      <Input
                        placeholder="Add..."
                        className="h-6 w-20 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addAvoidItem((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Styling Section */}
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Model Styling
                {brandBrain.visualDNA?.modelStyling?.usesModels && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
              </h4>
              {isEditingModelStyling ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingModelStyling(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveModelStyling}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingModelStyling(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {(() => {
              const modelStyling = isEditingModelStyling 
                ? editedModelStyling 
                : brandBrain.visualDNA?.modelStyling;
              
              if (!modelStyling?.usesModels && !isEditingModelStyling) {
                return (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p>No model styling guidelines detected. This brand may not use models in imagery, or no lifestyle/campaign photos have been analyzed yet.</p>
                    <p className="mt-2 text-xs">Regenerate the Brand Brain after uploading lifestyle or campaign photos with models to auto-detect styling patterns.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4 text-sm">
                  {/* Uses Models Toggle (only in edit mode) */}
                  {isEditingModelStyling && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="usesModels"
                        checked={editedModelStyling.usesModels}
                        onChange={(e) => updateModelStylingField('usesModels', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="usesModels" className="text-sm">Brand uses models in imagery</label>
                    </div>
                  )}

                  {(modelStyling?.usesModels || isEditingModelStyling) && (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Demographics */}
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground text-xs">Demographics</span>
                        {isEditingModelStyling ? (
                          <Input
                            value={editedModelStyling.demographics}
                            onChange={(e) => updateModelStylingField('demographics', e.target.value)}
                            placeholder="e.g., diverse, young professionals, 25-35"
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-foreground">{modelStyling?.demographics || "Not specified"}</p>
                        )}
                      </div>

                      {/* Expression */}
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground text-xs">Expression</span>
                        {isEditingModelStyling ? (
                          <Input
                            value={editedModelStyling.expression}
                            onChange={(e) => updateModelStylingField('expression', e.target.value)}
                            placeholder="e.g., confident, subtle smile, candid"
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-foreground">{modelStyling?.expression || "Not specified"}</p>
                        )}
                      </div>

                      {/* Pose Style */}
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground text-xs">Pose Style</span>
                        {isEditingModelStyling ? (
                          <Input
                            value={editedModelStyling.poseStyle}
                            onChange={(e) => updateModelStylingField('poseStyle', e.target.value)}
                            placeholder="e.g., natural, relaxed, lifestyle in motion"
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-foreground">{modelStyling?.poseStyle || "Not specified"}</p>
                        )}
                      </div>

                      {/* Wardrobe/Styling */}
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground text-xs">Wardrobe/Styling</span>
                        {isEditingModelStyling ? (
                          <Input
                            value={editedModelStyling.stylingAesthetic}
                            onChange={(e) => updateModelStylingField('stylingAesthetic', e.target.value)}
                            placeholder="e.g., minimalist, elevated casual"
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-foreground">{modelStyling?.stylingAesthetic || "Not specified"}</p>
                        )}
                      </div>

                      {/* Hair & Makeup */}
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground text-xs">Hair & Makeup</span>
                        {isEditingModelStyling ? (
                          <Input
                            value={editedModelStyling.hairAndMakeup}
                            onChange={(e) => updateModelStylingField('hairAndMakeup', e.target.value)}
                            placeholder="e.g., natural glam, soft waves, dewy skin"
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-foreground">{modelStyling?.hairAndMakeup || "Not specified"}</p>
                        )}
                      </div>

                      {/* Body Language */}
                      <div className="space-y-1.5">
                        <span className="text-muted-foreground text-xs">Body Language</span>
                        {isEditingModelStyling ? (
                          <Input
                            value={editedModelStyling.bodyLanguage}
                            onChange={(e) => updateModelStylingField('bodyLanguage', e.target.value)}
                            placeholder="e.g., open, approachable, dynamic"
                            className="text-sm"
                          />
                        ) : (
                          <p className="text-foreground">{modelStyling?.bodyLanguage || "Not specified"}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Brand Voice */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Type className="h-4 w-4" />
              Brand Voice
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Personality</span>
                <p className="font-medium capitalize">{brandBrain.brandVoice.personality}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Tone</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {brandBrain.brandVoice.toneDescriptors.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Messaging</span>
                <p>{brandBrain.brandVoice.messagingStyle}</p>
              </div>
            </div>
          </div>

          {/* Creative Direction Summary */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Creative Direction Summary
              </h4>
              {isEditingSummary ? (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingSummary(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveSummary}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingSummary(true)}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingSummary ? (
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="min-h-[100px]"
                placeholder="Describe your brand's creative direction..."
              />
            ) : (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {brandBrain.creativeDirectionSummary}
              </p>
            )}
          </div>

          {/* Last Generated */}
          <div className="text-xs text-muted-foreground text-right">
            Last generated: {new Date(brandBrain.generatedAt).toLocaleString()}
          </div>
        </>
      )}

      {/* Empty State */}
      {!brandBrain && images.length > 0 && (
        <div className="border-t pt-4">
          <div className="text-center py-6 bg-muted/30 rounded-lg">
            <Brain className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">
              You have {images.length} brand images uploaded. Generate your Brand Brain to create a visual identity profile.
            </p>
            <Button onClick={regenerateBrandBrain} disabled={isRegenerating}>
              <Sparkles className={cn("h-4 w-4 mr-2", isRegenerating && "animate-spin")} />
              {isRegenerating ? `Analyzing ${images.length} images...` : "Generate Brand Brain"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Embedded mode: just return content in a glass card
  if (variant === "embedded") {
    return <div className="glass-card p-6">{content}</div>;
  }

  // Standalone mode: wrap in collapsible Card
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <Brain className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    Brand Brain
                    {brandBrain && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Visual identity synthesized from your brand assets
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    regenerateBrandBrain();
                  }}
                  disabled={isRegenerating || images.length === 0}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRegenerating && "animate-spin")} />
                  {isRegenerating ? `Analyzing ${images.length} images...` : "Regenerate"}
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent>{content}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
