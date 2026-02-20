import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Cpu, Layers, Tag, Stamp, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

interface ComponentsJson {
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

interface DescriptionJson {
  summary?: string;
  colors?: string[];
  materials?: string[];
  product_type?: string;
  style_keywords?: string[];
  hardware_finish?: string;
}

interface AIAnalysisPanelProps {
  components: ComponentsJson | null;
  description: DescriptionJson | null;
}

const COMPONENT_ORDER: { key: keyof ComponentsJson; label: string }[] = [
  { key: 'upper', label: 'Upper' },
  { key: 'footbed', label: 'Footbed' },
  { key: 'sole', label: 'Sole' },
  { key: 'buckles', label: 'Buckles' },
  { key: 'lining', label: 'Lining' },
  { key: 'heelstrap', label: 'Heelstrap' },
];

function ComponentRow({ label, data }: { label: string; data: ComponentData }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-2 min-w-[90px] flex-shrink-0">
        {data.colorHex && (
          <div
            className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0"
            style={{ backgroundColor: data.colorHex }}
          />
        )}
        <span className="text-xs font-medium text-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-foreground/80">
            {data.material && data.color
              ? `${data.material} — ${data.color}`
              : data.material || data.color || '—'}
          </span>
          {data.confidence != null && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 font-normal bg-muted text-muted-foreground"
            >
              {Math.round(data.confidence)}%
            </Badge>
          )}
        </div>
        {data.notes && (
          <p className="text-[11px] text-muted-foreground italic mt-0.5 leading-snug">
            {data.notes}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function AIAnalysisPanel({ components, description }: AIAnalysisPanelProps) {
  const [open, setOpen] = useState(false);

  const hasComponents = components && typeof components === 'object';
  const hasDescription = description && typeof description === 'object';

  if (!hasComponents && !hasDescription) return null;

  // Count detected components
  const detectedComponents = hasComponents
    ? COMPONENT_ORDER.filter(
        ({ key }) => components[key] && typeof components[key] === 'object'
      )
    : [];

  const version = hasComponents ? components.analysisVersion : null;
  const componentCount = detectedComponents.length;

  // Build summary label
  const summaryParts: string[] = [];
  if (version) summaryParts.push(`v${version}`);
  if (componentCount > 0) summaryParts.push(`${componentCount} components`);
  if (hasComponents && components.strapConstruction)
    summaryParts.push(components.strapConstruction);

  const summaryText = summaryParts.length > 0 ? summaryParts.join(' · ') : 'Details';

  // Branding section
  const branding = hasComponents ? components.branding : null;
  const hasBranding =
    branding &&
    (branding.buckleEngravings?.length ||
      branding.footbedLogo ||
      branding.footbedText ||
      branding.otherBranding);

  // Classification fields
  const classificationFields: { label: string; value: string }[] = [];
  if (hasComponents && components.strapConstruction)
    classificationFields.push({ label: 'Construction', value: components.strapConstruction });
  if (hasDescription && description.product_type)
    classificationFields.push({ label: 'Product Type', value: description.product_type });
  if (hasDescription && description.hardware_finish)
    classificationFields.push({ label: 'Hardware Finish', value: description.hardware_finish });
  if (hasDescription && description.colors?.length)
    classificationFields.push({ label: 'Colors', value: description.colors.join(', ') });
  if (hasDescription && description.materials?.length)
    classificationFields.push({ label: 'Materials', value: description.materials.join(', ') });
  if (hasDescription && description.style_keywords?.length)
    classificationFields.push({ label: 'Style', value: description.style_keywords.join(', ') });

  const hasClassification = classificationFields.length > 0;

  // Analysis metadata
  const analyzedAt = hasComponents && components.analyzedAt
    ? new Date(components.analyzedAt).toLocaleString()
    : null;

  const hasAnyContent = detectedComponents.length > 0 || hasClassification || hasBranding;
  if (!hasAnyContent) return null;

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
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-4">
            {/* Section 1: Component Breakdown */}
            {detectedComponents.length > 0 && (
              <div>
                <SectionHeader icon={Layers} label="Component Breakdown" />
                <div className="rounded-md bg-background/50 border border-border/30 px-3 py-1">
                  {detectedComponents.map(({ key, label }) => (
                    <ComponentRow
                      key={key}
                      label={label}
                      data={components[key] as ComponentData}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Construction & Classification */}
            {hasClassification && (
              <div>
                <SectionHeader icon={Tag} label="Construction & Classification" />
                <div className="grid gap-1.5">
                  {classificationFields.map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground font-medium min-w-[100px] flex-shrink-0">
                        {label}
                      </span>
                      <span className="text-foreground/80">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Branding Details */}
            {hasBranding && (
              <div>
                <SectionHeader icon={Stamp} label="Branding Details" />
                <div className="space-y-2">
                  {branding!.buckleEngravings && branding!.buckleEngravings.length > 0 && (
                    <div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Buckle Engravings
                      </span>
                      <div className="mt-1 space-y-1">
                        {branding!.buckleEngravings.map((eng, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1 border border-border/30"
                          >
                            <span className="font-mono text-foreground font-medium">
                              "{eng.text}"
                            </span>
                            {eng.style && (
                              <span className="text-muted-foreground">· {eng.style}</span>
                            )}
                            {eng.location && (
                              <span className="text-muted-foreground">· {eng.location}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {branding!.footbedLogo && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground font-medium min-w-[100px] flex-shrink-0">
                        Footbed Logo
                      </span>
                      <span className="text-foreground/80">
                        {branding!.footbedLogo}
                        {branding!.footbedLogoMethod && ` — ${branding!.footbedLogoMethod}`}
                      </span>
                    </div>
                  )}

                  {branding!.footbedText && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground font-medium min-w-[100px] flex-shrink-0">
                        Footbed Text
                      </span>
                      <span className="text-foreground/80 whitespace-pre-line">
                        {branding!.footbedText}
                        {branding!.footbedTextMethod && ` — ${branding!.footbedTextMethod}`}
                      </span>
                    </div>
                  )}

                  {branding!.otherBranding && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground font-medium min-w-[100px] flex-shrink-0">
                        Other
                      </span>
                      <span className="text-foreground/80">{branding!.otherBranding}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Analysis Metadata */}
            {(version || analyzedAt) && (
              <div>
                <SectionHeader icon={Info} label="Analysis Metadata" />
                <div className="grid gap-1 text-xs">
                  {version && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium min-w-[100px]">
                        Version
                      </span>
                      <span className="text-foreground/80">{version}</span>
                    </div>
                  )}
                  {analyzedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium min-w-[100px]">
                        Analyzed
                      </span>
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
