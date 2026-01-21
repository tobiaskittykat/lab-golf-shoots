import { useState, useEffect, useCallback } from "react";
import { Globe, ExternalLink, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrandContext {
  mission?: string;
  values?: string[];
  tone_of_voice?: string;
  visual_style?: {
    photography_style?: string;
    color_palette?: string[];
    avoid?: string[];
  };
  target_audience?: string;
}

interface BrandBasicsScreenProps {
  data: {
    name: string;
    website: string;
    industry: string;
    markets: string[];
    personality: string;
    brandContext?: BrandContext;
  };
  onChange: (data: BrandBasicsScreenProps["data"]) => void;
  onSocialLinksFound?: (links: Record<string, string>) => void;
}

const personalities = [
  { id: "bold", label: "Bold", emoji: "🔥", description: "Confident, daring, attention-grabbing" },
  { id: "calm", label: "Calm", emoji: "🌿", description: "Serene, balanced, reassuring" },
  { id: "playful", label: "Playful", emoji: "✨", description: "Fun, energetic, approachable" },
  { id: "premium", label: "Premium", emoji: "💎", description: "Luxurious, refined, exclusive" },
  { id: "minimal", label: "Minimal", emoji: "◻️", description: "Clean, simple, focused" },
];

const industries = [
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Technology",
  "Food & Beverage",
  "Home & Living",
  "Jewelry & Accessories",
  "Health & Wellness",
  "Financial Services",
  "Travel & Hospitality",
  "Other",
];

const markets = [
  "United States",
  "United Kingdom",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Latin America",
  "Global",
];

const brandValues = [
  "Quality", "Innovation", "Authenticity", "Sustainability", "Elegance",
  "Reliability", "Creativity", "Trust", "Excellence", "Community"
];

const BrandBasicsScreen = ({ data, onChange, onSocialLinksFound }: BrandBasicsScreenProps) => {
  const { toast } = useToast();
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<string>("");
  const [lastCrawledUrl, setLastCrawledUrl] = useState<string>("");
  const [newAvoid, setNewAvoid] = useState("");
  const [newColor, setNewColor] = useState("");

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateBrandContext = (updates: Partial<BrandContext>) => {
    const currentContext = data.brandContext || {};
    onChange({ ...data, brandContext: { ...currentContext, ...updates } });
  };

  const updateVisualStyle = (updates: Partial<NonNullable<BrandContext['visual_style']>>) => {
    const currentContext = data.brandContext || {};
    const currentVisualStyle = currentContext.visual_style || {};
    onChange({ 
      ...data, 
      brandContext: { 
        ...currentContext, 
        visual_style: { ...currentVisualStyle, ...updates } 
      } 
    });
  };

  const toggleValue = (value: string) => {
    const current = data.brandContext?.values || [];
    if (current.includes(value)) {
      updateBrandContext({ values: current.filter((v) => v !== value) });
    } else {
      updateBrandContext({ values: [...current, value] });
    }
  };

  const addAvoidItem = () => {
    if (!newAvoid.trim()) return;
    const current = data.brandContext?.visual_style?.avoid || [];
    if (!current.includes(newAvoid.trim())) {
      updateVisualStyle({ avoid: [...current, newAvoid.trim()] });
    }
    setNewAvoid("");
  };

  const removeAvoidItem = (item: string) => {
    const current = data.brandContext?.visual_style?.avoid || [];
    updateVisualStyle({ avoid: current.filter((a) => a !== item) });
  };

  const addColor = () => {
    if (!newColor.trim()) return;
    const current = data.brandContext?.visual_style?.color_palette || [];
    if (!current.includes(newColor.trim()) && current.length < 5) {
      updateVisualStyle({ color_palette: [...current, newColor.trim()] });
    }
    setNewColor("");
  };

  const removeColor = (color: string) => {
    const current = data.brandContext?.visual_style?.color_palette || [];
    updateVisualStyle({ color_palette: current.filter((c) => c !== color) });
  };

  const toggleMarket = (market: string) => {
    const current = data.markets || [];
    if (current.includes(market)) {
      updateField("markets", current.filter((m) => m !== market));
    } else {
      updateField("markets", [...current, market]);
    }
  };

  // Debounced crawl function
  const crawlWebsite = useCallback(async (url: string) => {
    if (!url || url.length < 10 || lastCrawledUrl === url) return;
    
    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) return;

    setIsCrawling(true);
    setCrawlStatus("Scanning website for social links...");
    setLastCrawledUrl(url);

    try {
      const { data: result, error } = await supabase.functions.invoke('crawl-social-links', {
        body: { url },
      });

      if (error) {
        console.error('Crawl error:', error);
        setCrawlStatus("");
        return;
      }

      if (result?.success && result.socialLinks) {
        const linkCount = Object.keys(result.socialLinks).length;
        if (linkCount > 0) {
          setCrawlStatus(`Found ${linkCount} social profile${linkCount > 1 ? 's' : ''}!`);
          onSocialLinksFound?.(result.socialLinks);
          toast({
            title: "Social profiles found!",
            description: `We found ${linkCount} social media link${linkCount > 1 ? 's' : ''} on your website.`,
          });
        } else {
          setCrawlStatus("No social links found on website");
        }
      } else {
        setCrawlStatus("");
      }
    } catch (err) {
      console.error('Crawl failed:', err);
      setCrawlStatus("");
    } finally {
      setIsCrawling(false);
    }
  }, [lastCrawledUrl, onSocialLinksFound, toast]);

  // Crawl when website URL changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (data.website && data.website !== lastCrawledUrl) {
        crawlWebsite(data.website);
      }
    }, 1500); // Wait 1.5s after user stops typing

    return () => clearTimeout(timeoutId);
  }, [data.website, crawlWebsite, lastCrawledUrl]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Let's start with the basics</h1>
      <p className="text-muted-foreground mb-8">
        Help me understand who you are and where you operate
      </p>

      <div className="space-y-8">
        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Brand Name</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Your brand name"
            className="input-field text-lg"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium mb-2">Website URL</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="url"
              value={data.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://yourbrand.com"
              className="input-field pl-12"
            />
            {isCrawling ? (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : data.website ? (
              <a 
                href={data.website.startsWith('http') ? data.website : `https://${data.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : null}
          </div>
          <div className="h-6 mt-2">
            {crawlStatus && (
              <p className={`text-sm ${crawlStatus.includes('Found') ? 'text-green-600' : 'text-muted-foreground'}`}>
                {isCrawling && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
                {crawlStatus}
              </p>
            )}
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium mb-2">Industry</label>
          <select
            value={data.industry}
            onChange={(e) => updateField("industry", e.target.value)}
            className="input-field"
          >
            <option value="">Select your industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        {/* Markets */}
        <div>
          <label className="block text-sm font-medium mb-3">Primary Markets</label>
          <div className="flex flex-wrap gap-2">
            {markets.map((market) => (
              <button
                key={market}
                onClick={() => toggleMarket(market)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  data.markets?.includes(market)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                }`}
              >
                {data.markets?.includes(market) && <Check className="w-3 h-3 inline mr-1" />}
                {market}
              </button>
            ))}
          </div>
        </div>

        {/* Brand Personality */}
        <div>
          <label className="block text-sm font-medium mb-3">Brand Personality</label>
          <p className="text-sm text-muted-foreground mb-4">
            If your brand were a person, how would it behave?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => updateField("personality", p.id)}
                className={`p-4 rounded-xl text-left transition-all duration-200 ${
                  data.personality === p.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border border-border hover:border-primary/30"
                }`}
              >
                <span className="text-2xl mb-2 block">{p.emoji}</span>
                <p className="font-medium">{p.label}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ===== BRAND CONTEXT SECTION ===== */}
        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-2">Brand Guidelines</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Optional: These help AI create on-brand visuals
          </p>

          {/* Mission Statement */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mission Statement</label>
            <textarea
              value={data.brandContext?.mission || ''}
              onChange={(e) => updateBrandContext({ mission: e.target.value })}
              placeholder="What's your brand's purpose? e.g., 'We empower modern women with luxury tech accessories...'"
              className="input-field min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Brand Values */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Brand Values</label>
            <div className="flex flex-wrap gap-2">
              {brandValues.map((value) => (
                <button
                  key={value}
                  onClick={() => toggleValue(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    data.brandContext?.values?.includes(value)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground/70 hover:bg-secondary/80"
                  }`}
                >
                  {data.brandContext?.values?.includes(value) && <Check className="w-3 h-3 inline mr-1" />}
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Tone of Voice */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tone of Voice</label>
            <textarea
              value={data.brandContext?.tone_of_voice || ''}
              onChange={(e) => updateBrandContext({ tone_of_voice: e.target.value })}
              placeholder="How does your brand speak? e.g., 'Sophisticated yet approachable, confident without being pretentious'"
              className="input-field min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Target Audience */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Target Audience</label>
            <textarea
              value={data.brandContext?.target_audience || ''}
              onChange={(e) => updateBrandContext({ target_audience: e.target.value })}
              placeholder="Who are your ideal customers? e.g., 'Fashion-forward women 25-45 who value style and functionality'"
              className="input-field min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Photography Style */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Photography Style</label>
            <textarea
              value={data.brandContext?.visual_style?.photography_style || ''}
              onChange={(e) => updateVisualStyle({ photography_style: e.target.value })}
              placeholder="Describe your ideal visuals. e.g., 'Editorial luxury with lifestyle warmth, clean compositions'"
              className="input-field min-h-[60px] resize-none"
              rows={2}
            />
          </div>

          {/* Color Palette */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Brand Colors (up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(data.brandContext?.visual_style?.color_palette || []).map((color) => (
                <span
                  key={color}
                  className="px-3 py-1.5 bg-secondary rounded-full text-sm flex items-center gap-2"
                >
                  {color}
                  <button
                    onClick={() => removeColor(color)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {(data.brandContext?.visual_style?.color_palette?.length || 0) < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  placeholder="e.g., gold, cream, black"
                  className="input-field flex-1"
                />
                <button
                  onClick={addColor}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* What to Avoid */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">What to Avoid in Visuals</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(data.brandContext?.visual_style?.avoid || []).map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-sm flex items-center gap-2"
                >
                  {item}
                  <button
                    onClick={() => removeAvoidItem(item)}
                    className="hover:text-destructive/70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAvoid}
                onChange={(e) => setNewAvoid(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAvoidItem())}
                placeholder="e.g., cluttered backgrounds, harsh lighting"
                className="input-field flex-1"
              />
              <button
                onClick={addAvoidItem}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandBasicsScreen;
