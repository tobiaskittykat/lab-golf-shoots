import { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  RefreshCw, 
  Pencil, 
  Trash2, 
  Copy, 
  Check,
  Image as ImageIcon,
  Palette,
  Sparkles,
  AlertCircle,
  Expand,
  ShieldCheck
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
const DialogContentClean = DialogContent;
import { GeneratedImage } from './types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { ProductIntegrityBadge, ProductIntegrityResult } from './product-shoot/ProductIntegrityBadge';
import { Progress } from '@/components/ui/progress';

interface ImageDetailModalProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
  onVariation: (image: GeneratedImage) => void;
  onEdit: (image: GeneratedImage) => void;
  onDelete: (image: GeneratedImage) => void;
}

export const ImageDetailModal = ({
  image,
  isOpen,
  onClose,
  onVariation,
  onEdit,
  onDelete,
}: ImageDetailModalProps) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [resolvedMoodboardUrl, setResolvedMoodboardUrl] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<ProductIntegrityResult | null>(null);
  const [isLoadingIntegrity, setIsLoadingIntegrity] = useState(false);

  // Fetch integrity analysis when image changes
  useEffect(() => {
    if (!image?.id || !isOpen) {
      setIntegrityResult(null);
      return;
    }

    const fetchIntegrity = async () => {
      setIsLoadingIntegrity(true);
      try {
        const { data, error } = await supabase
          .from('generated_images')
          .select('integrity_analysis')
          .eq('id', image.id)
          .maybeSingle();

        if (!error && data?.integrity_analysis) {
          setIntegrityResult(data.integrity_analysis as unknown as ProductIntegrityResult);
        } else {
          setIntegrityResult(null);
        }
      } catch (err) {
        console.error('Error fetching integrity analysis:', err);
      } finally {
        setIsLoadingIntegrity(false);
      }
    };

    fetchIntegrity();

    // Poll for updates if no result yet (analysis might be running)
    const interval = setInterval(async () => {
      if (!integrityResult) {
        const { data } = await supabase
          .from('generated_images')
          .select('integrity_analysis')
          .eq('id', image.id)
          .maybeSingle();

        if (data?.integrity_analysis) {
          setIntegrityResult(data.integrity_analysis as unknown as ProductIntegrityResult);
          clearInterval(interval);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [image?.id, isOpen]);

  // Resolve moodboard URL if we have ID but no URL
  useEffect(() => {
    if (!image) {
      setResolvedMoodboardUrl(null);
      return;
    }

    // Check settings.references for moodboard URL first (most reliable)
    const settingsRefsUrl = (image.settings?.references as { moodboardUrl?: string } | undefined)?.moodboardUrl;
    
    // If we already have the URL from settings.references or direct field, use it
    if (settingsRefsUrl) {
      setResolvedMoodboardUrl(settingsRefsUrl);
      return;
    }
    
    if (image.moodboardUrl) {
      setResolvedMoodboardUrl(image.moodboardUrl);
      return;
    }

    // If we have moodboard ID, fetch the URL
    if (image.moodboardId) {
      const fetchMoodboard = async () => {
        // Strip 'custom-' prefix if present
        const dbId = image.moodboardId!.startsWith('custom-')
          ? image.moodboardId!.replace('custom-', '')
          : image.moodboardId;

        const { data } = await supabase
          .from('custom_moodboards')
          .select('thumbnail_url')
          .eq('id', dbId)
          .maybeSingle();

        if (data?.thumbnail_url) {
          setResolvedMoodboardUrl(data.thumbnail_url);
        }
      };

      fetchMoodboard();
    }
  }, [image?.moodboardId, image?.moodboardUrl, image?.settings]);

  // Format AI model name for display
  const formatModelName = (model: string): string => {
    const modelNames: Record<string, string> = {
      'google/gemini-3-pro-image-preview': 'Gemini 3 Pro',
      'google/gemini-2.5-flash-image-preview': 'Gemini 2.5 Flash',
      'google/gemini-3-flash-preview': 'Gemini 3 Flash',
      'google/gemini-2.5-flash': 'Gemini 2.5 Flash',
    };
    return modelNames[model] || model.split('/').pop() || model;
  };

  if (!image) return null;

  const handleDownload = async () => {
    if (!image.imageUrl) return;
    
    setIsDownloading(true);
    try {
      // Logo is already baked into the image at generation time
      // Just download the image directly
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyPrompt = async () => {
    const textToCopy = image.refinedPrompt || image.prompt;
    await navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleAction = (action: 'variation' | 'edit' | 'delete') => {
    onClose();
    setTimeout(() => {
      if (action === 'variation') onVariation(image);
      else if (action === 'edit') onEdit(image);
      else if (action === 'delete') onDelete(image);
    }, 150);
  };

  const handleImageError = (url: string) => {
    setFailedImages(prev => new Set(prev).add(url));
  };

  // Get product URLs - prefer array from settings.references, fallback to legacy fields
  const settingsRefs = image.settings?.references as { 
    productReferenceUrls?: string[]; 
    moodboardUrl?: string;
    shotTypePrompt?: string;
    sourceImageUrl?: string;
    componentSampleImages?: { component: string; url: string }[];
  } | undefined;
  
  const sourceImageUrl = settingsRefs?.sourceImageUrl;
  const componentSampleImages = settingsRefs?.componentSampleImages || [];
  
  const productUrls = settingsRefs?.productReferenceUrls?.length 
    ? settingsRefs.productReferenceUrls 
    : image.productReferenceUrls || (image.productReferenceUrl ? [image.productReferenceUrl] : []);

  // Get context URLs - prefer array, fallback to single
  const contextUrls = image.contextReferenceUrls || 
    (image.contextReferenceUrl ? [image.contextReferenceUrl] : []);

  // Check if we have any references to show
  const hasReferences = resolvedMoodboardUrl || productUrls.length > 0 || contextUrls.length > 0 || !!sourceImageUrl || componentSampleImages.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContentClean className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-background flex">
          {/* Left Side - Image */}
          <div className="flex-1 bg-secondary/30 flex items-center justify-center p-6 relative min-w-0">
            <div className="relative max-w-full max-h-full">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side - Details */}
          <div className="w-[380px] border-l border-border flex flex-col h-full overflow-hidden">
            {/* Header with actions - fixed height */}
            <div className="p-4 border-b border-border shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {image.conceptTitle || 'Generated Image'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Image Details</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDownload}
                    className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction('variation')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Create Variation
                </button>
                <button
                  onClick={() => handleAction('edit')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Image
                </button>
                <button
                  onClick={() => handleAction('delete')}
                  className="w-9 h-9 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-destructive transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content - shrink-0 header above, this fills remaining space */}
            <div className="flex-1 overflow-y-auto p-4 pb-6 space-y-5">

              {/* Reference Images */}
              {hasReferences && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    Reference Images
                  </div>
                  
                  <div className="space-y-3">
                    {/* Moodboard Reference */}
                    {resolvedMoodboardUrl && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Moodboard (Style)</p>
                        <div 
                          className="aspect-video rounded-lg overflow-hidden border border-border bg-secondary/30 relative group cursor-pointer"
                          onClick={() => !failedImages.has(resolvedMoodboardUrl) && setExpandedImageUrl(resolvedMoodboardUrl)}
                        >
                          {failedImages.has(resolvedMoodboardUrl) ? (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              <span className="text-xs">Couldn't load</span>
                            </div>
                          ) : (
                            <>
                              <img
                                src={resolvedMoodboardUrl}
                                alt="Moodboard reference"
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(resolvedMoodboardUrl)}
                              />
                              {/* Expand hint */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Expand className="w-5 h-5 text-white" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Source Image (Base) */}
                    {sourceImageUrl && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">Source Image (Base)</p>
                        <div 
                          className="aspect-video rounded-lg overflow-hidden border border-border bg-secondary/30 relative group cursor-pointer"
                          onClick={() => !failedImages.has(sourceImageUrl) && setExpandedImageUrl(sourceImageUrl)}
                        >
                          {failedImages.has(sourceImageUrl) ? (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              <span className="text-xs">Couldn't load</span>
                            </div>
                          ) : (
                            <>
                              <img
                                src={sourceImageUrl}
                                alt="Source image (base)"
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(sourceImageUrl)}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Expand className="w-5 h-5 text-white" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Product References (all available) */}
                    {productUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          Product{productUrls.length > 1 ? 's' : ''} ({productUrls.length})
                        </p>
                        <div className={cn(
                          "grid gap-2",
                          productUrls.length <= 3 ? "grid-cols-3" : 
                          productUrls.length <= 4 ? "grid-cols-4" :
                          "grid-cols-5"
                        )}>
                          {productUrls.map((url, idx) => (
                            <div 
                              key={idx} 
                              className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30 relative group cursor-pointer"
                              onClick={() => !failedImages.has(url) && setExpandedImageUrl(url)}
                            >
                              {failedImages.has(url) ? (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={url}
                                    alt={`Product reference ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={() => handleImageError(url)}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Expand className="w-4 h-4 text-white" />
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Context References */}
                    {contextUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          Scene{contextUrls.length > 1 ? 's' : ''} ({contextUrls.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {contextUrls.slice(0, 3).map((url, idx) => (
                            <div 
                              key={idx} 
                              className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30 relative group cursor-pointer"
                              onClick={() => !failedImages.has(url) && setExpandedImageUrl(url)}
                            >
                              {failedImages.has(url) ? (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <AlertCircle className="w-4 h-4" />
                                </div>
                              ) : (
                                <>
                                  <img
                                    src={url}
                                    alt={`Context reference ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={() => handleImageError(url)}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Expand className="w-4 h-4 text-white" />
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
              )}
                  </div>
                </div>
              )}

              {/* Component Sample Swatches */}
              {componentSampleImages.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Palette className="w-4 h-4" />
                    Color/Material Samples
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {componentSampleImages.map((sample, idx) => (
                      <div key={idx} className="space-y-1">
                        <div 
                          className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30 relative group cursor-pointer"
                          onClick={() => !failedImages.has(sample.url) && setExpandedImageUrl(sample.url)}
                        >
                          {failedImages.has(sample.url) ? (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                          ) : (
                            <>
                              <img
                                src={sample.url}
                                alt={`${sample.component} sample`}
                                className="w-full h-full object-cover"
                                onError={() => handleImageError(sample.url)}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Expand className="w-4 h-4 text-white" />
                              </div>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center capitalize">{sample.component}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {image.refinedPrompt && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Sparkles className="w-4 h-4" />
                      Image Prompt
                    </div>
                    <button
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {image.refinedPrompt}
                    </p>
                  </div>
                </div>
              )}

              {/* Product Integrity Analysis */}
              {(integrityResult || isLoadingIntegrity) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ShieldCheck className="w-4 h-4" />
                      Product Integrity
                    </div>
                    {integrityResult && (
                      <ProductIntegrityBadge
                        result={integrityResult}
                        isAnalyzing={isLoadingIntegrity}
                        onRegenerate={() => handleAction('variation')}
                      />
                    )}
                  </div>
                  
                  {isLoadingIntegrity && !integrityResult && (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border text-center">
                      <p className="text-sm text-muted-foreground">Analyzing product fidelity...</p>
                    </div>
                  )}
                  
                  {integrityResult && integrityResult.details && (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
                      {/* Score breakdown with progress bars */}
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Color Match</span>
                            <span className="font-medium">{integrityResult.details.colorMatch.score}%</span>
                          </div>
                          <Progress value={integrityResult.details.colorMatch.score} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Silhouette</span>
                            <span className="font-medium">{integrityResult.details.silhouetteMatch.score}%</span>
                          </div>
                          <Progress value={integrityResult.details.silhouetteMatch.score} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Features</span>
                            <span className="font-medium">{integrityResult.details.featureMatch.score}%</span>
                          </div>
                          <Progress value={integrityResult.details.featureMatch.score} className="h-1.5" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Materials</span>
                            <span className="font-medium">{integrityResult.details.materialMatch.score}%</span>
                          </div>
                          <Progress value={integrityResult.details.materialMatch.score} className="h-1.5" />
                        </div>
                      </div>
                      
                      {/* Issues list */}
                      {integrityResult.issues.length > 0 && (
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Issues Detected:</p>
                          <ul className="space-y-1">
                            {integrityResult.issues.map((issue, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-xs">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                <span className="text-foreground/80">{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Regenerate button if failed check */}
                      {!integrityResult.passesCheck && (
                        <button
                          onClick={() => handleAction('variation')}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Regenerate with Focus on Fidelity
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Generation Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  Generation Info
                </div>
                
                <div className="space-y-2 text-sm">
                  {/* AI Model */}
                  {image.settings?.aiModel && (
                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-xs font-medium">{formatModelName(image.settings.aiModel)}</span>
                    </div>
                  )}
                  
                  {/* Aspect Ratio */}
                  {image.settings?.aspectRatio && (
                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Aspect Ratio</span>
                      <span className="text-xs font-medium">{image.settings.aspectRatio}</span>
                    </div>
                  )}
                  
                  {/* Resolution */}
                  {image.settings?.resolution && (
                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Resolution</span>
                      <span className="text-xs font-medium">{image.settings.resolution}px</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      image.status === 'completed' && "bg-green-500/10 text-green-600",
                      image.status === 'failed' && "bg-destructive/10 text-destructive",
                      image.status === 'pending' && "bg-secondary text-muted-foreground"
                    )}>
                      {image.status === 'completed' ? 'Completed' : image.status === 'failed' ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Image ID</span>
                    <span className="font-mono text-xs text-muted-foreground">{image.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContentClean>
      </Dialog>

      {/* Expanded Image Dialog - must be outside the main Dialog */}
      <Dialog open={!!expandedImageUrl} onOpenChange={(open) => !open && setExpandedImageUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2 bg-black/95">
          <button
            onClick={() => setExpandedImageUrl(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {expandedImageUrl && (
            <img
              src={expandedImageUrl}
              alt="Expanded reference"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
