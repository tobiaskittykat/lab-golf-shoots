import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Loader2, CheckCircle2, ArrowRight, X } from "lucide-react";
import type { AgentDraftState, ExtractedBrandData } from "@/hooks/useBrandDrafts";
import kittykatLogo from "@/assets/kittykat-logo-transparent.png";

interface AgentBrandSetupProps { onComplete: (data: any) => void; onCancel: () => void; onSaveAndExit: () => void; initialState?: AgentDraftState; onStateChange?: (state: AgentDraftState) => void; }

const AgentBrandSetup = ({ onComplete, onCancel, onSaveAndExit, initialState, onStateChange }: AgentBrandSetupProps) => {
  const [url, setUrl] = useState(initialState?.websiteUrl || "");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBrandData | null>(initialState?.extractedData || null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = useCallback(async () => {
    if (!url.trim()) return;
    setIsExtracting(true); setError(null);
    try {
      const brandName = new URL(url.trim()).hostname.replace("www.","").split(".")[0];
      const extracted: ExtractedBrandData = { name: brandName.charAt(0).toUpperCase()+brandName.slice(1), tagline:"", industry:"", personality:"", colors:{primary:"#000",secondary:"#fff",accent:"#ff6b35"}, socialLinks:{}, mission:"", tone:"" };
      setExtractedData(extracted);
      onStateChange?.({ websiteUrl:url, extractedData:extracted, reviewedFields:[], currentReviewIndex:0, phase:"reviewing" });
    } catch(err) { setError("Invalid URL"); } finally { setIsExtracting(false); }
  }, [url, onStateChange]);

  if (extractedData) return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4"><div className="max-w-3xl mx-auto flex items-center justify-between"><div className="flex items-center gap-3"><img src={kittykatLogo} alt="" className="h-8 w-8"/><span className="font-display text-lg font-bold">AI Brand Setup</span></div><button onClick={onCancel} className="p-2 rounded-lg hover:bg-secondary"><X className="w-5 h-5"/></button></div></header>
      <main className="flex-1 max-w-3xl mx-auto px-6 py-8 w-full space-y-6">
        <div className="flex items-center gap-3 text-primary"><CheckCircle2 className="w-6 h-6"/><h2 className="font-display text-2xl font-bold">Brand Extracted</h2></div>
        <div className="glass-card p-6 space-y-4">
          <div><label className="text-sm text-muted-foreground">Brand Name</label><Input value={extractedData.name} onChange={e=>setExtractedData({...extractedData,name:e.target.value})} className="mt-1"/></div>
          <div><label className="text-sm text-muted-foreground">Industry</label><Input value={extractedData.industry} onChange={e=>setExtractedData({...extractedData,industry:e.target.value})} placeholder="e.g. Fashion" className="mt-1"/></div>
          <div><label className="text-sm text-muted-foreground">Personality</label><Input value={extractedData.personality} onChange={e=>setExtractedData({...extractedData,personality:e.target.value})} placeholder="e.g. Premium, authentic" className="mt-1"/></div>
        </div>
        <div className="flex gap-3 justify-end"><Button variant="outline" onClick={onSaveAndExit}>Save Draft</Button><Button onClick={()=>onComplete({name:extractedData.name,website:url,industry:extractedData.industry,personality:extractedData.personality,socialLinks:extractedData.socialLinks})} className="gap-2">Create Brand<ArrowRight className="w-4 h-4"/></Button></div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg w-full space-y-8 text-center">
        <img src={kittykatLogo} alt="" className="h-16 w-16 mx-auto"/>
        <div><h2 className="font-display text-2xl font-bold mb-2">Paste your website URL</h2><p className="text-muted-foreground">We'll extract your brand identity automatically.</p></div>
        <div className="flex gap-3"><div className="relative flex-1"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/><Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.yourbrand.com" className="pl-10" onKeyDown={e=>e.key==="Enter"&&handleExtract()}/></div><Button onClick={handleExtract} disabled={!url.trim()||isExtracting}>{isExtracting?<Loader2 className="w-4 h-4 animate-spin"/>:<ArrowRight className="w-4 h-4"/>}</Button></div>
        {error&&<p className="text-sm text-destructive">{error}</p>}
        <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
      </div>
    </div>
  );
};
export default AgentBrandSetup;
