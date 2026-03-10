// Stub - BrandBrain component stubs
export default function WelcomeScreen({ onStart, onStartManual }: { onStart: () => void; onStartManual: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-lg mx-auto px-6">
        <h1 className="font-display text-4xl font-bold">Welcome to Brand Brain</h1>
        <p className="text-muted-foreground text-lg">Let's set up your brand identity. Choose how you'd like to get started.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onStart} className="px-6 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-colors">
            ✨ AI-Guided Setup
          </button>
          <button onClick={onStartManual} className="px-6 py-3 rounded-xl border border-border bg-secondary/50 text-foreground font-medium hover:bg-secondary transition-colors">
            📝 Manual Setup
          </button>
        </div>
      </div>
    </div>
  );
}
