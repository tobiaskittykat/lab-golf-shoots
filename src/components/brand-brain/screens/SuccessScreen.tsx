import { Check, Zap, DollarSign, TrendingUp, Shield, Rocket, RefreshCw, ShoppingBag, Globe } from "lucide-react";

interface SuccessScreenProps {
  data: {
    goals: string[];
    useCases: string[];
  };
  onChange: (data: SuccessScreenProps["data"]) => void;
}

const goals = [
  { id: "speed", label: "Speed to market", icon: Zap, description: "Launch campaigns faster" },
  { id: "cost", label: "Cost reduction", icon: DollarSign, description: "Reduce creative costs" },
  { id: "conversion", label: "Conversion uplift", icon: TrendingUp, description: "Improve performance" },
  { id: "consistency", label: "Brand consistency", icon: Shield, description: "Stay on-brand always" },
];

const useCases = [
  { id: "campaign", label: "Campaign Launches", icon: Rocket, description: "Big launches & promos" },
  { id: "social", label: "Always-on Social", icon: RefreshCw, description: "Daily content needs" },
  { id: "pdp", label: "PDP / eCommerce", icon: ShoppingBag, description: "Product imagery" },
  { id: "regional", label: "Regional Localization", icon: Globe, description: "Multi-market content" },
];

const SuccessScreen = ({ data, onChange }: SuccessScreenProps) => {
  const toggleGoal = (goalId: string) => {
    const current = data.goals || [];
    if (current.includes(goalId)) {
      onChange({ ...data, goals: current.filter((g) => g !== goalId) });
    } else {
      onChange({ ...data, goals: [...current, goalId] });
    }
  };

  const toggleUseCase = (useCaseId: string) => {
    const current = data.useCases || [];
    if (current.includes(useCaseId)) {
      onChange({ ...data, useCases: current.filter((u) => u !== useCaseId) });
    } else {
      onChange({ ...data, useCases: [...current, useCaseId] });
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Define Success</h1>
      <p className="text-muted-foreground mb-8">
        Help me understand what matters most so I can prioritize accordingly.
      </p>

      <div className="space-y-8">
        {/* Success Goals */}
        <div>
          <p className="text-sm font-medium mb-4">What does success look like for you?</p>
          <div className="grid grid-cols-2 gap-3">
            {goals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = data.goals?.includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{goal.label}</p>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{goal.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Use Cases */}
        <div>
          <p className="text-sm font-medium mb-4">Primary use cases</p>
          <div className="grid grid-cols-2 gap-3">
            {useCases.map((useCase) => {
              const Icon = useCase.icon;
              const isSelected = data.useCases?.includes(useCase.id);
              return (
                <button
                  key={useCase.id}
                  onClick={() => toggleUseCase(useCase.id)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card border border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{useCase.label}</p>
                        {isSelected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
