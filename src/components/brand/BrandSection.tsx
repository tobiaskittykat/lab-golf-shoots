import { useBrands } from "@/hooks/useBrands";
import { useBrandImages } from "@/hooks/useBrandImages";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, Globe, Palette, Camera, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BrandSection = () => {
  const navigate = useNavigate();
  const { currentBrand } = useBrands();
  const { images, fetchImages, isRegenerating, regenerateBrandBrain, getBrandBrain, isScraping, scrapeFromWebsite } = useBrandImages();
  useEffect(() => { if (currentBrand) fetchImages(); }, [currentBrand, fetchImages]);

  if (!currentBrand) return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-primary"/></div>
      <h3 className="font-display text-xl font-bold mb-2">No Brand Set Up</h3>
      <p className="text-muted-foreground mb-6">Create your first brand to get started.</p>
      <Button onClick={()=>navigate("/brand-setup")} className="gap-2"><Plus className="w-4 h-4"/>Create Brand</Button>
    </div>
  );

  const brandBrain = getBrandBrain();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-2xl font-bold">{currentBrand.name}</h2><p className="text-muted-foreground">{currentBrand.industry||"No industry"} · {images.length} images</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={()=>scrapeFromWebsite()} disabled={isScraping} className="gap-2">{isScraping?<Loader2 className="w-4 h-4 animate-spin"/>:<Globe className="w-4 h-4"/>}Scrape</Button>
          <Button variant="outline" size="sm" onClick={()=>regenerateBrandBrain()} disabled={isRegenerating} className="gap-2">{isRegenerating?<Loader2 className="w-4 h-4 animate-spin"/>:<Sparkles className="w-4 h-4"/>}{brandBrain?"Regen":"Gen"} Brain</Button>
        </div>
      </div>
      {brandBrain&&<div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Palette className="w-4 h-4 text-primary"/>Visual DNA</CardTitle></CardHeader><CardContent className="text-sm space-y-1"><p><span className="text-muted-foreground">Photography:</span> {brandBrain.visualDNA?.photographyStyle||"—"}</p><p><span className="text-muted-foreground">Lighting:</span> {brandBrain.visualDNA?.lightingStyle||"—"}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Camera className="w-4 h-4 text-primary"/>Creative Direction</CardTitle></CardHeader><CardContent className="text-sm"><p>{brandBrain.creativeDirectionSummary||"—"}</p></CardContent></Card>
      </div>}
      {images.length>0&&<div><h3 className="font-semibold mb-3">Brand Images</h3><div className="grid grid-cols-4 md:grid-cols-6 gap-2">{images.slice(0,12).map(img=>(<div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-border bg-secondary"><img src={img.image_url} alt="" className="w-full h-full object-cover" loading="lazy"/></div>))}</div></div>}
    </div>
  );
};
export default BrandSection;
