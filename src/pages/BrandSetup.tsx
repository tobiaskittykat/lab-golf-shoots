import { useState, useCallback, useEffect, useRef } from "react";
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
  const isCancelledRef = useRef(false);
  const [brandData, setBrandData] = useState({
    basics: { name: "", website: "", industry: "", markets: [] as string[], personality: "", brandContext: {} as any },
    files: [] as File[],
    connections: getDefaultConnections(),
  });

  useEffect(() => {
    const existingDraftId = searchParams.get("draft");
    if (existingDraftId) {
      const existingDraft = getDraft(existingDraftId);
      if (existingDraft) {
        setDraftId(existingDraftId);
        if (existingDraft.mode === "agent") {
          setMode("agent");
          setAgentInitialState(existingDraft.agentState);
        } else {
          setCurrentStep(existingDraft.currentStep);
          setMode("manual");
          setBrandData({ basics: { ...existingDraft.basics, brandContext: (existingDraft.basics as any).brandContext || {} }, files: [], connections: existingDraft.connections });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (draftId && currentStep > 0 && mode === "manual" && !isCancelledRef.current) {
      updateDraft(draftId, { currentStep, basics: brandData.basics, connections: brandData.connections });
    }
  }, [draftId, currentStep, brandData.basics, brandData.connections, updateDraft, mode]);

  const totalSteps = 4;
  const handleStartAgent = () => { const d = createDraft("agent"); setDraftId(d.id); setAgentInitialState(d.agentState); setMode("agent"); };
  const handleStartManual = () => { const d = createDraft("manual"); setDraftId(d.id); setCurrentStep(1); setMode("manual"); };

  const handleAgentComplete = async (data: any) => {
    isCancelledRef.current = true;
    setIsSaving(true);
    const connections = getDefaultConnections();
    connections.website = { url: data.website, connected: false };
    for (const [key, url] of Object.entries(data.socialLinks || {})) {
      if (connections[key]) connections[key] = { url: url as string, connected: false };
    }
    const { error } = await createBrand({ name: data.name, website: data.website || null, industry: data.industry || null, markets: [], personality: data.personality || null, social_connections: connections, assets: {} });
    setIsSaving(false);
    if (error) { toast.error("Failed: " + error.message); isCancelledRef.current = false; return; }
    if (draftId) deleteDraft(draftId);
    toast.success("Brand created!"); navigate("/");
  };

  const handleAgentCancel = () => { isCancelledRef.current = true; if (draftId) deleteDraft(draftId); navigate("/"); };
  const handleAgentSaveAndExit = () => { toast.success("Draft saved!"); navigate("/"); };
  const handleAgentStateChange = useCallback((state: AgentDraftState) => { if (draftId && !isCancelledRef.current) updateDraft(draftId, { agentState: state }); }, [draftId, updateDraft]);

  const handleFinish = async () => {
    if (!brandData.basics.name.trim()) { toast.error("Please enter a brand name"); return; }
    setIsSaving(true);
    const { error } = await createBrand({ name: brandData.basics.name, website: brandData.basics.website || null, industry: brandData.basics.industry || null, markets: brandData.basics.markets, personality: brandData.basics.personality || null, social_connections: brandData.connections, assets: {}, brand_context: brandData.basics.brandContext || {} });
    setIsSaving(false);
    if (error) { toast.error("Failed: " + error.message); return; }
    if (draftId) deleteDraft(draftId);
    toast.success("Brand created!"); navigate("/");
  };

  const handleNext = () => { currentStep === totalSteps ? handleFinish() : setCurrentStep(s => Math.min(s + 1, totalSteps)); };
  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 1));
  const handleManualCancel = () => { isCancelledRef.current = true; if (draftId) deleteDraft(draftId); navigate("/"); };

  const handleBasicsChange = useCallback((basics: typeof brandData.basics) => {
    setBrandData(prev => {
      const d = { ...prev, basics };
      if (basics.website && prev.connections.website) d.connections = { ...prev.connections, website: { url: basics.website, connected: prev.connections.website.connected } };
      return d;
    });
  }, []);

  if (mode === "welcome") return <WelcomeScreen onStart={handleStartAgent} onStartManual={handleStartManual} />;
  if (mode === "agent") return <AgentBrandSetup onComplete={handleAgentComplete} onCancel={handleAgentCancel} onSaveAndExit={handleAgentSaveAndExit} initialState={agentInitialState} onStateChange={handleAgentStateChange} />;

  const screens: Record<number, React.ReactNode> = {
    1: <BrandBasicsScreen data={brandData.basics} onChange={handleBasicsChange} />,
    2: <UploadAssetsScreen files={brandData.files} onFilesChange={f => setBrandData({ ...brandData, files: f })} />,
    3: <DigitalFootprintScreen connections={brandData.connections} onChange={c => setBrandData({ ...brandData, connections: c })} />,
    4: <SummaryScreen brandData={brandData} />,
  };

  return (
    <BrandBrainLayout currentStep={currentStep} totalSteps={totalSteps} onBack={handleBack} onNext={handleNext} onSkip={handleNext} onCancel={handleManualCancel} nextLabel={currentStep === totalSteps ? (isSaving ? "Saving..." : "Finish") : "Continue"} showBack={currentStep > 1} showSkip={currentStep < 4}>
      {screens[currentStep]}
    </BrandBrainLayout>
  );
};

export default BrandSetup;
