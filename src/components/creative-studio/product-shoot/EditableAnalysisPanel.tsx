import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

const COMPONENT_DISPLAY_ORDER = ["upper", "footbed", "sole", "buckles", "heelstrap", "lining"];

const ComponentEditor = ({
  componentType,
  data,
  onChange,
  original,
}: {
  componentType: string;
  data: { material?: string; color?: string; [key: string]: any };
  onChange: (updated: any) => void;
  original?: { material?: string; color?: string };
}) => {
  const isChanged =
    original && (data.material !== original.material || data.color !== original.color);

  return (
    <div className={cn("p-3 rounded-lg border", isChanged ? "border-accent/50 bg-accent/5" : "border-border")}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium capitalize">{componentType}</h4>
        {isChanged && <span className="text-[10px] text-accent font-medium">Modified</span>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Material</Label>
          <Input
            value={data.material || ""}
            onChange={(e) => onChange({ ...data, material: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Color</Label>
          <Input
            value={data.color || ""}
            onChange={(e) => onChange({ ...data, color: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export const EditableAnalysisPanel = ({
  components,
  description,
  onComponentsChange,
  onDescriptionChange,
  originalComponents,
  originalDescription,
  initialOpen = false,
}: EditableAnalysisPanelProps) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  if (!components) {
    return (
      <div className="p-4 rounded-lg border border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">No AI analysis available yet</p>
      </div>
    );
  }

  const editableComponents = COMPONENT_DISPLAY_ORDER.filter(
    (type) => components[type] && typeof components[type] === "object"
  );

  const hasChanges =
    originalComponents &&
    editableComponents.some((type) => {
      const current = components[type];
      const original = originalComponents[type];
      return (
        current &&
        original &&
        (current.material !== original.material || current.color !== original.color)
      );
    });

  const handleReset = () => {
    if (originalComponents) {
      onComponentsChange(JSON.parse(JSON.stringify(originalComponents)));
    }
    if (originalDescription) {
      onDescriptionChange(JSON.parse(JSON.stringify(originalDescription)));
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">AI Analysis</span>
          <span className="text-xs text-muted-foreground">
            ({editableComponents.length} components)
          </span>
          {hasChanges && (
            <span className="px-1.5 py-0.5 bg-accent/10 text-accent text-[10px] rounded font-medium">
              Edited
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-4 pt-0 space-y-3">
          {editableComponents.map((type) => (
            <ComponentEditor
              key={type}
              componentType={type}
              data={components[type]}
              onChange={(updated) => {
                const newComponents = { ...components, [type]: updated };
                onComponentsChange(newComponents);
              }}
              original={originalComponents?.[type]}
            />
          ))}

          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
              <RotateCcw className="w-3 h-3" />
              Reset to Original
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
