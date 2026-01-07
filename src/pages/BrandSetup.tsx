import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/brand-brain/screens/WelcomeScreen";
import BrandBrainLayout from "@/components/brand-brain/BrandBrainLayout";
import BrandBasicsScreen from "@/components/brand-brain/screens/BrandBasicsScreen";
import BrandSentenceScreen from "@/components/brand-brain/screens/BrandSentenceScreen";
import UploadAssetsScreen from "@/components/brand-brain/screens/UploadAssetsScreen";
import DigitalFootprintScreen from "@/components/brand-brain/screens/DigitalFootprintScreen";
import GuardrailsScreen from "@/components/brand-brain/screens/GuardrailsScreen";
import VoiceToneScreen from "@/components/brand-brain/screens/VoiceToneScreen";
import MarketsScreen from "@/components/brand-brain/screens/MarketsScreen";
import SuccessScreen from "@/components/brand-brain/screens/SuccessScreen";
import SummaryScreen from "@/components/brand-brain/screens/SummaryScreen";
import NextActionsScreen from "@/components/brand-brain/screens/NextActionsScreen";

const agentMessages = [
  "Welcome! I'm excited to learn about your brand.",
  "Great choices! I'm already forming a picture of your brand's personality.",
  "This helps me understand your brand's soul. Keep going!",
  "Perfect! I'll analyze these files and extract your visual DNA.",
  "Your digital presence tells me a lot about how your brand behaves in the wild.",
  "These guardrails are crucial — I'll never break them.",
  "Voice and tone are essential. I'm learning how your brand speaks.",
  "Understanding regional nuances helps me create more relevant content.",
  "This helps me prioritize what matters most to you.",
  "Your Brand Brain is ready! I've learned so much about your brand.",
  "Let's create something amazing together!",
];

const BrandSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [brandData, setBrandData] = useState({
    basics: { name: "", website: "", industry: "", markets: [] as string[], personality: "" },
    sentence: "",
    files: [] as File[],
    connections: { website: false, instagram: false, tiktok: false, pinterest: false, youtube: false, paidAds: false },
    guardrails: { logoUsage: 50, colorUsage: 50, photographyStyle: "", doNotUse: "" },
    voiceTone: { formalCasual: 50, emotionalRational: 50, boldSubtle: 50 },
    markets: [] as { name: string; approach: "global" | "local"; notes: string }[],
    success: { goals: [] as string[], useCases: [] as string[] },
  });

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 10));
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const handleSkip = () => handleNext();

  const handleAction = (action: string) => {
    if (action === "campaign") navigate("/create-campaign");
    else if (action === "moodboard") navigate("/create-image");
    else navigate("/");
  };

  if (currentStep === 0) {
    return <WelcomeScreen onStart={() => setCurrentStep(1)} />;
  }

  const screens: Record<number, React.ReactNode> = {
    1: <BrandBasicsScreen data={brandData.basics} onChange={(d) => setBrandData({ ...brandData, basics: d })} />,
    2: <BrandSentenceScreen value={brandData.sentence} onChange={(v) => setBrandData({ ...brandData, sentence: v })} />,
    3: <UploadAssetsScreen files={brandData.files} onFilesChange={(f) => setBrandData({ ...brandData, files: f })} />,
    4: <DigitalFootprintScreen connections={brandData.connections} onChange={(c) => setBrandData({ ...brandData, connections: c })} />,
    5: <GuardrailsScreen data={brandData.guardrails} onChange={(d) => setBrandData({ ...brandData, guardrails: d })} />,
    6: <VoiceToneScreen data={brandData.voiceTone} onChange={(d) => setBrandData({ ...brandData, voiceTone: d })} />,
    7: <MarketsScreen markets={brandData.markets} onChange={(m) => setBrandData({ ...brandData, markets: m })} />,
    8: <SuccessScreen data={brandData.success} onChange={(d) => setBrandData({ ...brandData, success: d })} />,
    9: <SummaryScreen brandData={brandData} />,
    10: <NextActionsScreen onAction={handleAction} />,
  };

  return (
    <BrandBrainLayout
      currentStep={currentStep}
      totalSteps={10}
      agentMessage={agentMessages[currentStep] || "I'm learning..."}
      agentThinking={currentStep === 3 || currentStep === 4}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
      nextLabel={currentStep === 10 ? "Finish" : currentStep === 9 ? "Continue" : "Continue"}
      showBack={currentStep > 1}
      showSkip={currentStep < 9}
    >
      {screens[currentStep]}
    </BrandBrainLayout>
  );
};

export default BrandSetup;
