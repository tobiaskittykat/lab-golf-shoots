import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Upload, Sparkles, Loader2 } from 'lucide-react';

interface UploadProgressViewProps {
  uploadProgress: number;
  analysisProgress: number;
  imageCount: number;
}

export function UploadProgressView({
  uploadProgress,
  analysisProgress,
  imageCount,
}: UploadProgressViewProps) {
  const isUploading = uploadProgress < 100;
  const isAnalyzing = uploadProgress >= 100 && analysisProgress < 100;

  return (
    <div className="py-12 space-y-8">
      {/* Upload step */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <Upload className="w-3 h-3 text-accent-foreground" />
            </div>
          )}
          <span className={isUploading ? 'font-medium' : 'text-muted-foreground'}>
            Uploading {imageCount} images...
          </span>
        </div>
        <Progress value={uploadProgress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {uploadProgress}%
        </p>
      </div>

      {/* Analysis step */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {isAnalyzing ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          ) : analysisProgress >= 100 ? (
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-accent-foreground" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
          <span className={isAnalyzing ? 'font-medium' : 'text-muted-foreground'}>
            AI analyzing & grouping products...
          </span>
        </div>
        <Progress value={analysisProgress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {analysisProgress}%
        </p>
      </div>

      {/* Hint */}
      <p className="text-center text-sm text-muted-foreground pt-4">
        The AI is identifying products and grouping similar angles together.
        <br />
        This may take a moment...
      </p>
    </div>
  );
}
