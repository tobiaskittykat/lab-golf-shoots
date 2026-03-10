// Stub - EditableAnalysisPanel
export type ComponentsJson = Record<string, any>;
export type DescriptionJson = Record<string, any>;

interface EditableAnalysisPanelProps {
  components: ComponentsJson | null;
  description: DescriptionJson | null;
  onComponentsChange: (c: ComponentsJson | null) => void;
  onDescriptionChange: (d: DescriptionJson | null) => void;
  originalComponents: ComponentsJson | null;
  originalDescription: DescriptionJson | null;
  initialOpen?: boolean;
}

export const EditableAnalysisPanel = ({ components, initialOpen }: EditableAnalysisPanelProps) => {
  if (!components) {
    return (
      <div className="p-4 rounded-lg border border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">No AI analysis available yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-border">
      <h3 className="font-semibold mb-2">AI Analysis</h3>
      <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-60">
        {JSON.stringify(components, null, 2)}
      </pre>
    </div>
  );
};
