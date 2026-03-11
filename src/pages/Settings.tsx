import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Wand2, RotateCcw, Save, ChevronDown, ChevronUp, Info, Footprints, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useBrands } from "@/hooks/useBrands";
import { useToast } from "@/hooks/use-toast";
import { 
  DEFAULT_CONCEPT_AGENT_PROMPT, 
  DEFAULT_PROMPT_AGENT_PROMPT,
  DEFAULT_ON_FOOT_SHOT_PROMPT,
  DEFAULT_LIFESTYLE_SHOT_PROMPT,
  DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT,
} from "@/lib/defaultPrompts";

interface AIPrompts {
  conceptAgent?: string;
  promptAgent?: string;
  onFootShotPrompt?: string;
  lifestyleShotPrompt?: string;
  productFocusShotPrompt?: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { currentBrand, updateBrand, isLoading } = useBrands();
  const { toast } = useToast();

  const [conceptPrompt, setConceptPrompt] = useState(DEFAULT_CONCEPT_AGENT_PROMPT);
  const [promptAgentPrompt, setPromptAgentPrompt] = useState(DEFAULT_PROMPT_AGENT_PROMPT);
  const [onFootPrompt, setOnFootPrompt] = useState(DEFAULT_ON_FOOT_SHOT_PROMPT);
  const [lifestylePrompt, setLifestylePrompt] = useState(DEFAULT_LIFESTYLE_SHOT_PROMPT);
  const [productFocusPrompt, setProductFocusPrompt] = useState(DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT);
  
