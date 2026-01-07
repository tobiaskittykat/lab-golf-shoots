import { useState } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface GuardrailsScreenProps {
  data: {
    logoUsage: number;
    colorUsage: number;
    photographyStyle: string;
    doNotUse: string;
  };
  onChange: (data: GuardrailsScreenProps["data"]) => void;
}

const photographyStyles = [
  { id: "studio", label: "Studio", description: "Clean, controlled lighting" },
  { id: "lifestyle", label: "Lifestyle", description: "Natural, real-world settings" },
  { id: "ugc", label: "UGC", description: "User-generated, authentic" },
  { id: "mixed", label: "Mixed", description: "Combination of styles" },
];

const GuardrailsScreen = ({ data, onChange }: GuardrailsScreenProps) => {
  const [expanded, setExpanded] = useState<string | null>("logo");

  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const sections = [
    {
      id: "logo",
      title: "Logo Usage",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Strict rules</span>
            <span>Flexible usage</span>
          </div>
          <Slider
            value={[data.logoUsage]}
            onValueChange={([value]) => updateField("logoUsage", value)}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            {data.logoUsage < 30 
              ? "Logo must always appear exactly as provided" 
              : data.logoUsage < 70 
                ? "Logo can be adapted for different contexts"
                : "Logo can be creatively interpreted"}
          </p>
        </div>
      ),
    },
    {
      id: "color",
      title: "Color Usage",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Core palette only</span>
            <span>Experimental</span>
          </div>
          <Slider
            value={[data.colorUsage]}
            onValueChange={([value]) => updateField("colorUsage", value)}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-sm text-muted-foreground">
            {data.colorUsage < 30 
              ? "Only use brand colors as defined" 
              : data.colorUsage < 70 
                ? "Can introduce complementary shades"
                : "Free to explore broader color palettes"}
          </p>
        </div>
      ),
    },
    {
      id: "photography",
      title: "Photography Style",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {photographyStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => updateField("photographyStyle", style.id)}
              className={`p-4 rounded-xl text-left transition-all duration-200 ${
                data.photographyStyle === style.id
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-secondary border border-border hover:border-primary/30"
              }`}
            >
              <p className="font-medium">{style.label}</p>
              <p className="text-xs text-muted-foreground">{style.description}</p>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "doNotUse",
      title: "Do Not Use",
      content: (
        <div>
          <textarea
            value={data.doNotUse}
            onChange={(e) => updateField("doNotUse", e.target.value)}
            placeholder="List anything that should never appear in brand materials (e.g., specific colors, imagery, words, competitors...)"
            className="input-field min-h-[120px] resize-none"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Visual Guardrails</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        These rules become your Brand Safety Layer — I won't break them.
      </p>

      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-border overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="w-full flex items-center justify-between p-4 bg-card hover:bg-secondary/50 transition-colors"
            >
              <span className="font-medium">{section.title}</span>
              {expanded === section.id ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {expanded === section.id && (
              <div className="p-4 border-t border-border bg-background">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuardrailsScreen;
