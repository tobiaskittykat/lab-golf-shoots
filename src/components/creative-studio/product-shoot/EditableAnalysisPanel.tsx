import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, Layers, Tag, Stamp, Info, RotateCcw, Plus, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────

interface ComponentData {
  material?: string;
  color?: string;
  colorHex?: string;
  confidence?: number;
  notes?: string;
}

interface BrandingData {
  buckleEngravings?: Array<{ text?: string; style?: string; location?: string }>;
  footbedLogo?: string;
  footbedText?: string;
  otherBranding?: string;
}

export interface ComponentsJson {
  upper?: ComponentData;
  footbed?: ComponentData;
  sole?: ComponentData;
  buckles?: ComponentData;
  lining?: ComponentData;
  heelstrap?: ComponentData;
  branding?: BrandingData;
  strapConstruction?: string;
  analysisVersion?: string;
  analyzedAt?: string;
}

export interface DescriptionJson {
  summary?: string;
  colors?: string[];
  materials?: string[];
  product_type?: string;
  style_keywords?: string[];
  hardware_finish?: string;
}

interface EditableAnalysisPanelProps {
  components: ComponentsJson | null;
  description: DescriptionJson | null;
  onComponentsChange: (c: ComponentsJson) => void;
  onDescriptionChange: (d: DescriptionJson) => void;
  originalComponents: ComponentsJson | null;
  originalDescription: DescriptionJson | null;
}

// ── Constants ──────────────────────────────────────────

const COMPONENT_ORDER: { key: keyof ComponentsJson; label: string }[] = [
  { key: 'upper', label: 'Upper' },
  { key: 'footbed', label: 'Footbed' },
  { key: 'sole', label: 'Sole' },
  { key: 'buckles', label: 'Buckles' },
  { key: 'lining', label: 'Lining' },
  { key: 'heelstrap', label: 'Heelstrap' },
];

// ── Helpers ────────────────────────────────────────────

function isEdited(current: any, original: any): boolean {
  return JSON.stringify(current) !== JSON.stringify(original);
}

// ── Inline field ───────────────────────────────────────

function InlineField({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className="text-muted-foreground font-medium min-w-[80px] flex-shrink-0">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        className="flex-1 bg-transparent border-b border-border/50 focus:border-primary/50 outline-none py-0.5 text-foreground/80 placeholder:text-muted-foreground/50 transition-colors"
      />
    </div>
  );
}

function InlineTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-muted-foreground font-medium min-w-[80px] flex-shrink-0 pt-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        rows={2}
        className="flex-1 bg-transparent border border-border/50 focus:border-primary/50 outline-none rounded px-2 py-1 text-foreground/80 placeholder:text-muted-foreground/50 transition-colors resize-none"
      />
    </div>
  );
}

// ── Editable component row ────────────────────────────

