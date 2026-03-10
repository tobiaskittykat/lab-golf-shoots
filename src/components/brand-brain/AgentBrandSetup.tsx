// Stub - AgentBrandSetup
import { AgentDraftState } from "@/hooks/useBrandDrafts";

interface AgentBrandSetupProps {
  onComplete: (data: { name: string; website: string; industry: string; personality: string; tagline: string; socialLinks: Record<string, string> }) => void;
  onCancel: () => void;
  onSaveAndExit: () => void;
  initialState?: AgentDraftState;
  onStateChange: (state: AgentDraftState) => void;
}

export default function AgentBrandSetup({ onComplete, onCancel, onSaveAndExit }: AgentBrandSetupProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-lg mx-auto px-6">
        <h1 className="font-display text-3xl font-bold">AI Brand Setup</h1>
        <p className="text-muted-foreground">Chat-based brand setup coming soon</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={onSaveAndExit} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-colors">Save & Exit</button>
        </div>
      </div>
    </div>
  );
}
