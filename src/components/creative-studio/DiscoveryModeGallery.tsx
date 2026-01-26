import { useState } from 'react';
import { Heart, X, Sparkles, Loader2, RefreshCw, Smartphone } from 'lucide-react';
import { GeneratedImage, Concept, sampleContextReferences } from './types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DiscoveryModeGalleryProps {
  images: GeneratedImage[];
  concepts: Concept[];
  onToggleLike: (imageId: string, liked: boolean) => void;
  onGenerateMore: () => void;
  onSwitchToSwipe: () => void;
  isGenerating: boolean;
  isGeneratingMore: boolean;
}

// Discovery image card with like/dislike
const DiscoveryImageCard = ({
  image,
  onToggleLike,
}: {
  image: GeneratedImage;
  onToggleLike: (liked: boolean) => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const shotType = sampleContextReferences.find(s => s.id === image.shotType);
  
  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden border-2 transition-all group",
      image.liked === true && "border-green-500 ring-2 ring-green-500/20",
      image.liked === false && "border-destructive/50 opacity-50",
      image.liked === null && "border-border hover:border-muted-foreground/50"
    )}>
      {/* Image */}
      <div className="aspect-square relative bg-secondary/30">
        {image.status === 'pending' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : image.status === 'completed' && (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
            <img
              src={image.imageUrl}
              alt={image.conceptTitle || 'Generated image'}
              className={cn(
                "w-full h-full object-cover transition-opacity",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}
        
        {/* Shot type badge */}
        {shotType && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-black/60 text-white border-0">
              {shotType.name}
            </Badge>
          </div>
        )}
        
        {/* Like/Dislike overlay - always visible on mobile, hover on desktop */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
          "flex items-end justify-center gap-2 pb-3",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        )}>
          <button
            onClick={() => onToggleLike(false)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              image.liked === false 
                ? "bg-destructive text-white" 
                : "bg-white/90 hover:bg-white text-muted-foreground hover:text-destructive"
            )}
            title="Dislike"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => onToggleLike(true)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              image.liked === true 
                ? "bg-green-500 text-white" 
                : "bg-white/90 hover:bg-white text-muted-foreground hover:text-green-500"
            )}
            title="Like"
          >
            <Heart className={cn("w-5 h-5", image.liked === true && "fill-current")} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DiscoveryModeGallery = ({
  images,
  concepts,
  onToggleLike,
  onGenerateMore,
  onSwitchToSwipe,
  isGenerating,
  isGeneratingMore,
}: DiscoveryModeGalleryProps) => {
  const likedCount = images.filter(img => img.liked === true).length;
  const completedCount = images.filter(img => img.status === 'completed').length;
  const totalExpected = concepts.length * sampleContextReferences.length; // 3 concepts × 4 shots = 12
  
  // Group images by concept
  const imagesByConceptId: Record<string, GeneratedImage[]> = {};
  images.forEach(img => {
    const conceptId = img.conceptId || 'unknown';
    if (!imagesByConceptId[conceptId]) {
      imagesByConceptId[conceptId] = [];
    }
    imagesByConceptId[conceptId].push(img);
  });
  
  // Get concepts in order
  const orderedConcepts = concepts.filter(c => imagesByConceptId[c.id]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Discovery Mode
          </h3>
          <p className="text-sm text-muted-foreground">
            {isGenerating 
              ? `Generating ${completedCount}/${totalExpected} images...`
              : `Select the images you like to generate more like them`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {likedCount > 0 && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
              {likedCount} liked
            </Badge>
          )}
          
          <Button
            variant="outline"
            onClick={onSwitchToSwipe}
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Swipe Mode
          </Button>
          
          <Button
            onClick={onGenerateMore}
            disabled={likedCount === 0 || isGeneratingMore}
            className="gap-2"
          >
            {isGeneratingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Generate More ({likedCount})
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Grid: Columns = concepts, Rows = shot types */}
      <div className="space-y-4">
        {/* Concept headers */}
        <div className={cn(
          "grid gap-3",
          orderedConcepts.length === 3 && "grid-cols-3",
          orderedConcepts.length === 2 && "grid-cols-2",
          orderedConcepts.length === 1 && "grid-cols-1"
        )}>
          {orderedConcepts.map(concept => (
            <div key={concept.id} className="text-center">
              <h4 className="font-medium text-sm truncate" title={concept.title}>
                {concept.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {concept.coreIdea || concept.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Image grid - organized by shot type rows */}
        {sampleContextReferences.map(shotType => (
          <div key={shotType.id} className="space-y-1">
            <div className="text-xs text-muted-foreground font-medium pl-1">
              {shotType.name}
            </div>
            <div className={cn(
              "grid gap-3",
              orderedConcepts.length === 3 && "grid-cols-3",
              orderedConcepts.length === 2 && "grid-cols-2",
              orderedConcepts.length === 1 && "grid-cols-1"
            )}>
              {orderedConcepts.map(concept => {
                const conceptImages = imagesByConceptId[concept.id] || [];
                const image = conceptImages.find(img => img.shotType === shotType.id);
                
                if (!image) {
                  // Placeholder for pending/missing image
                  return (
                    <div 
                      key={`${concept.id}-${shotType.id}`}
                      className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center border border-dashed border-border"
                    >
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  );
                }
                
                return (
                  <DiscoveryImageCard
                    key={image.id}
                    image={image}
                    onToggleLike={(liked) => onToggleLike(image.id, liked)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary footer */}
      {!isGenerating && completedCount > 0 && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {likedCount === 0 
                ? "Tap the heart on images you like" 
                : `${likedCount} image${likedCount !== 1 ? 's' : ''} selected`
              }
            </span>
            <span className="text-muted-foreground">
              {images.filter(img => img.liked === false).length} disliked
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
