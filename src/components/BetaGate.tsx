import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import logo from "@/assets/kittykat-logo-transparent.png";

const BETA_PASSWORD = "@dmin1";
const STORAGE_KEY = "beta_access";

export default function BetaGate({ children }: { children: ReactNode }) {
  const [granted, setGranted] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  if (granted) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === BETA_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setGranted(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
      <form
        onSubmit={handleSubmit}
        className={`glass-card flex flex-col items-center gap-6 p-10 w-full max-w-sm transition-transform ${error ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        <img src={logo} alt="KittyKat" className="h-10 mb-2" />
        <p className="text-sm text-muted-foreground text-center">Enter the beta password to continue</p>
        <Input
          type="password"
          placeholder="Password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className={error ? "border-destructive" : ""}
        />
        {error && <p className="text-xs text-destructive -mt-4">Incorrect password</p>}
        <Button type="submit" className="w-full">Enter</Button>
      </form>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
