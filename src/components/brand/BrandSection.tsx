import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Plus, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  RefreshCw,
  Calendar,
  MapPin,
  UserCircle2,
  Palette,
  Type,
  Camera,
  Users,
  Target,
  Eye,
  Upload,
  Globe,
  Link2,
  FileText,
  Instagram,
  Youtube,
  Check,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBrands } from "@/hooks/useBrands";
import BrandSelector from "@/components/BrandSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditableText, EditableTags } from "@/components/ui/editable-text";

// Mock brand data - will be replaced with real data from useBrands
const brandData = {
  name: "Helzberg",
  tagline: "Jewelry that lasts a lifetime",
  values: ["Ethical sourcing", "Environmental responsibility", "Community involvement"],
  mission: "To provide high-quality, ethically sourced jewelry that customers can cherish for a lifetime.",
  vision: "To be the leading jewelry retailer recognized for our commitment to quality and sustainability.",
  colors: [
    { name: "Burgundy", hex: "#800020" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Gray", hex: "#808080" },
  ],
  typography: { primary: "Serif", secondary: "Sans-serif" },
  products: ["Engagement Rings", "Wedding Bands", "Diamond Necklaces", "Bracelets"],
  targetAudience: "Individuals seeking quality jewelry for significant life events such as engagements, weddings, and anniversaries, appealing to both traditional and modern tastes.",
  history: "Founded in 1915 by Morris Helzberg, now part of the Berkshire Hathaway family.",
};

const visualStyle = {
  lastUpdated: "Jan 8, 2026 at 4:01 PM",
  imageCount: 805,
  composition: [
    { label: "close-up detail", score: 0.95 },
    { label: "centered subject", score: 0.91 },
    { label: "rule of thirds", score: 0.24 },
  ],
  lighting: [
    { label: "soft diffused", score: 1 },
    { label: "natural daylight", score: 0.89 },
  ],
  setting: [
    { label: "minimal studio", score: 0.98 },
    { label: "neutral backdrop", score: 0.53 },
  ],
  styling: [
    { label: "minimalist clean", score: 1 },
    { label: "casual relaxed", score: 0.63 },
  ],
};

const brandPersonas = [
  {
    id: 1,
    name: "College Graduate Dreamer",
    description: "A recent college graduate seeking to mark the start of a promising career with meaningful jewelry.",
    age: "23-28",
    gender: "Female",
    location: "Urban",
  },
  {
    id: 2,
    name: "Family-Oriented Guardian",
    description: "A devoted parent seeking jewelry that commemorates family milestones and traditions.",
    age: "35-45",
    gender: "Male",
    location: "Suburban",
  },
  {
    id: 3,
    name: "Golden Years Celebrant",
    description: "A retiree embracing a socially active lifestyle, looking for jewelry that accompanies special moments.",
    age: "65-75",
    gender: "Non-binary",
    location: "Coastal",
  },
];

interface BrandSectionProps {
  brandRef: React.RefObject<HTMLDivElement | null>;
}

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  website: <Globe className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  pinterest: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.38.04-3.4.22-.93 1.4-5.93 1.4-5.93s-.36-.71-.36-1.77c0-1.66.96-2.9 2.16-2.9 1.02 0 1.51.77 1.51 1.7 0 1.03-.66 2.57-.99 4-.28 1.18.6 2.15 1.77 2.15 2.12 0 3.75-2.24 3.75-5.47 0-2.86-2.05-4.86-4.98-4.86-3.39 0-5.38 2.54-5.38 5.17 0 1.02.4 2.12.89 2.72a.36.36 0 0 1 .08.34c-.09.38-.29 1.19-.33 1.36-.05.22-.18.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.88 0 4.11-2.59 7.42-6.18 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.82c-.27 1.04-1 2.35-1.49 3.14A12 12 0 1 0 12 0z"/></svg>,
  youtube: <Youtube className="w-4 h-4" />,
  facebook: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  linkedin: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: <X className="w-4 h-4" />,
  tiktok: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>,
};

