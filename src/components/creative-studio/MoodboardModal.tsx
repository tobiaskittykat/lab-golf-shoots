// Stub - MoodboardModal
interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMoodboard: string | null;
  onSelect: (moodboardId: string, fromGallery?: boolean) => void;
}

export const MoodboardModal = ({ isOpen, onClose }: MoodboardModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl p-8 max-w-lg" onClick={e => e.stopPropagation()}>
        <h3 className="font-semibold text-lg mb-4">Moodboard Gallery</h3>
        <p className="text-muted-foreground mb-4">Your moodboards will appear here</p>
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};
