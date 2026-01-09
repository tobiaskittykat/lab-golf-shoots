import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import WelcomeScreen from "@/components/brand-brain/screens/WelcomeScreen";
import BrandBrainLayout from "@/components/brand-brain/BrandBrainLayout";
import BrandBasicsScreen from "@/components/brand-brain/screens/BrandBasicsScreen";
import UploadAssetsScreen from "@/components/brand-brain/screens/UploadAssetsScreen";
import DigitalFootprintScreen from "@/components/brand-brain/screens/DigitalFootprintScreen";
import SummaryScreen from "@/components/brand-brain/screens/SummaryScreen";
import { useBrands } from "@/hooks/useBrands";

interface SocialConnection {
  url: string;
  connected: boolean;
}

const BrandSetup = () => {
  const navigate = useNavigate();
  const { createBrand } = useBrands();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const [brandData, setBrandData] = useState({
    basics: { name: "", website: "", industry: "", markets: [] as string[], personality: "" },
    files: [] as File[],
    connections: {
      website: { url: "", connected: false },
      instagram: { url: "", connected: false },
      facebook: { url: "", connected: false },
      twitter: { url: "", connected: false },
      tiktok: { url: "", connected: false },
      pinterest: { url: "", connected: false },
      youtube: { url: "", connected: false },
    } as Record<string, SocialConnection>,
  });

  const totalSteps = 4;

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
      assets: {}, // Files would need storage upload - for now empty
    });

    setIsSaving(false);

    if (error) {
      toast.error("Failed to create brand: " + error.message);
      return;
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
