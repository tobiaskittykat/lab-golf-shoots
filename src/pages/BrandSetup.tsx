import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "@/components/brand-brain/screens/WelcomeScreen";
import BrandBrainLayout from "@/components/brand-brain/BrandBrainLayout";
import BrandBasicsScreen from "@/components/brand-brain/screens/BrandBasicsScreen";
import UploadAssetsScreen from "@/components/brand-brain/screens/UploadAssetsScreen";
import DigitalFootprintScreen from "@/components/brand-brain/screens/DigitalFootprintScreen";
import SummaryScreen from "@/components/brand-brain/screens/SummaryScreen";
import NextActionsScreen from "@/components/brand-brain/screens/NextActionsScreen";

const agentMessages = [
  "Welcome! I'm excited to learn about your brand.",
  "Great choices! I'm already forming a picture of your brand's personality.",
  "Perfect! I'll analyze these files and extract your visual DNA.",
  "Your digital presence tells me a lot about how your brand behaves in the wild.",
  "Your Brand Brain is ready! I've learned so much about your brand.",
  "Let's create something amazing together!",
];

const BrandSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [brandData, setBrandData] = useState({
    basics: { name: "", website: "", industry: "", markets: [] as string[], personality: "" },
    files: [] as File[],
    connections: { website: false, instagram: false, tiktok: false, pinterest: false, youtube: false, paidAds: false },
  });

  const totalSteps = 5;

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps));
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
    2: <UploadAssetsScreen files={brandData.files} onFilesChange={(f) => setBrandData({ ...brandData, files: f })} />,
    3: <DigitalFootprintScreen connections={brandData.connections} onChange={(c) => setBrandData({ ...brandData, connections: c })} />,
    4: <SummaryScreen brandData={brandData} />,
    5: <NextActionsScreen onAction={handleAction} />,
  };

  return (
    <BrandBrainLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      agentMessage={agentMessages[currentStep] || "I'm learning..."}
      agentThinking={currentStep === 2 || currentStep === 3}
      onBack={handleBack}
      onNext={handleNext}
      onSkip={handleSkip}
      nextLabel={currentStep === totalSteps ? "Finish" : currentStep === 4 ? "Continue" : "Continue"}
      showBack={currentStep > 1}
      showSkip={currentStep < 4}
    >
      {screens[currentStep]}
    </BrandBrainLayout>
  );
};

export default BrandSetup;
