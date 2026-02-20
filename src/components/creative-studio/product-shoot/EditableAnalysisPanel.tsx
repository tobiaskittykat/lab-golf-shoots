import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, Layers, Tag, Stamp, Info, RotateCcw, Plus, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────

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
  footbedLogoMethod?: string;
  footbedText?: string;
  footbedTextMethod?: string;
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
  initialOpen?: boolean;
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

// ── Form field components ─────────────────────────────

function FieldRow({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        className="h-9 text-sm"
      />
    </div>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        rows={2}
        className="text-sm resize-none min-h-[60px]"
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
    <div className="rounded-lg border border-border bg-background p-3 space-y-3">
      <div className="flex items-center gap-2">
        {data.colorHex && (
          <input
            type="color"
            value={data.colorHex}
            onChange={(e) => update('colorHex', e.target.value)}
            className="w-6 h-6 rounded border border-border cursor-pointer p-0 overflow-hidden flex-shrink-0"
            style={{ appearance: 'none', WebkitAppearance: 'none' }}
          />
        )}
        <span className="text-sm font-medium text-foreground">{label}</span>
        {data.confidence != null && (
          <Badge
            variant="secondary"
            className="text-[11px] px-2 py-0.5 h-5 font-normal ml-auto"
          >
            {Math.round(data.confidence)}%
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldRow label="Material" value={data.material || ''} onChange={(v) => update('material', v)} id={`${label}-material`} />
        <FieldRow label="Color" value={data.color || ''} onChange={(v) => update('color', v)} id={`${label}-color`} />
      </div>
      {(data.notes !== undefined || data.notes === '') && (
        <FieldRow label="Notes" value={data.notes || ''} onChange={(v) => update('notes', v)} placeholder="Optional notes..." id={`${label}-notes`} />
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  subtitle,
  edited,
  onReset,
}: {
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  edited?: boolean;
  onReset?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {edited && (
        <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal text-primary border-primary/30">
          Edited
        </Badge>
      )}
      {edited && onReset && (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReset} title="Reset to AI values">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
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
  initialOpen = false,
}: EditableAnalysisPanelProps) {
  const [open, setOpen] = useState(initialOpen);

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
      <div className="rounded-lg bg-muted/30 border border-border overflow-hidden">
        <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left">
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          <Cpu className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium text-foreground flex-shrink-0">
            AI Analysis
          </span>
          <span className="text-xs text-muted-foreground truncate">
            — {summaryText}
          </span>
          {anyEdited && (
            <Badge variant="outline" className="text-xs px-2 py-0.5 font-normal text-primary border-primary/30 ml-auto flex-shrink-0">
              Modified
            </Badge>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-6">
            {/* Section 1: Component Breakdown */}
            {detectedComponents.length > 0 && (
              <div>
                <SectionHeader icon={Layers} label="Component Breakdown" subtitle="Material and color details per component" edited={componentsEdited} onReset={resetComponents} />
                <div className="space-y-3">
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
                <SectionHeader icon={Tag} label="Construction & Classification" subtitle="Product type and style attributes" edited={classificationEdited} onReset={resetClassification} />
                <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                  {hasComponents && (
                    <FieldRow
                      label="Construction"
                      value={components!.strapConstruction || ''}
                      onChange={(v) => onComponentsChange({ ...components!, strapConstruction: v })}
                      id="classification-construction"
                    />
                  )}
                  {hasDescription && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldRow
                          label="Product Type"
                          value={description!.product_type || ''}
                          onChange={(v) => onDescriptionChange({ ...description!, product_type: v })}
                          id="classification-type"
                        />
                        <FieldRow
                          label="Hardware Finish"
                          value={description!.hardware_finish || ''}
                          onChange={(v) => onDescriptionChange({ ...description!, hardware_finish: v })}
                          id="classification-hardware"
                        />
                      </div>
                      <FieldRow
                        label="Colors"
                        value={(description!.colors || []).join(', ')}
                        onChange={(v) => onDescriptionChange({ ...description!, colors: v.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Comma-separated..."
                        id="classification-colors"
                      />
                      <FieldRow
                        label="Materials"
                        value={(description!.materials || []).join(', ')}
                        onChange={(v) => onDescriptionChange({ ...description!, materials: v.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Comma-separated..."
                        id="classification-materials"
                      />
                      <FieldRow
                        label="Style Keywords"
                        value={(description!.style_keywords || []).join(', ')}
                        onChange={(v) => onDescriptionChange({ ...description!, style_keywords: v.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="Comma-separated..."
                        id="classification-style"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Branding Details */}
            {(hasBranding || hasComponents) && (
              <div>
                <SectionHeader icon={Stamp} label="Branding Details" subtitle="Logos, engravings, and markings" edited={brandingEdited} onReset={resetBranding} />
                <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                  {/* Buckle Engravings */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground">Buckle Engravings</Label>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={addEngraving}>
                        <Plus className="w-3.5 h-3.5" /> Add Engraving
                      </Button>
                    </div>
                    {(branding?.buckleEngravings || []).length > 0 ? (
                      <div className="space-y-3">
                        {(branding?.buckleEngravings || []).map((eng, i) => (
                          <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">Engraving {i + 1}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeEngraving(i)}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <FieldRow
                              label="Inscription Text"
                              value={eng.text || ''}
                              onChange={(v) => updateEngraving(i, 'text', v)}
                              placeholder="e.g., BIRKENSTOCK"
                              id={`engraving-${i}-text`}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <FieldRow
                                label="Style"
                                value={eng.style || ''}
                                onChange={(v) => updateEngraving(i, 'style', v)}
                                placeholder="e.g., inscribed, embossed, molded"
                                id={`engraving-${i}-style`}
                              />
                              <FieldRow
                                label="Location"
                                value={eng.location || ''}
                                onChange={(v) => updateEngraving(i, 'location', v)}
                                placeholder="e.g., single buckle, left strap"
                                id={`engraving-${i}-location`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No engravings detected. Click '+ Add Engraving' to add one.</p>
                    )}
                  </div>

                  <FieldRow
                    label="Footbed Logo"
                    value={branding?.footbedLogo || ''}
                    onChange={(v) => updateBranding('footbedLogo', v)}
                    id="branding-logo"
                  />
                  <FieldRow
                    label="Logo Method"
                    value={branding?.footbedLogoMethod || ''}
                    onChange={(v) => updateBranding('footbedLogoMethod', v)}
                    placeholder="e.g., stamped in dark ink, printed, embossed"
                    id="branding-logo-method"
                  />
                  <FieldTextarea
                    label="Footbed Text"
                    value={branding?.footbedText || ''}
                    onChange={(v) => updateBranding('footbedText', v)}
                    placeholder="e.g. BIRKENSTOCK&#10;MADE IN GERMANY"
                    id="branding-text"
                  />
                  <FieldRow
                    label="Text Method"
                    value={branding?.footbedTextMethod || ''}
                    onChange={(v) => updateBranding('footbedTextMethod', v)}
                    placeholder="e.g., heat-stamped, embossed, debossed"
                    id="branding-text-method"
                  />
                  <FieldRow
                    label="Other Branding"
                    value={branding?.otherBranding || ''}
                    onChange={(v) => updateBranding('otherBranding', v)}
                    id="branding-other"
                  />
                </div>
              </div>
            )}

            {/* Section 4: Analysis Metadata (read-only) */}
            {(version || analyzedAt) && (
              <div>
                <SectionHeader icon={Info} label="Analysis Metadata" />
                <div className="rounded-lg border border-border bg-background p-4 space-y-2 text-sm">
                  {version && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground min-w-[80px]">Version</span>
                      <span className="text-foreground">{version}</span>
                    </div>
                  )}
                  {analyzedAt && (
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground min-w-[80px]">Analyzed</span>
                      <span className="text-foreground">{analyzedAt}</span>
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
