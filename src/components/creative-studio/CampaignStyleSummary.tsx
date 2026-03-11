import { useState } from 'react';
import { Heart, Sparkles, Palette, Camera, Loader2, ArrowLeft } from 'lucide-react';
import { CampaignStyle, sampleContextReferences } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CampaignStyleSummaryProps { style: CampaignStyle; onGenerateMore: (count: number) => void; onBack: () => void; isGenerating: boolean; }
const batchOptions = [{ count: 5, label: '5 images' }, { count: 10, label: '10 images' }, { count: 20, label: '20 images' }];

export const CampaignStyleSummary = ({ style, onGenerateMore, onBack, isGenerating }: CampaignStyleSummaryProps) => {
  const [selectedBatch, setSelectedBatch] = useState(10);
  const topConcepts = style.likedConcepts.slice(0, 3);
  const topShotTypes = style.likedShotTypes.slice(0, 4);
  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="text-center space-y-2"><div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-2"><Sparkles className="w-6 h-6 text-accent" /></div><h2 className="text-2xl font-bold">Your Campaign Style</h2><p className="text-muted-foreground">Based on {style.totalLiked} liked images from {style.totalReviewed} reviewed</p></div>
      <div className="grid grid-cols-2 gap-4"><div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20"><div className="flex items-center gap-2 text-green-600 mb-1"><Heart className="w-4 h-4 fill-current" /><span className="font-medium">Liked</span></div><div className="text-2xl font-bold">{style.totalLiked}</div></div><div className="p-4 rounded-xl bg-secondary border border-border"><div className="flex items-center gap-2 text-muted-foreground mb-1"><Camera className="w-4 h-4" /><span className="font-medium">Reviewed</span></div><div className="text-2xl font-bold">{style.totalReviewed}</div></div></div>
      {topConcepts.length > 0 && (<div className="space-y-3"><h3 className="font-semibold flex items-center gap-2"><Palette className="w-4 h-4 text-accent" />Preferred Concepts</h3><div className="space-y-2">{topConcepts.map((item, idx) => (<div key={item.conceptId} className={cn("flex items-center justify-between p-3 rounded-lg", idx === 0 ? "bg-accent/10 border border-accent/20" : "bg-secondary")}><div className="flex items-center gap-2">{idx === 0 && <span className="text-lg">🏆</span>}<span className={cn("font-medium", idx === 0 && "text-accent")}>{item.conceptTitle}</span></div><Badge variant={idx === 0 ? "default" : "secondary"}>{item.count} {item.count === 1 ? 'like' : 'likes'}</Badge></div>))}</div></div>)}
      {topShotTypes.length > 0 && (<div className="space-y-3"><h3 className="font-semibold flex items-center gap-2"><Camera className="w-4 h-4 text-accent" />Preferred Shot Types</h3><div className="flex flex-wrap gap-2">{topShotTypes.map((item) => { const shotRef = sampleContextReferences.find(s => s.id === item.shotType); return (<Badge key={item.shotType} variant="outline" className="text-sm px-3 py-1.5">{shotRef?.name || item.shotName}<span className="ml-1.5 text-muted-foreground">({item.count})</span></Badge>); })}</div></div>)}
      <div className="space-y-3 pt-4 border-t border-border"><h3 className="font-semibold">Generate More Like These</h3><div className="flex gap-2">{batchOptions.map(option => (<Button key={option.count} variant={selectedBatch === option.count ? "default" : "outline"} size="sm" onClick={() => setSelectedBatch(option.count)} className="flex-1">{option.label}</Button>))}</div></div>
      <div className="flex flex-col gap-3 pt-2"><Button onClick={() => onGenerateMore(selectedBatch)} disabled={isGenerating || style.totalLiked === 0} className="w-full gap-2" size="lg">{isGenerating ? (<><Loader2 className="w-4 h-4 animate-spin" />Generating...</>) : (<><Sparkles className="w-4 h-4" />Generate {selectedBatch} Images</>)}</Button><Button variant="ghost" onClick={onBack} className="w-full gap-2"><ArrowLeft className="w-4 h-4" />Back to Swipe</Button></div>
      {style.totalLiked === 0 && (<p className="text-center text-sm text-muted-foreground">Like some images first to generate more like them</p>)}
    </div>
  );
};
