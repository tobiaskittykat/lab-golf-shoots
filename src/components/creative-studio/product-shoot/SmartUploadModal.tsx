// Stub components for Products page
export const SmartUploadModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="bg-card border border-border rounded-xl p-8 max-w-lg" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-lg mb-4">Smart Upload</h3>
        <p className="text-muted-foreground mb-4">Upload product images for AI analysis</p>
        <button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">Close</button>
      </div>
    </div>
  );
};
