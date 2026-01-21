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
  Expand
} from 'lucide-react';
import { Dialog, DialogContent, DialogContentClean } from '@/components/ui/dialog';
import { GeneratedImage } from './types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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

  // Resolve moodboard URL if we have ID but no URL
  useEffect(() => {
    if (!image) {
      setResolvedMoodboardUrl(null);
      return;
    }

    // If we already have the URL, use it
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
  }, [image?.moodboardId, image?.moodboardUrl]);

  if (!image) return null;

  const handleDownload = async () => {
    if (!image.imageUrl) return;
    
    try {
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

  // Get product URLs - prefer array, fallback to single
  const productUrls = image.productReferenceUrls || 
    (image.productReferenceUrl ? [image.productReferenceUrl] : []);

  // Get context URLs - prefer array, fallback to single
  const contextUrls = image.contextReferenceUrls || 
    (image.contextReferenceUrl ? [image.contextReferenceUrl] : []);

  // Check if we have any references to show
  const hasReferences = resolvedMoodboardUrl || productUrls.length > 0 || contextUrls.length > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContentClean className="max-w-6xl w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-background flex">
          {/* Left Side - Image */}
          <div className="flex-1 bg-secondary/30 flex items-center justify-center p-6 relative min-w-0">
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
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
                    
                    {/* Product References (up to 3) */}
                    {productUrls.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          Product{productUrls.length > 1 ? 's' : ''} ({productUrls.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {productUrls.slice(0, 3).map((url, idx) => (
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

              {/* Image Prompt */}
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

              {/* Generation Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  Generation Info
                </div>
                
                <div className="space-y-2 text-sm">
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
