// Stub - CreativeStudioWizard
interface CreativeStudioWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreativeStudioWizard = ({ isOpen, onOpenChange }: CreativeStudioWizardProps) => {
  if (!isOpen) return null;
  return (
    <section className="px-8 py-16 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h2 className="font-display text-2xl font-bold mb-2">Creative Studio</h2>
          <p className="text-muted-foreground">Generate and manage your creative assets</p>
        </div>
      </div>
    </section>
  );
};
