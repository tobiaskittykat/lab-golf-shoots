import { useBrands } from "@/hooks/useBrands";
import { useBrandImages } from "@/hooks/useBrandImages";
import { useNavigate } from "react-router-dom";
import { useEffect, RefObject } from "react";
import { Sparkles, Globe, Palette, Camera, Plus, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import BrandSelector from "@/components/BrandSelector";
import { useState } from "react";

interface BrandSectionProps {
  brandRef?: RefObject<HTMLDivElement>;
}

const BrandSection = ({ brandRef }: BrandSectionProps) => {
  const navigate = useNavigate();
  const { currentBrand } = useBrands();
  const { images, fetchImages, isRegenerating, regenerateBrandBrain, getBrandBrain, isScraping, scrapeFromWebsite } = useBrandImages();
  const [isBrandOpen, setIsBrandOpen] = useState(true);

  useEffect(() => { if (currentBrand) fetchImages(); }, [currentBrand, fetchImages]);

  if (!currentBrand) return (
    <section ref={brandRef} className="px-8 py-16 border-t border-border">
      <div className="max-w-5xl mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Plus className="w-8 h-8 text-primary"/></div>
        <h3 className="font-display text-xl font-bold mb-2">No Brand Set Up</h3>
        <p className="text-muted-foreground mb-6">Create your first brand to get started.</p>
        <Button onClick={()=>navigate("/brand-setup")} className="gap-2"><Plus className="w-4 h-4"/>Create Brand</Button>
      </div>
    </section>
  );

  const brandBrain = getBrandBrain();
  const visualDna = brandBrain?.visualDNA;

  return (
    <section ref={brandRef} className="px-8 py-16 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <Collapsible open={isBrandOpen} onOpenChange={setIsBrandOpen}>
          <div className="flex items-center gap-3 mb-6">
            <CollapsibleTrigger asChild>
              <button
                className="w-8 h-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
              >
                {isBrandOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Brand</p>
              <h2 className="font-display text-2xl font-bold">{currentBrand.name}</h2>
            </div>
            <BrandSelector variant="chip" />
          </div>

          <CollapsibleContent>
            <div className="space-y-6">
              {/* Brand Info */}
              <div className="glass-card p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Industry</p>
                    <p className="font-medium">{currentBrand.industry || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Markets</p>
                    <div className="flex flex-wrap gap-1">
                      {currentBrand.markets?.length > 0 ? currentBrand.markets.map((m, i) => (
                        <span key={i} className="px-2 py-0.5 bg-secondary rounded-full text-xs">{m}</span>
                      )) : <span className="text-muted-foreground text-sm">Not set</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Personality</p>
                    <p className="font-medium">{currentBrand.personality || "Not set"}</p>
                  </div>
                </div>
              </div>

              {/* Visual DNA */}
              {visualDna && (
                <div className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Visual DNA</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {visualDna.primaryColors && visualDna.primaryColors.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Color Palette</p>
                        <div className="flex gap-2">
                          {visualDna.primaryColors.map((color: string, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-lg border border-border" style={{ backgroundColor: color }} title={color} />
                          ))}
                        </div>
                      </div>
                    )}
                    {visualDna.photographyStyle && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Photography Style</p>
                        <span className="px-2 py-0.5 bg-accent/10 text-accent rounded-full text-xs">{visualDna.photographyStyle}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Brand Images */}
              {images.length > 0 && (
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-accent" />
                      <h3 className="font-semibold">Brand Images ({images.length})</h3>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => scrapeFromWebsite()} disabled={isScraping} className="gap-2">
                        {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                        Scrape
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => regenerateBrandBrain()} disabled={isRegenerating} className="gap-2">
                        {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Analyze
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {images.slice(0, 12).map((img) => (
                      <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={img.thumbnail_url || img.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/brand-setup")} className="gap-2">
                  <Palette className="w-4 h-4" />
                  Edit Brand
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default BrandSection;
