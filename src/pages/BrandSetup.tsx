import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import WelcomeScreen from "@/components/brand-brain/screens/WelcomeScreen";
import BrandBrainLayout from "@/components/brand-brain/BrandBrainLayout";
import BrandBasicsScreen from "@/components/brand-brain/screens/BrandBasicsScreen";
import UploadAssetsScreen from "@/components/brand-brain/screens/UploadAssetsScreen";
import DigitalFootprintScreen from "@/components/brand-brain/screens/DigitalFootprintScreen";
import SummaryScreen from "@/components/brand-brain/screens/SummaryScreen";
import AgentBrandSetup from "@/components/brand-brain/AgentBrandSetup";
import { useBrands } from "@/hooks/useBrands";
import { useBrandDrafts, type SocialConnection, type AgentDraftState } from "@/hooks/useBrandDrafts";

const getDefaultConnections = (): Record<string, SocialConnection> => ({
  website: { url: "", connected: false },
  instagram: { url: "", connected: false },
  facebook: { url: "", connected: false },
  twitter: { url: "", connected: false },
  tiktok: { url: "", connected: false },
  pinterest: { url: "", connected: false },
  youtube: { url: "", connected: false },
});

type SetupMode = "welcome" | "agent" | "manual";

const BrandSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createBrand } = useBrands();
  const { drafts, createDraft, updateDraft, deleteDraft, getDraft } = useBrandDrafts();
  
  const [mode, setMode] = useState<SetupMode>("welcome");
  const [draftId, setDraftId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [agentInitialState, setAgentInitialState] = useState<AgentDraftState | undefined>();
  
  const [brandData, setBrandData] = useState({
    basics: { name: "", website: "", industry: "", markets: [] as string[], personality: "" },
    files: [] as File[],
    connections: getDefaultConnections(),
  });

  // Initialize draft on mount
  useEffect(() => {
    const existingDraftId = searchParams.get("draft");
    
    if (existingDraftId) {
      const existingDraft = getDraft(existingDraftId);
      if (existingDraft) {
        setDraftId(existingDraftId);
        
        if (existingDraft.mode === "agent") {
          // Resume agent flow
          setMode("agent");
          setAgentInitialState(existingDraft.agentState);
        } else {
          // Resume manual flow
          setCurrentStep(existingDraft.currentStep);
          setMode("manual");
          setBrandData({
            basics: existingDraft.basics,
            files: [],
            connections: existingDraft.connections,
          });
        }
      } else {
        window.history.replaceState(null, "", "/brand-setup");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft whenever data changes (manual mode only)
  useEffect(() => {
    if (draftId && currentStep > 0 && mode === "manual") {
      updateDraft(draftId, {
        currentStep,
        basics: brandData.basics,
        connections: brandData.connections,
      });
    }
  }, [draftId, currentStep, brandData.basics, brandData.connections, updateDraft, mode]);

  const totalSteps = 4;

  const handleStartAgent = () => {
    const newDraft = createDraft("agent");
    setDraftId(newDraft.id);
    setAgentInitialState(newDraft.agentState);
    setMode("agent");
    window.history.replaceState(null, "", `/brand-setup?draft=${newDraft.id}`);
  };

  const handleStartManual = () => {
    const newDraft = createDraft("manual");
    setDraftId(newDraft.id);
    setCurrentStep(1);
    setMode("manual");
    window.history.replaceState(null, "", `/brand-setup?draft=${newDraft.id}`);
  };

  const handleAgentComplete = async (data: {
    name: string;
    website: string;
    industry: string;
    personality: string;
    tagline: string;
    socialLinks: Record<string, string>;
  }) => {
    setIsSaving(true);

    // Convert social links to connections format
    const connections = getDefaultConnections();
    connections.website = { url: data.website, connected: false };
    for (const [key, url] of Object.entries(data.socialLinks)) {
      if (connections[key]) {
        connections[key] = { url, connected: false };
      }
    }

    const { data: brandResult, error } = await createBrand({
      name: data.name,
      website: data.website || null,
      industry: data.industry || null,
      markets: [],
      personality: data.personality || null,
      social_connections: connections,
      assets: {},
    });

    setIsSaving(false);

    if (error) {
      toast.error("Failed to create brand: " + error.message);
      return;
    }

    toast.success("Brand created successfully!");
    navigate("/");
  };

  const handleAgentCancel = () => {
    if (draftId) {
      deleteDraft(draftId);
    }
    setMode("welcome");
    setDraftId(null);
    setAgentInitialState(undefined);
    window.history.replaceState(null, "", "/brand-setup");
  };

  const handleAgentSaveAndExit = () => {
    toast.success("Draft saved! You can resume anytime.");
    navigate("/");
  };

  const handleAgentStateChange = useCallback((state: AgentDraftState) => {
    if (draftId) {
      updateDraft(draftId, { agentState: state });
    }
  }, [draftId, updateDraft]);

  const handleFinish = async () => {
    if (!brandData.basics.name.trim()) {
      toast.error("Please enter a brand name");
      return;
    }

    setIsSaving(true);
    
    const { data, error } = await createBrand({
      name: brandData.basics.name,
      website: brandData.basics.website || null,
      industry: brandData.basics.industry || null,
      markets: brandData.basics.markets,
      personality: brandData.basics.personality || null,
      social_connections: brandData.connections,
      assets: {},
    });

    setIsSaving(false);

    if (error) {
      toast.error("Failed to create brand: " + error.message);
      return;
    }

    if (draftId) {
      deleteDraft(draftId);
    }
    toast.success("Brand created successfully!");
    navigate("/");
  };

  const handleNext = () => {
    if (currentStep === totalSteps) {
      handleFinish();
    } else {
      setCurrentStep((s) => Math.min(s + 1, totalSteps));
    }
  };
  
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const handleSkip = () => handleNext();

  const handleSocialLinksFound = useCallback((links: Record<string, string>) => {
    setBrandData(prev => {
      const newConnections = { ...prev.connections };
      
      const socialMapping: Record<string, string> = {
        instagram: 'instagram',
        tiktok: 'tiktok',
        pinterest: 'pinterest',
        youtube: 'youtube',
        facebook: 'facebook',
        twitter: 'twitter',
        linkedin: 'linkedin',
      };

      for (const [key, url] of Object.entries(links)) {
        const connectionKey = socialMapping[key];
        if (connectionKey && newConnections[connectionKey]) {
          newConnections[connectionKey] = { url, connected: false };
        }
      }

      if (prev.basics.website && newConnections.website) {
        newConnections.website = { url: prev.basics.website, connected: false };
      }

      return { ...prev, connections: newConnections };
    });
  }, []);

  const handleBasicsChange = useCallback((basics: typeof brandData.basics) => {
    setBrandData(prev => {
      const newData = { ...prev, basics };
      if (basics.website && prev.connections.website) {
        newData.connections = {
          ...prev.connections,
          website: { url: basics.website, connected: prev.connections.website.connected }
        };
      }
      return newData;
    });
  }, []);

  // Welcome screen
  if (mode === "welcome") {
    return (
      <WelcomeScreen 
        onStart={handleStartAgent} 
        onStartManual={handleStartManual}
      />
    );
  }

  // Agent-led setup
  if (mode === "agent") {
    return (
      <AgentBrandSetup
        onComplete={handleAgentComplete}
        onCancel={handleAgentCancel}
        onSaveAndExit={handleAgentSaveAndExit}
        initialState={agentInitialState}
        onStateChange={handleAgentStateChange}
      />
    );
  }

  // Manual setup (existing form-based flow)
  const screens: Record<number, React.ReactNode> = {
    1: (
      <BrandBasicsScreen 
        data={brandData.basics} 
        onChange={handleBasicsChange}
        onSocialLinksFound={handleSocialLinksFound}
      />
    ),
    2: <UploadAssetsScreen files={brandData.files} onFilesChange={(f) => setBrandData({ ...brandData, files: f })} />,
    3: (
      <DigitalFootprintScreen 
        connections={brandData.connections as any} 
        onChange={(c) => setBrandData({ ...brandData, connections: c as any })} 
      />
    ),
    4: <SummaryScreen brandData={brandData} />,
  };

  return (
    <BrandBrainLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
      nextLabel={currentStep === totalSteps ? (isSaving ? "Saving..." : "Finish") : "Continue"}
      showBack={currentStep > 1}
      showSkip={currentStep < 4}
    >
      {screens[currentStep]}
    </BrandBrainLayout>
  );
};

export default BrandSetup;
