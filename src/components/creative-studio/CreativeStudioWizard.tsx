import { useState, useCallback } from "react";
import { Image, ChevronDown, ChevronRight, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CreativeStudioHeader } from "./CreativeStudioHeader";
import { StepOnePrompt } from "./StepOnePrompt";
import { StepTwoCustomize } from "./StepTwoCustomize";
import { CreativeStudioState, initialCreativeStudioState, Concept } from "./types";

// Mock concept generation - replace with actual AI call later
const generateMockConcepts = (prompt: string): Concept[] => {
  const concepts: Concept[] = [
    {
      id: 'concept-1',
      title: 'Morning Light Collection',
      description: 'Golden hour product shot with warm, inviting tones. Soft shadows on neutral backdrop emphasizing the natural beauty and craftsmanship.',
      tags: ['Warm', 'Natural', 'Editorial']
    },
    {
      id: 'concept-2', 
      title: 'Urban Elegance',
      description: 'Modern city setting with glass reflections and sophisticated architectural elements. Editorial feel with high-contrast lighting.',
      tags: ['Modern', 'Bold', 'Sophisticated']
    },
    {
      id: 'concept-3',
      title: 'Natural Luxury',
      description: 'Organic textures and earth tones celebrating sustainability and authenticity. Soft, diffused lighting with natural materials.',
      tags: ['Organic', 'Sustainable', 'Soft']
    }
  ];
  return concepts;
};

interface CreativeStudioWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreativeStudioWizard = ({ isOpen, onOpenChange }: CreativeStudioWizardProps) => {
  const [state, setState] = useState<CreativeStudioState>(initialCreativeStudioState);

  const handleUpdate = useCallback((updates: Partial<CreativeStudioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleContinue = useCallback(async () => {
    // Simulate loading concepts
    handleUpdate({ isLoadingConcepts: true, step: 2 });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const concepts = generateMockConcepts(state.prompt);
    handleUpdate({ 
      concepts, 
      isLoadingConcepts: false,
      selectedConcept: concepts[0]?.id || null
    });
  }, [state.prompt, handleUpdate]);

  const handleBack = useCallback(() => {
    handleUpdate({ step: 1 });
  }, [handleUpdate]);

  const handleGenerate = useCallback(async () => {
    handleUpdate({ isGenerating: true });
    
    // TODO: Implement actual generation
    console.log('Generating with state:', state);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    handleUpdate({ isGenerating: false });
  }, [state, handleUpdate]);

  return (
    <section className="px-8 py-16 border-t border-border bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
          <div className="flex items-center gap-3 mb-6">
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Visual Media</p>
              <h2 className="font-display text-2xl font-bold">Creative Studio</h2>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 1 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                1
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                state.step === 2 ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>

          <CollapsibleContent>
            {state.step === 1 ? (
              <div className="glass-card p-6">
                <CreativeStudioHeader
                  state={state}
                  onUpdate={handleUpdate}
                  onRegenerate={handleContinue}
                  showRegenerate={false}
                />
                <StepOnePrompt 
                  state={state} 
                  onUpdate={handleUpdate}
                />
                
                {/* Step 1 Footer */}
                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {state.prompt ? '✨ Ready to generate concepts' : 'Enter a brief to continue'}
                  </div>
                  <button
                    onClick={handleContinue}
                    disabled={!state.prompt.trim()}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                    style={{
                      boxShadow: state.prompt.trim() ? '0 8px 32px rgba(107, 124, 255, 0.25)' : undefined
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    Create Concepts
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6 relative">
                <CreativeStudioHeader
                  state={state}
                  onUpdate={handleUpdate}
                  onRegenerate={handleContinue}
                  showRegenerate={true}
                />
                
                {/* Content with bottom padding for sticky footer */}
                <div className="pb-24">
                  <StepTwoCustomize
                    state={state}
                    onUpdate={handleUpdate}
                  />
                </div>

                {/* Sticky Footer - sticks within card boundaries */}
                <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-card/95 backdrop-blur-sm border-t border-border rounded-b-2xl z-10">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    
                    <span className="text-sm text-muted-foreground">
                      {state.selectedConcept ? '✓ 1 concept selected' : 'No concept selected'}
                    </span>
                    
                    <button
                      onClick={handleGenerate}
                      disabled={state.isGenerating}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-coral to-primary text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                      style={{
                        boxShadow: !state.isGenerating ? '0 8px 32px rgba(107, 124, 255, 0.25)' : undefined
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                      Generate ({(1700 + (state.imageCount - 1) * 400).toLocaleString()} tokens)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};
