import { Plus, Trash2, Globe } from "lucide-react";

interface Market {
  name: string;
  approach: "global" | "local";
  notes: string;
}

interface MarketsScreenProps {
  markets: Market[];
  onChange: (markets: Market[]) => void;
}

const MarketsScreen = ({ markets, onChange }: MarketsScreenProps) => {
  const addMarket = () => {
    onChange([...markets, { name: "", approach: "global", notes: "" }]);
  };

  const updateMarket = (index: number, field: keyof Market, value: string) => {
    const updated = [...markets];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeMarket = (index: number) => {
    onChange(markets.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Markets & Local Nuance</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        I'll respect regional differences when generating content for each market.
      </p>

      <div className="space-y-4">
        {/* Market Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-secondary text-sm font-medium">
            <div className="col-span-3">Market</div>
            <div className="col-span-4">Brand Approach</div>
            <div className="col-span-4">Notes</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          {markets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No markets added yet</p>
              <p className="text-sm mt-1">Click "Add Market" to get started</p>
            </div>
          ) : (
            markets.map((market, index) => (
              <div 
                key={index}
                className="grid grid-cols-12 gap-4 p-4 border-t border-border items-center"
              >
                <div className="col-span-3">
                  <input
                    type="text"
                    value={market.name}
                    onChange={(e) => updateMarket(index, "name", e.target.value)}
                    placeholder="e.g., United Kingdom"
                    className="input-field py-2"
                  />
                </div>
                <div className="col-span-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateMarket(index, "approach", "global")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        market.approach === "global"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Same Global Brand
                    </button>
                    <button
                      onClick={() => updateMarket(index, "approach", "local")}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        market.approach === "local"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Locally Adapted
                    </button>
                  </div>
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    value={market.notes}
                    onChange={(e) => updateMarket(index, "notes", e.target.value)}
                    placeholder="Any specific notes..."
                    className="input-field py-2"
                  />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeMarket(index)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Market Button */}
        <button
          onClick={addMarket}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Market
        </button>

        {/* AI Note */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-primary">
            💡 Markets marked as "Locally Adapted" will get customized content that respects regional preferences, holidays, and cultural nuances.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketsScreen;
