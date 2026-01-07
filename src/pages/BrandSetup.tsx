import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Palette, Type, Target, Check } from "lucide-react";

const steps = [
  { id: 1, title: "Basic Info", icon: Type },
  { id: 2, title: "Visual Identity", icon: Palette },
  { id: 3, title: "Brand Voice", icon: Target },
];

const BrandSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [brandData, setBrandData] = useState({
    name: "",
    tagline: "",
    industry: "",
    primaryColor: "#fb9272",
    secondaryColor: "#1a1a2e",
    tone: "",
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Progress */}
      <div className="w-80 bg-card/50 border-r border-white/5 p-8 hidden lg:block">
        <div className="mb-10">
          <h2 className="font-display text-xl font-bold mb-1">Set up your brand</h2>
          <p className="text-sm text-muted-foreground">This helps us create on-brand content</p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = step.id < currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-primary/10 border border-primary/30" : isComplete ? "opacity-60" : "opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? "bg-primary text-primary-foreground" : isComplete ? "bg-primary/20 text-primary" : "bg-secondary"
                  }`}
                >
                  {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h1 className="font-display text-3xl font-bold mb-2">Tell us about your brand</h1>
              <p className="text-muted-foreground mb-8">We'll use this to personalize your experience</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Brand Name</label>
                  <input
                    type="text"
                    value={brandData.name}
                    onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
                    placeholder="Acme Inc."
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input
                    type="text"
                    value={brandData.tagline}
                    onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
                    placeholder="Innovation that inspires"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select
                    value={brandData.industry}
                    onChange={(e) => setBrandData({ ...brandData, industry: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select industry</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="beauty">Beauty & Cosmetics</option>
                    <option value="tech">Technology</option>
                    <option value="food">Food & Beverage</option>
                    <option value="home">Home & Living</option>
                    <option value="jewelry">Jewelry & Accessories</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h1 className="font-display text-3xl font-bold mb-2">Visual Identity</h1>
              <p className="text-muted-foreground mb-8">Define your brand's look and feel</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4">Brand Logo</label>
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drop your logo here or click to upload</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandData.primaryColor}
                        onChange={(e) => setBrandData({ ...brandData, primaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={brandData.primaryColor}
                        onChange={(e) => setBrandData({ ...brandData, primaryColor: e.target.value })}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandData.secondaryColor}
                        onChange={(e) => setBrandData({ ...brandData, secondaryColor: e.target.value })}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={brandData.secondaryColor}
                        onChange={(e) => setBrandData({ ...brandData, secondaryColor: e.target.value })}
                        className="input-field flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h1 className="font-display text-3xl font-bold mb-2">Brand Voice</h1>
              <p className="text-muted-foreground mb-8">How should your brand communicate?</p>

              <div className="space-y-4">
                {["Professional & Authoritative", "Friendly & Approachable", "Bold & Edgy", "Elegant & Refined", "Playful & Fun"].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setBrandData({ ...brandData, tone })}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                      brandData.tone === tone
                        ? "bg-primary/20 border border-primary/50"
                        : "bg-secondary/50 border border-white/5 hover:border-white/20"
                    }`}
                  >
                    <span className={brandData.tone === tone ? "text-foreground" : "text-muted-foreground"}>
                      {tone}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between">
            {currentStep > 1 ? (
              <button onClick={() => setCurrentStep(currentStep - 1)} className="btn-secondary">
                Back
              </button>
            ) : (
              <div />
            )}
            <button onClick={handleNext} className="btn-primary inline-flex items-center gap-2">
              {currentStep === 3 ? "Complete Setup" : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandSetup;
