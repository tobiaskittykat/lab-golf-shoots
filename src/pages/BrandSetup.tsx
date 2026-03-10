// Stub - to be filled from source repo
import { useNavigate } from "react-router-dom";

const BrandSetup = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="font-display text-3xl font-bold">Brand Setup</h1>
        <p className="text-muted-foreground">Set up your brand to get started</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Continue
        </button>
      </div>
    </div>
  );
};

export default BrandSetup;