const BrandSection = ({ brandRef }: BrandSectionProps) => {
  const navigate = useNavigate();
  const { currentBrand, updateBrand } = useBrands();
  const [activeTab, setActiveTab] = useState("overview");
  const [isOpen, setIsOpen] = useState(true);
  
  // Sources tab state
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [imageCount, setImageCount] = useState("10");

  // Get connected sources from brand's social_connections
  const connectedSources = useMemo(() => {
    const connections = currentBrand?.social_connections as Record<string, { url?: string; connected?: boolean }> | null;
    if (!connections) return [];
    
    return Object.entries(connections)
      .filter(([_, data]) => data?.url && data?.connected)
      .map(([platform, data]) => ({
        id: platform,
        label: platform.charAt(0).toUpperCase() + platform.slice(1),
        url: data.url!,
        icon: platformIcons[platform] || <Globe className="w-4 h-4" />,
      }));
  }, [currentBrand?.social_connections]);

  const handleSourceSelect = (sourceId: string, url: string) => {
    if (selectedSource === sourceId) {
      setSelectedSource(null);
      setScrapeUrl("");
    } else {
      setSelectedSource(sourceId);
      setScrapeUrl(url);
    }
  };

  const handleScrape = () => {
    if (!scrapeUrl) {
      toast.error("Please enter a URL to scrape");
      return;
    }
    toast.success(`Scraping ${imageCount} images from ${scrapeUrl}...`);
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!currentBrand) return;
    
    const { error } = await updateBrand(currentBrand.id, { [field]: value });
    if (error) {
      toast.error("Failed to update: " + error.message);
    } else {
      toast.success("Updated successfully");
    }
  };

  return (
    <section ref={brandRef as React.RefObject<HTMLElement>} className="px-8 py-12 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <button 
                  className="w-8 h-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                  title={isOpen ? "Collapse section" : "Expand section"}
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center text-white font-bold text-base">
                {currentBrand?.name?.charAt(0).toUpperCase() || "H"}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand</p>
                <h2 className="font-display text-2xl font-bold">{currentBrand?.name || brandData.name}</h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BrandSelector />
              <button 
                onClick={() => navigate("/brand-setup")}
                className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-colors"
                title="Create new brand"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <CollapsibleContent>
            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-secondary/50 p-1 rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background">
                  <Eye className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="identity" className="rounded-lg data-[state=active]:bg-background">
                  <Palette className="w-4 h-4 mr-2" />
                  Brand DNA
                </TabsTrigger>
                <TabsTrigger value="visual" className="rounded-lg data-[state=active]:bg-background">
                  <Camera className="w-4 h-4 mr-2" />
                  Visual Style
                </TabsTrigger>
                <TabsTrigger value="audience" className="rounded-lg data-[state=active]:bg-background">
                  <Users className="w-4 h-4 mr-2" />
                  Audience
                </TabsTrigger>
                <TabsTrigger value="sources" className="rounded-lg data-[state=active]:bg-background">
                  <Upload className="w-4 h-4 mr-2" />
                  Sources
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Tagline & Values */}
            <div className="glass-card p-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Brand Overview</h4>
              <EditableText
                value={currentBrand?.personality || brandData.tagline}
                onSave={(value) => handleUpdateField("personality", value)}
                className="text-lg text-foreground mb-4"
                placeholder="Add a brand tagline..."
              />
              <EditableTags
                values={currentBrand?.markets || brandData.values}
                onSave={(values) => handleUpdateField("markets", values)}
              />
            </div>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-primary mb-2">Mission</h4>
                <p className="text-muted-foreground">{brandData.mission}</p>
              </div>
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-primary mb-2">Vision</h4>
                <p className="text-muted-foreground">{brandData.vision}</p>
              </div>
            </div>

            {/* Products */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Products</h4>
              <div className="flex flex-wrap gap-2">
                {brandData.products.map((product) => (
                  <span key={product} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm">
                    {product}
                  </span>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="glass-card p-5">
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Brand History</h4>
              <p className="text-muted-foreground">{brandData.history}</p>
            </div>
          </TabsContent>

          {/* Identity Tab */}
          <TabsContent value="identity" className="space-y-6">
            {/* Colors */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Brand Colors</h3>
              <div className="flex gap-4">
                {brandData.colors.map((color) => (
                  <div key={color.name} className="text-center group">
                    <div 
                      className="w-16 h-16 rounded-xl mb-2 border border-border shadow-sm group-hover:scale-105 transition-transform cursor-pointer"
                      style={{ backgroundColor: color.hex }}
                      title={`Copy ${color.hex}`}
                    />
                    <p className="text-sm font-medium">{color.name}</p>
                    <p className="text-xs text-muted-foreground">{color.hex}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Typography</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Primary Font</p>
                  <p className="text-2xl font-serif">{brandData.typography.primary}</p>
                  <div className="flex gap-2 mt-2">
                    {["400", "600", "700"].map((w) => (
                      <span key={w} className="px-2 py-1 text-xs bg-secondary rounded">{w}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Secondary Font</p>
                  <p className="text-2xl">{brandData.typography.secondary}</p>
                  <div className="flex gap-2 mt-2">
                    {["400", "600"].map((w) => (
                      <span key={w} className="px-2 py-1 text-xs bg-secondary rounded">{w}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Visual Style Tab */}
          <TabsContent value="visual" className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Visual Style Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Learned from {visualStyle.imageCount} curated images · Last updated: {visualStyle.lastUpdated}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors text-sm">
                  <RefreshCw className="w-4 h-4" />
                  Re-analyze
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { label: "Composition", items: visualStyle.composition },
                  { label: "Lighting", items: visualStyle.lighting },
                  { label: "Setting", items: visualStyle.setting },
                  { label: "Styling", items: visualStyle.styling },
                ].map((category) => (
                  <div key={category.label}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3">{category.label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item) => (
                        <span 
                          key={item.label}
                          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-2"
                        >
                          {item.label}
                          <span className="text-xs opacity-60">{item.score}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            {/* Target Audience Summary */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-muted-foreground">Target Audience</h4>
              </div>
              <p className="text-muted-foreground">{brandData.targetAudience}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Brand Personas</h3>
                <p className="text-sm text-muted-foreground">Target audience segments for your brand</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  Create
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-colors">
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {brandPersonas.map((persona) => (
                <div key={persona.id} className="glass-card p-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-coral/20 flex items-center justify-center mb-4">
                    <UserCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{persona.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{persona.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Age: <span className="text-foreground font-medium">{persona.age}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UserCircle2 className="w-4 h-4" />
                      <span>Gender: <span className="text-foreground font-medium">{persona.gender}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Location: <span className="text-foreground font-medium">{persona.location}</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            {/* Website & Social Scraping */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Website & Social Media</h3>
                  <p className="text-sm text-muted-foreground">Automatically extract brand info from your online presence</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* URL Input */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                  <Link2 className="w-5 h-5 text-muted-foreground" />
                  <input 
                    type="url" 
                    value={scrapeUrl}
                    onChange={(e) => {
                      setScrapeUrl(e.target.value);
                      setSelectedSource(null);
                    }}
                    placeholder="Enter website URL or select below..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {scrapeUrl && (
                    <button 
                      onClick={() => {
                        setScrapeUrl("");
                        setSelectedSource(null);
                      }}
                      className="p-1 rounded hover:bg-secondary transition-colors"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>

                {/* Connected Sources Chips */}
                {connectedSources.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Quick select from connected sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {connectedSources.map((source) => (
                        <button
                          key={source.id}
                          onClick={() => handleSourceSelect(source.id, source.url)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                            selectedSource === source.id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary/50 border-border hover:bg-secondary text-foreground"
                          }`}
                        >
                          {source.icon}
                          <span>{source.label}</span>
                          {selectedSource === source.id && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {connectedSources.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No connected sources yet. Connect your social accounts in Brand Setup to quickly scrape from them.
                  </p>
                )}

                {/* Image Count & Scrape Button */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Images:</span>
                    <Select value={imageCount} onValueChange={setImageCount}>
                      <SelectTrigger className="w-24 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button 
                    onClick={handleScrape}
                    disabled={!scrapeUrl}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scrape
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Brand Documents</h3>
                  <p className="text-sm text-muted-foreground">Upload brand guidelines, style guides, or other documents</p>
                </div>
              </div>
              
              <div 
                className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, images up to 10MB each</p>
              </div>
            </div>
          </TabsContent>
            </Tabs>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default BrandSection;
