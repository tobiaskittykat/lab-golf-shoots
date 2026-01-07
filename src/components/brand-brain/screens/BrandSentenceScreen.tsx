interface BrandSentenceScreenProps {
  value: string;
  onChange: (value: string) => void;
}

const promptChips = [
  "We help customers...",
  "Our brand believes in...",
  "We're known for...",
  "What makes us different is...",
  "Our customers feel...",
];

const BrandSentenceScreen = ({ value, onChange }: BrandSentenceScreenProps) => {
  const insertPrompt = (prompt: string) => {
    onChange(value ? `${value} ${prompt}` : prompt);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Your brand in one sentence</h1>
      <p className="text-muted-foreground mb-8">
        Describe your brand as if you were explaining it to a new hire
      </p>

      <div className="space-y-6">
        {/* Large Text Input */}
        <div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="We're a modern skincare brand that believes beauty should be effortless. Our products combine science with nature to help women feel confident in their own skin..."
            className="input-field min-h-[200px] text-lg leading-relaxed resize-none"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Don't worry about perfection — I'll learn from your intent
            </span>
            <span className="text-xs text-muted-foreground">
              {value.length}/500
            </span>
          </div>
        </div>

        {/* Prompt Chips */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Need inspiration? Try these prompts:</p>
          <div className="flex flex-wrap gap-2">
            {promptChips.map((chip) => (
              <button
                key={chip}
                onClick={() => insertPrompt(chip)}
                className="action-chip"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSentenceScreen;
