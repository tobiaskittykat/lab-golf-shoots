import { useState, useCallback } from "react";
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

interface SocialConnection {
  url: string;
  connected: boolean;
}

const BrandSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [brandData, setBrandData] = useState({
    basics: { name: "", website: "", industry: "", markets: [] as string[], personality: "" },
    files: [] as File[],
    connections: {
      website: { url: "", connected: false },
      instagram: { url: "", connected: false },
      tiktok: { url: "", connected: false },
      pinterest: { url: "", connected: false },
      youtube: { url: "", connected: false },
      paidAds: { url: "", connected: false },
    } as Record<string, SocialConnection>,
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

  // Handle social links found from website crawl
  const handleSocialLinksFound = useCallback((links: Record<string, string>) => {
    setBrandData(prev => {
      const newConnections = { ...prev.connections };
      
      // Map the found social links to our connection format
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

      // Also set the website URL if basics has it
      if (prev.basics.website && newConnections.website) {
        newConnections.website = { url: prev.basics.website, connected: false };
      }

      return { ...prev, connections: newConnections };
    });
  }, []);

  // Keep website URL in sync
  const handleBasicsChange = useCallback((basics: typeof brandData.basics) => {
    setBrandData(prev => {
      const newData = { ...prev, basics };
      // Sync website URL to connections
      if (basics.website && prev.connections.website) {
        newData.connections = {
          ...prev.connections,
          website: { url: basics.website, connected: prev.connections.website.connected }
        };
      }
      return newData;
    });
  }, []);

  if (currentStep === 0) {
    return <WelcomeScreen onStart={() => setCurrentStep(1)} />;
  }

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
