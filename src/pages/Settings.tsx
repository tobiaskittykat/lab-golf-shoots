import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Wand2, RotateCcw, Save, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useBrands } from "@/hooks/useBrands";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_CONCEPT_AGENT_PROMPT, DEFAULT_PROMPT_AGENT_PROMPT } from "@/lib/defaultPrompts";
import { BrandBrainSection } from "@/components/settings/BrandBrainSection";

interface AIPrompts {
  conceptAgent?: string;
  promptAgent?: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { currentBrand, updateBrand, isLoading } = useBrands();
  const { toast } = useToast();

  const [conceptPrompt, setConceptPrompt] = useState("");
  const [promptAgentPrompt, setPromptAgentPrompt] = useState("");
  const [conceptOpen, setConceptOpen] = useState(true);
  const [promptAgentOpen, setPromptAgentOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load prompts from brand context
  useEffect(() => {
    if (currentBrand?.brand_context) {
      const aiPrompts = (currentBrand.brand_context as any)?.aiPrompts as AIPrompts | undefined;
      setConceptPrompt(aiPrompts?.conceptAgent || DEFAULT_CONCEPT_AGENT_PROMPT);
      setPromptAgentPrompt(aiPrompts?.promptAgent || DEFAULT_PROMPT_AGENT_PROMPT);
      setHasChanges(false);
    }
  }, [currentBrand]);

  const handleConceptChange = (value: string) => {
    setConceptPrompt(value);
    setHasChanges(true);
  };

  const handlePromptAgentChange = (value: string) => {
    setPromptAgentPrompt(value);
    setHasChanges(true);
  };

  const handleResetConcept = () => {
    setConceptPrompt(DEFAULT_CONCEPT_AGENT_PROMPT);
    setHasChanges(true);
  };

  const handleResetPromptAgent = () => {
    setPromptAgentPrompt(DEFAULT_PROMPT_AGENT_PROMPT);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!currentBrand) {
      toast({
        title: "No brand selected",
        description: "Please select or create a brand first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const existingContext = currentBrand.brand_context || {};
      const newContext = {
        ...existingContext,
        aiPrompts: {
          conceptAgent: conceptPrompt === DEFAULT_CONCEPT_AGENT_PROMPT ? undefined : conceptPrompt,
          promptAgent: promptAgentPrompt === DEFAULT_PROMPT_AGENT_PROMPT ? undefined : promptAgentPrompt,
        },
      };

      const { error } = await updateBrand(currentBrand.id, {
        brand_context: newContext,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings saved",
        description: "Your AI prompt settings have been updated",
      });
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({
        title: "Failed to save settings",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">AI Settings</h1>
            <p className="text-xs text-muted-foreground">
              Customize AI behavior for {currentBrand?.name || "your brand"}
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 space-y-6 max-w-4xl">
        {!currentBrand && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                No brand selected. Please create or select a brand to customize AI settings.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/brand-setup")}>
                Set up brand
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Brand Brain Section */}
        <BrandBrainSection />

        {/* Concept Agent */}
        <Collapsible open={conceptOpen} onOpenChange={setConceptOpen}>
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        Concept Agent
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            This prompt controls how the AI generates campaign concepts from your creative brief.
                            It defines the 9-point framework structure.
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                      <CardDescription>
                        Generates 9-point campaign concepts from your creative brief
                      </CardDescription>
                    </div>
                  </div>
                  {conceptOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <Textarea
                  value={conceptPrompt}
                  onChange={(e) => handleConceptChange(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Enter custom system prompt..."
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {conceptPrompt.length.toLocaleString()} characters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetConcept}
                    disabled={conceptPrompt === DEFAULT_CONCEPT_AGENT_PROMPT}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Prompt Agent */}
        <Collapsible open={promptAgentOpen} onOpenChange={setPromptAgentOpen}>
          <Card>
            <CardHeader className="pb-3">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <Wand2 className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        Prompt Agent
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            This prompt controls how the AI crafts the final image generation prompt.
                            It synthesizes your concept, moodboard, and brand context into a single creative direction.
                          </TooltipContent>
                        </Tooltip>
                      </CardTitle>
                      <CardDescription>
                        Crafts final image generation prompts from your creative direction
                      </CardDescription>
                    </div>
                  </div>
                  {promptAgentOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <Textarea
                  value={promptAgentPrompt}
                  onChange={(e) => handlePromptAgentChange(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Enter custom system prompt..."
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {promptAgentPrompt.length.toLocaleString()} characters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetPromptAgent}
                    disabled={promptAgentPrompt === DEFAULT_PROMPT_AGENT_PROMPT}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>How it works:</strong> These prompts are the system instructions sent to the AI
                  when generating concepts and images. Customizing them allows you to fine-tune the AI's
                  creative direction for your brand.
                </p>
                <p>
                  <strong>Per-brand settings:</strong> These settings are stored for your current brand
                  ({currentBrand?.name || "none selected"}). Each brand can have its own AI configuration.
                </p>
                <p>
                  <strong>Reset:</strong> You can always reset to the default prompts if you want to
                  start fresh.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
