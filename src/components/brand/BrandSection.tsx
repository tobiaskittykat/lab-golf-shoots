import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Sparkles, 
  ChevronDown, 
  RefreshCw,
  Calendar,
  MapPin,
  UserCircle2,
  Palette,
  Type,
  Camera,
  Users,
  Target,
  Eye
} from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import BrandSelector from "@/components/BrandSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const BrandSection = ({ brandRef }: BrandSectionProps) => {
  const navigate = useNavigate();
  const { currentBrand } = useBrands();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section ref={brandRef as React.RefObject<HTMLElement>} className="px-8 py-12 border-t border-border">
      <div className="max-w-5xl mx-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-primary flex items-center justify-center text-white font-bold text-lg">
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

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="identity" className="rounded-lg data-[state=active]:bg-background">
              <Palette className="w-4 h-4 mr-2" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="visual" className="rounded-lg data-[state=active]:bg-background">
              <Camera className="w-4 h-4 mr-2" />
              Visual Style
            </TabsTrigger>
            <TabsTrigger value="audience" className="rounded-lg data-[state=active]:bg-background">
              <Users className="w-4 h-4 mr-2" />
              Audience
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Tagline & Values */}
            <div className="glass-card p-6">
              <p className="text-lg text-foreground mb-4">{brandData.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {brandData.values.map((value) => (
                  <span key={value} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {value}
                  </span>
                ))}
              </div>
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

            {/* Products & Audience Summary */}
            <div className="grid md:grid-cols-2 gap-4">
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
              <div className="glass-card p-5">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Target Audience</h4>
                <p className="text-sm text-muted-foreground">{brandData.targetAudience}</p>
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
        </Tabs>
      </div>
    </section>
  );
};

export default BrandSection;
