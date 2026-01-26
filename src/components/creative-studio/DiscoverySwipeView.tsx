import { useState, useCallback } from 'react';
import { Heart, X, ChevronLeft, ChevronRight, Loader2, SkipForward } from 'lucide-react';
import { GeneratedImage, Concept, sampleContextReferences, CampaignStyle } from './types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DiscoverySwipeViewProps {
  images: GeneratedImage[];
  concepts: Concept[];
  onToggleLike: (imageId: string, liked: boolean) => void;
  onComplete: (style: CampaignStyle) => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const DiscoverySwipeView = ({
  images,
  concepts,
  onToggleLike,
  onComplete,
  onBack,
  isGenerating,
}: DiscoverySwipeViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const completedImages = images.filter(img => img.status === 'completed');
  const currentImage = completedImages[currentIndex];
  const progress = completedImages.length > 0 ? ((currentIndex + 1) / completedImages.length) * 100 : 0;
  
  // Count stats
  const likedCount = images.filter(img => img.liked === true).length;
  const dislikedCount = images.filter(img => img.liked === false).length;
  const reviewedCount = images.filter(img => img.liked !== null && img.liked !== undefined).length;
  
  // Get current image metadata
  const shotType = currentImage?.shotType 
    ? sampleContextReferences.find(s => s.id === currentImage.shotType)
    : null;
  const concept = currentImage?.conceptId
    ? concepts.find(c => c.id === currentImage.conceptId)
    : null;
  
  // Handle actions
  const handleLike = useCallback(() => {
    if (!currentImage) return;
    onToggleLike(currentImage.id, true);
    setImageLoaded(false);
    if (currentIndex < completedImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentImage, currentIndex, completedImages.length, onToggleLike]);
  
  const handleDislike = useCallback(() => {
    if (!currentImage) return;
    onToggleLike(currentImage.id, false);
    setImageLoaded(false);
    if (currentIndex < completedImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentImage, currentIndex, completedImages.length, onToggleLike]);
  
  const handleSkip = useCallback(() => {
    setImageLoaded(false);
    if (currentIndex < completedImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, completedImages.length]);
  
  const handlePrevious = useCallback(() => {
    setImageLoaded(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);
  
  // Calculate campaign style and complete
  const handleFinish = useCallback(() => {
    const likedImages = images.filter(img => img.liked === true);
    
    // Aggregate by concept
    const conceptCounts: Record<string, { conceptTitle: string; count: number }> = {};
    likedImages.forEach(img => {
      if (img.conceptId) {
        if (!conceptCounts[img.conceptId]) {
          const c = concepts.find(c => c.id === img.conceptId);
          conceptCounts[img.conceptId] = { conceptTitle: c?.title || 'Unknown', count: 0 };
        }
        conceptCounts[img.conceptId].count++;
      }
    });
    
    // Aggregate by shot type
    const shotCounts: Record<string, { shotName: string; count: number }> = {};
    likedImages.forEach(img => {
      if (img.shotType) {
        if (!shotCounts[img.shotType]) {
          const s = sampleContextReferences.find(s => s.id === img.shotType);
          shotCounts[img.shotType] = { shotName: s?.name || 'Unknown', count: 0 };
        }
        shotCounts[img.shotType].count++;
      }
    });
    
    // Collect moodboard IDs
    const moodboardIds = [...new Set(likedImages.map(img => img.moodboardId).filter(Boolean))] as string[];
    
    const style: CampaignStyle = {
      likedConcepts: Object.entries(conceptCounts)
        .map(([conceptId, data]) => ({ conceptId, ...data }))
        .sort((a, b) => b.count - a.count),
      likedShotTypes: Object.entries(shotCounts)
        .map(([shotType, data]) => ({ shotType, ...data }))
        .sort((a, b) => b.count - a.count),
      likedMoodboards: moodboardIds,
      totalLiked: likedCount,
      totalReviewed: reviewedCount,
    };
    
    onComplete(style);
  }, [images, concepts, likedCount, reviewedCount, onComplete]);
  
  // Show loading state
  if (isGenerating && completedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-muted-foreground">Generating discovery images...</p>
      </div>
    );
  }
  
  // Check if all images reviewed
  const allReviewed = currentIndex >= completedImages.length - 1 && reviewedCount >= completedImages.length;
  
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="text-sm font-medium">
          {currentIndex + 1} / {completedImages.length}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-500/30">
            <Heart className="w-3 h-3 mr-1 fill-current" />
            {likedCount}
          </Badge>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="px-4 py-2">
        <Progress value={progress} className="h-1" />
      </div>
      
      {/* Main image card */}
      <div className="flex-1 p-4">
        {currentImage ? (
          <div className="relative h-full rounded-2xl overflow-hidden border-2 border-border bg-secondary/30">
            {/* Image */}
            <div className="aspect-square relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
              <img
                src={currentImage.imageUrl}
                alt={currentImage.conceptTitle || 'Discovery image'}
                className={cn(
                  "w-full h-full object-cover transition-opacity",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />
              
              {/* Like/Dislike indicator */}
              {currentImage.liked === true && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current" />
                  Liked
                </div>
              )}
              {currentImage.liked === false && (
                <div className="absolute top-4 right-4 bg-destructive text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <X className="w-4 h-4" />
                  Disliked
                </div>
              )}
            </div>
            
            {/* Metadata */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <div className="text-white">
                <h4 className="font-semibold truncate">{concept?.title || 'Untitled'}</h4>
                <p className="text-sm text-white/70">{shotType?.name || 'Unknown shot'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No images to review
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="p-4 border-t border-border">
        {allReviewed || currentIndex >= completedImages.length - 1 ? (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              You've reviewed all images!
            </p>
            <Button 
              onClick={handleFinish} 
              className="w-full gap-2"
              disabled={likedCount === 0}
            >
              <Heart className="w-4 h-4" />
              See Campaign Style ({likedCount} liked)
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            {/* Previous */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Dislike */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleDislike}
              className={cn(
                "w-14 h-14 rounded-full transition-all",
                currentImage?.liked === false && "bg-destructive text-white border-destructive"
              )}
            >
              <X className="w-6 h-6" />
            </Button>
            
            {/* Skip */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="w-10 h-10 rounded-full"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
            
            {/* Like */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleLike}
              className={cn(
                "w-14 h-14 rounded-full transition-all",
                currentImage?.liked === true && "bg-green-500 text-white border-green-500"
              )}
            >
              <Heart className={cn("w-6 h-6", currentImage?.liked === true && "fill-current")} />
            </Button>
            
            {/* Next */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleSkip}
              disabled={currentIndex >= completedImages.length - 1}
              className="w-12 h-12 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
