import { ReactNode, useState } from "react";

interface BetaGateProps {
  children: ReactNode;
}

const BetaGate = ({ children }: BetaGateProps) => {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("kk-beta-access") === "true";
  });
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Accept any code for now
    if (code.trim()) {
      localStorage.setItem("kk-beta-access", "true");
      setIsUnlocked(true);
    }
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">KittyKat Beta</h1>
          <p className="text-muted-foreground">Enter your access code to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter beta access code"
            className="input-field"
          />
          <button type="submit" className="btn-primary w-full">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default BetaGate;
