import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface VoiceToneScreenProps {
  data: {
    formalCasual: number;
    emotionalRational: number;
    boldSubtle: number;
  };
  onChange: (data: VoiceToneScreenProps["data"]) => void;
}

const toneExamples = {
  formal: {
    title: "Formal",
    example: "We are pleased to announce our latest innovation in skincare technology.",
  },
  casual: {
    title: "Casual",
    example: "OMG, you're gonna love what we just dropped! 💫",
  },
  emotional: {
    title: "Emotional",
    example: "Feel the transformation. Embrace your confidence. Be unstoppable.",
  },
  rational: {
    title: "Rational",
    example: "Clinically proven to reduce wrinkles by 47% in 4 weeks.",
  },
  bold: {
    title: "Bold",
    example: "BEAUTY RULES? WE DON'T FOLLOW THEM. WE BREAK THEM.",
  },
  subtle: {
    title: "Subtle",
    example: "A gentle touch. A quiet confidence. Simply you.",
  },
};

const VoiceToneScreen = ({ data, onChange }: VoiceToneScreenProps) => {
  const [showExamples, setShowExamples] = useState(false);

  const updateField = (field: string, value: number) => {
    onChange({ ...data, [field]: value });
  };

  const getToneLabel = (value: number, left: string, right: string) => {
    if (value < 35) return left;
    if (value > 65) return right;
    return "Balanced";
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Voice & Tone</h1>
      <p className="text-muted-foreground mb-8">
        Define how your brand speaks — I'll match this in all content I create.
      </p>

      <div className="space-y-8">
        {/* Formal ↔ Casual */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Formal</span>
            <span className="text-sm text-primary font-medium">
              {getToneLabel(data.formalCasual, "Formal", "Casual")}
            </span>
            <span className="font-medium">Casual</span>
          </div>
          <Slider
            value={[data.formalCasual]}
            onValueChange={([value]) => updateField("formalCasual", value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Emotional ↔ Rational */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Emotional</span>
            <span className="text-sm text-primary font-medium">
              {getToneLabel(data.emotionalRational, "Emotional", "Rational")}
            </span>
            <span className="font-medium">Rational</span>
          </div>
          <Slider
            value={[data.emotionalRational]}
            onValueChange={([value]) => updateField("emotionalRational", value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Bold ↔ Subtle */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <div className="flex justify-between mb-4">
            <span className="font-medium">Bold</span>
            <span className="text-sm text-primary font-medium">
              {getToneLabel(data.boldSubtle, "Bold", "Subtle")}
            </span>
            <span className="font-medium">Subtle</span>
          </div>
          <Slider
            value={[data.boldSubtle]}
            onValueChange={([value]) => updateField("boldSubtle", value)}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        {/* Toggle Examples */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
          <span className="text-sm font-medium">Show example copy for each style</span>
          <Switch checked={showExamples} onCheckedChange={setShowExamples} />
        </div>

        {/* Examples */}
        {showExamples && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(toneExamples).map(([key, tone]) => (
              <div key={key} className="p-4 rounded-xl bg-card border border-border">
                <p className="text-xs text-primary font-medium uppercase tracking-wider mb-2">
                  {tone.title}
                </p>
                <p className="text-sm text-muted-foreground italic">"{tone.example}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceToneScreen;
