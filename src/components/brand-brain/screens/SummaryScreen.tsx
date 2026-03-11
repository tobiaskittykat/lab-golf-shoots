import { CheckCircle2 } from "lucide-react";
interface SummaryScreenProps { brandData: { basics: { name: string; website: string; industry: string; markets: string[]; personality: string }; files: File[]; connections: Record<string, { url: string; connected: boolean }> } }
const SummaryScreen = ({ brandData }: SummaryScreenProps) => {
  const connected = Object.entries(brandData.connections).filter(([_,v])=>v.url.length>0).map(([k])=>k);
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h2 className="font-display text-2xl font-bold mb-2">Review & Create</h2><p className="text-muted-foreground">Review your brand details before creating.</p></div>
      <div className="space-y-4">
        <div className="glass-card p-5"><div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-primary"/><h3 className="font-semibold">Brand Basics</h3></div><dl className="grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{brandData.basics.name||"—"}</dd></div><div><dt className="text-muted-foreground">Industry</dt><dd className="font-medium">{brandData.basics.industry||"—"}</dd></div></dl></div>
        <div className="glass-card p-5"><div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-primary"/><h3 className="font-semibold">Assets</h3></div><p className="text-sm text-muted-foreground">{brandData.files.length>0?`${brandData.files.length} image(s) uploaded`:"No images — add later"}</p></div>
        <div className="glass-card p-5"><div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-primary"/><h3 className="font-semibold">Digital Footprint</h3></div><p className="text-sm text-muted-foreground">{connected.length>0?`Connected: ${connected.join(", ")}`:"No channels connected — add later"}</p></div>
      </div>
    </div>
  );
};
export default SummaryScreen;
