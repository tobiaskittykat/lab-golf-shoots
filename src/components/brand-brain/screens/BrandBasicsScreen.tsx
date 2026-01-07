import { useState } from "react";
import { Globe, ExternalLink, Check } from "lucide-react";

interface BrandBasicsScreenProps {
  data: {
    name: string;
    website: string;
    industry: string;
    markets: string[];
    personality: string;
  };
  onChange: (data: BrandBasicsScreenProps["data"]) => void;
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

const BrandBasicsScreen = ({ data, onChange }: BrandBasicsScreenProps) => {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleMarket = (market: string) => {
    const current = data.markets || [];
    if (current.includes(market)) {
      updateField("markets", current.filter((m) => m !== market));
    } else {
      updateField("markets", [...current, market]);
    }
  };

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
            {data.website && (
              <a 
                href={data.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
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
      </div>
    </div>
  );
};

export default BrandBasicsScreen;
