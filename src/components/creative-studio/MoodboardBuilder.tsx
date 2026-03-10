// Stub - MoodboardBuilder
interface MoodboardBuilderProps {
  onComplete: (moodboardId: string) => void;
  onCancel: () => void;
}

export const MoodboardBuilder = ({ onComplete, onCancel }: MoodboardBuilderProps) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">Moodboard builder coming soon</p>
      <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors">
        Cancel
      </button>
    </div>
  );
};