  const [conceptOpen, setConceptOpen] = useState(true);
  const [promptAgentOpen, setPromptAgentOpen] = useState(true);
  const [onFootOpen, setOnFootOpen] = useState(false);
  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [productFocusOpen, setProductFocusOpen] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (currentBrand?.brand_context) {
      const aiPrompts = (currentBrand.brand_context as any)?.aiPrompts as AIPrompts | undefined;
      setConceptPrompt(aiPrompts?.conceptAgent || DEFAULT_CONCEPT_AGENT_PROMPT);
      setPromptAgentPrompt(aiPrompts?.promptAgent || DEFAULT_PROMPT_AGENT_PROMPT);
      setOnFootPrompt(aiPrompts?.onFootShotPrompt || DEFAULT_ON_FOOT_SHOT_PROMPT);
      setLifestylePrompt(aiPrompts?.lifestyleShotPrompt || DEFAULT_LIFESTYLE_SHOT_PROMPT);
      setProductFocusPrompt(aiPrompts?.productFocusShotPrompt || DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT);
      setHasChanges(false);
    }
  }, [currentBrand]);

  const handleChange = (setter: (v: string) => void) => (value: string) => { setter(value); setHasChanges(true); };
  const handleReset = (setter: (v: string) => void, defaultVal: string) => () => { setter(defaultVal); setHasChanges(true); };

  const handleSave = async () => {
    if (!currentBrand) {
      toast({ title: "No brand selected", description: "Please select or create a brand first", variant: "destructive" });
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
          onFootShotPrompt: onFootPrompt === DEFAULT_ON_FOOT_SHOT_PROMPT ? undefined : onFootPrompt,
          lifestyleShotPrompt: lifestylePrompt === DEFAULT_LIFESTYLE_SHOT_PROMPT ? undefined : lifestylePrompt,
          productFocusShotPrompt: productFocusPrompt === DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT ? undefined : productFocusPrompt,
        },
      };
      const { error } = await updateBrand(currentBrand.id, { brand_context: newContext });
      if (error) throw error;
      toast({ title: "Settings saved", description: "Your AI prompt settings have been updated" });
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving settings:", err);
      toast({ title: "Failed to save settings", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  }

  const PromptSection = ({ title, description, icon: Icon, iconBg, prompt, setPrompt, defaultPrompt, isOpen, setIsOpen }: {
    title: string; description: string; icon: any; iconBg: string; prompt: string; setPrompt: (v: string) => void; defaultPrompt: string; isOpen: boolean; setIsOpen: (v: boolean) => void;
  }) => (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${iconBg}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {title}
                    <Tooltip><TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger><TooltipContent side="right" className="max-w-xs">{description}</TooltipContent></Tooltip>
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />}
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <Textarea value={prompt} onChange={(e) => handleChange(setPrompt)(e.target.value)} className="min-h-[200px] font-mono text-sm" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{prompt.length.toLocaleString()} characters</span>
              <Button variant="ghost" size="sm" onClick={handleReset(setPrompt, defaultPrompt)} disabled={prompt === defaultPrompt}>
                <RotateCcw className="h-4 w-4 mr-2" />Reset to Default
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">AI Settings</h1>
            <p className="text-xs text-muted-foreground">Customize AI behavior for {currentBrand?.name || "your brand"}</p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}><Save className="h-4 w-4 mr-2" />{isSaving ? "Saving..." : "Save Changes"}</Button>
        </div>
      </header>

      <main className="container py-6 space-y-6 max-w-4xl">
        {!currentBrand && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">No brand selected. Please create or select a brand to customize AI settings.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/brand-setup")}>Set up brand</Button>
            </CardContent>
          </Card>
        )}

        <PromptSection title="Concept Agent" description="Generates 9-point campaign concepts from your creative brief" icon={Sparkles} iconBg="bg-primary/10 text-primary" prompt={conceptPrompt} setPrompt={setConceptPrompt} defaultPrompt={DEFAULT_CONCEPT_AGENT_PROMPT} isOpen={conceptOpen} setIsOpen={setConceptOpen} />
        <PromptSection title="Prompt Agent" description="Crafts final image generation prompts from your creative direction" icon={Wand2} iconBg="bg-secondary/50 text-secondary-foreground" prompt={promptAgentPrompt} setPrompt={setPromptAgentPrompt} defaultPrompt={DEFAULT_PROMPT_AGENT_PROMPT} isOpen={promptAgentOpen} setIsOpen={setPromptAgentOpen} />

        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-2">
            <Separator className="flex-1" />
            <span className="text-sm font-medium text-muted-foreground px-2">Product Shoot Prompts</span>
            <Separator className="flex-1" />
          </div>
          <PromptSection title="On-Foot Shot Prompt" description="Leg-down shoe focus shots with model wearing the product" icon={Footprints} iconBg="bg-accent/10 text-accent" prompt={onFootPrompt} setPrompt={setOnFootPrompt} defaultPrompt={DEFAULT_ON_FOOT_SHOT_PROMPT} isOpen={onFootOpen} setIsOpen={setOnFootOpen} />
          <PromptSection title="Full Body Shot Prompt" description="Full-body lifestyle shots for lookbook and catalog use" icon={User} iconBg="bg-accent/10 text-accent" prompt={lifestylePrompt} setPrompt={setLifestylePrompt} defaultPrompt={DEFAULT_LIFESTYLE_SHOT_PROMPT} isOpen={lifestyleOpen} setIsOpen={setLifestyleOpen} />
          <PromptSection title="Product Focus Shot Prompt" description="Product-only shots without models for e-commerce listings" icon={Camera} iconBg="bg-accent/10 text-accent" prompt={productFocusPrompt} setPrompt={setProductFocusPrompt} defaultPrompt={DEFAULT_PRODUCT_FOCUS_SHOT_PROMPT} isOpen={productFocusOpen} setIsOpen={setProductFocusOpen} />
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>How it works:</strong> These prompts are the system instructions sent to the AI when generating concepts and images.</p>
                <p><strong>Per-brand settings:</strong> These settings are stored for your current brand ({currentBrand?.name || "none selected"}).</p>
                <p><strong>Reset:</strong> You can always reset to the default prompts if you want to start fresh.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