function EditableComponentRow({
  label,
  data,
  onChange,
}: {
  label: string;
  data: ComponentData;
  onChange: (d: ComponentData) => void;
}) {
  const update = (field: keyof ComponentData, val: string) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="py-2 border-b border-border/30 last:border-0 space-y-1.5">
      <div className="flex items-center gap-2">
        {data.colorHex && (
          <input
            type="color"
            value={data.colorHex}
            onChange={(e) => update('colorHex', e.target.value)}
            className="w-4 h-4 rounded-full border border-border/50 cursor-pointer p-0 overflow-hidden flex-shrink-0"
            style={{ appearance: 'none', WebkitAppearance: 'none' }}
          />
        )}
        <span className="text-xs font-medium text-foreground min-w-[70px]">{label}</span>
        {data.confidence != null && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 font-normal bg-muted text-muted-foreground ml-auto"
          >
            {Math.round(data.confidence)}%
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 pl-6">
        <InlineField label="Material" value={data.material || ''} onChange={(v) => update('material', v)} />
        <InlineField label="Color" value={data.color || ''} onChange={(v) => update('color', v)} />
      </div>
      {(data.notes !== undefined || data.notes === '') && (
        <div className="pl-6">
          <InlineField label="Notes" value={data.notes || ''} onChange={(v) => update('notes', v)} placeholder="Optional notes..." />
        </div>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  edited,
  onReset,
}: {
  icon: React.ElementType;
  label: string;
  edited?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      {edited && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 font-normal text-primary border-primary/30">
          Edited
        </Badge>
      )}
      {edited && onReset && (
        <button onClick={onReset} className="ml-auto text-muted-foreground hover:text-foreground transition-colors" title="Reset to AI values">
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────

export function EditableAnalysisPanel({
  components,
  description,
  onComponentsChange,
  onDescriptionChange,
  originalComponents,
  originalDescription,
}: EditableAnalysisPanelProps) {
  const [open, setOpen] = useState(false);

  const hasComponents = components && typeof components === 'object';
  const hasDescription = description && typeof description === 'object';
  if (!hasComponents && !hasDescription) return null;

  const detectedComponents = hasComponents
    ? COMPONENT_ORDER.filter(({ key }) => components[key] && typeof components[key] === 'object')
    : [];

  const version = hasComponents ? components.analysisVersion : null;

  // ── Change handlers ────────────────────────────────

  const updateComponent = (key: keyof ComponentsJson, data: ComponentData) => {
    onComponentsChange({ ...components!, [key]: data });
  };

  const updateBranding = (field: keyof BrandingData, value: any) => {
    const branding = { ...(components?.branding || {}) };
    (branding as any)[field] = value;
    onComponentsChange({ ...components!, branding });
  };

  const addEngraving = () => {
    const engravings = [...(components?.branding?.buckleEngravings || []), { text: '', style: '', location: '' }];
    updateBranding('buckleEngravings', engravings);
  };

  const removeEngraving = (idx: number) => {
    const engravings = (components?.branding?.buckleEngravings || []).filter((_, i) => i !== idx);
    updateBranding('buckleEngravings', engravings);
  };

  const updateEngraving = (idx: number, field: string, value: string) => {
    const engravings = [...(components?.branding?.buckleEngravings || [])];
    engravings[idx] = { ...engravings[idx], [field]: value };
    updateBranding('buckleEngravings', engravings);
  };

  // ── Edited checks ──────────────────────────────────

  const componentsEdited = hasComponents && originalComponents ? isEdited(
    COMPONENT_ORDER.reduce((acc, { key }) => ({ ...acc, [key]: components[key] }), {}),
    COMPONENT_ORDER.reduce((acc, { key }) => ({ ...acc, [key]: originalComponents[key] }), {})
  ) : false;

  const brandingEdited = hasComponents && originalComponents ? isEdited(components.branding, originalComponents.branding) : false;

  const classificationEdited = (() => {
    if (!hasComponents && !hasDescription) return false;
    const cCurrent = { strapConstruction: components?.strapConstruction };
    const cOriginal = { strapConstruction: originalComponents?.strapConstruction };
    const dCurrent = { product_type: description?.product_type, hardware_finish: description?.hardware_finish, colors: description?.colors, materials: description?.materials, style_keywords: description?.style_keywords };
    const dOriginal = { product_type: originalDescription?.product_type, hardware_finish: originalDescription?.hardware_finish, colors: originalDescription?.colors, materials: originalDescription?.materials, style_keywords: originalDescription?.style_keywords };
    return isEdited(cCurrent, cOriginal) || isEdited(dCurrent, dOriginal);
  })();

  // ── Reset handlers ─────────────────────────────────

  const resetComponents = () => {
    if (!originalComponents) return;
    const updated = { ...components! };
    COMPONENT_ORDER.forEach(({ key }) => { (updated as any)[key] = (originalComponents as any)[key]; });
    onComponentsChange(updated);
  };

  const resetBranding = () => {
    if (!originalComponents) return;
    onComponentsChange({ ...components!, branding: originalComponents.branding });
  };

  const resetClassification = () => {
    if (originalComponents) {
      onComponentsChange({ ...components!, strapConstruction: originalComponents.strapConstruction });
    }
    if (originalDescription) {
      onDescriptionChange({
        ...description!,
        product_type: originalDescription.product_type,
        hardware_finish: originalDescription.hardware_finish,
        colors: originalDescription.colors,
        materials: originalDescription.materials,
        style_keywords: originalDescription.style_keywords,
      });
    }
  };

  // ── Branding section data ──────────────────────────

  const branding = hasComponents ? components.branding : null;
  const hasBranding = branding && (
    branding.buckleEngravings?.length ||
    branding.footbedLogo ||
    branding.footbedText ||
    branding.otherBranding
  );

  // ── Build classification fields ────────────────────

  const hasClassification = (hasComponents && components.strapConstruction) ||
    (hasDescription && (description.product_type || description.hardware_finish || description.colors?.length || description.materials?.length || description.style_keywords?.length));

  const analyzedAt = hasComponents && components.analyzedAt
    ? new Date(components.analyzedAt).toLocaleString()
    : null;

  const hasAnyContent = detectedComponents.length > 0 || hasClassification || hasBranding;
  if (!hasAnyContent) return null;

  const summaryParts: string[] = [];
  if (version) summaryParts.push(`v${version}`);
  if (detectedComponents.length > 0) summaryParts.push(`${detectedComponents.length} components`);
  const summaryText = summaryParts.length > 0 ? summaryParts.join(' · ') : 'Details';

  const anyEdited = componentsEdited || brandingEdited || classificationEdited;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg bg-muted/50 border border-border/50 overflow-hidden">
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-muted/80 transition-colors text-left">
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <Cpu className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex-shrink-0">
            AI Analysis
          </span>
          <span className="text-[11px] text-muted-foreground/70 truncate">
            — {summaryText}
          </span>
          {anyEdited && (
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-3.5 font-normal text-primary border-primary/30 ml-auto flex-shrink-0">
              Modified
            </Badge>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-4">
            {/* Section 1: Component Breakdown */}
            {detectedComponents.length > 0 && (
              <div>
                <SectionHeader icon={Layers} label="Component Breakdown" edited={componentsEdited} onReset={resetComponents} />
                <div className="rounded-md bg-background/50 border border-border/30 px-3 py-1">
                  {detectedComponents.map(({ key, label }) => (
                    <EditableComponentRow
                      key={key}
                      label={label}
                      data={components![key] as ComponentData}
                      onChange={(d) => updateComponent(key, d)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Construction & Classification */}
            {hasClassification && (
              <div>
                <SectionHeader icon={Tag} label="Construction & Classification" edited={classificationEdited} onReset={resetClassification} />
                <div className="grid gap-2">
                  {hasComponents && (
                    <InlineField
                      label="Construction"
                      value={components!.strapConstruction || ''}
                      onChange={(v) => onComponentsChange({ ...components!, strapConstruction: v })}
                    />
                  )}
                  {hasDescription && (
                    <>
                      <InlineField
                        label="Product Type"
                        value={description!.product_type || ''}
                        onChange={(v) => onDescriptionChange({ ...description!, product_type: v })}
                      />
                      <InlineField
                        label="Hardware"
                        value={description!.hardware_finish || ''}
                        onChange={(v) => onDescriptionChange({ ...description!, hardware_finish: v })}
                      />
                      <InlineField
                        label="Colors"
                        value={(description!.colors || []).join(', ')}
                        onChange={(v) => onDescriptionChange({ ...description!, colors: v.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Comma-separated..."
                      />
                      <InlineField
                        label="Materials"
                        value={(description!.materials || []).join(', ')}
                        onChange={(v) => onDescriptionChange({ ...description!, materials: v.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Comma-separated..."
                      />
                      <InlineField
                        label="Style"
                        value={(description!.style_keywords || []).join(', ')}
                        onChange={(v) => onDescriptionChange({ ...description!, style_keywords: v.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Comma-separated..."
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Branding Details */}
            {(hasBranding || hasComponents) && (
              <div>
                <SectionHeader icon={Stamp} label="Branding Details" edited={brandingEdited} onReset={resetBranding} />
                <div className="space-y-3">
                  {/* Buckle Engravings */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-muted-foreground font-medium">Buckle Engravings</span>
                      <button
                        onClick={addEngraving}
                        className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    {(branding?.buckleEngravings || []).length > 0 ? (
                      <div className="space-y-1.5">
                        {(branding?.buckleEngravings || []).map((eng, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1.5 border border-border/30">
                            <input
                              value={eng.text || ''}
                              onChange={(e) => updateEngraving(i, 'text', e.target.value)}
                              placeholder="Text"
                              className="flex-1 bg-transparent border-b border-border/30 focus:border-primary/50 outline-none py-0.5 font-mono text-foreground"
                            />
                            <input
                              value={eng.style || ''}
                              onChange={(e) => updateEngraving(i, 'style', e.target.value)}
                              placeholder="Style"
                              className="w-20 bg-transparent border-b border-border/30 focus:border-primary/50 outline-none py-0.5 text-muted-foreground"
                            />
                            <input
                              value={eng.location || ''}
                              onChange={(e) => updateEngraving(i, 'location', e.target.value)}
                              placeholder="Location"
                              className="w-24 bg-transparent border-b border-border/30 focus:border-primary/50 outline-none py-0.5 text-muted-foreground"
                            />
                            <button onClick={() => removeEngraving(i)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/60 italic">No engravings detected</p>
                    )}
                  </div>

                  <InlineField
                    label="Footbed Logo"
                    value={branding?.footbedLogo || ''}
                    onChange={(v) => updateBranding('footbedLogo', v)}
                  />
                  <InlineTextarea
                    label="Footbed Text"
                    value={branding?.footbedText || ''}
                    onChange={(v) => updateBranding('footbedText', v)}
                    placeholder="e.g. BIRKENSTOCK\nMADE IN GERMANY"
                  />
                  <InlineField
                    label="Other"
                    value={branding?.otherBranding || ''}
                    onChange={(v) => updateBranding('otherBranding', v)}
                  />
                </div>
              </div>
            )}

            {/* Section 4: Analysis Metadata (read-only) */}
            {(version || analyzedAt) && (
              <div>
                <SectionHeader icon={Info} label="Analysis Metadata" />
                <div className="grid gap-1 text-xs">
                  {version && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium min-w-[80px]">Version</span>
                      <span className="text-foreground/80">{version}</span>
                    </div>
                  )}
                  {analyzedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium min-w-[80px]">Analyzed</span>
                      <span className="text-foreground/80">{analyzedAt}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
