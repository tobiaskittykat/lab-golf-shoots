import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check, X, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProductGroup {
  id: string;
  suggestedName: string;
  suggestedSku: string;
  confidence: number;
  images: Array<{
    id: string;
    url: string;
    detectedAngle: string;
    angleConfidence: number;
  }>;
  productAnalysis: {
    summary: string;
    product_type: string;
    colors: string[];
    materials: string[];
    style_keywords: string[];
  };
}

interface GroupReviewCardProps {
  group: ProductGroup;
  allGroups: ProductGroup[];
  onUpdate: (updates: Partial<ProductGroup>) => void;
  onMoveImage: (imageId: string, toGroupId: string) => void;
}

const angleOptions = ['front', 'side', 'back', '3/4', 'top', 'sole', 'detail', 'unknown'];

export function GroupReviewCard({
  group,
  allGroups,
  onUpdate,
  onMoveImage,
}: GroupReviewCardProps) {
  const [editingName, setEditingName] = useState(false);
  const [editingSku, setEditingSku] = useState(false);
  const [tempName, setTempName] = useState(group.suggestedName);
  const [tempSku, setTempSku] = useState(group.suggestedSku);
  const [expanded, setExpanded] = useState(true);

  const saveName = () => {
    onUpdate({ suggestedName: tempName });
    setEditingName(false);
  };

  const saveSku = () => {
    onUpdate({ suggestedSku: tempSku.toUpperCase() });
    setEditingSku(false);
  };

  const updateImageAngle = (imageId: string, newAngle: string) => {
    onUpdate({
      images: group.images.map(img =>
        img.id === imageId ? { ...img, detectedAngle: newAngle } : img
      ),
    });
  };

  const otherGroups = allGroups.filter(g => g.id !== group.id);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Preview thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {group.images[0] && (
              <img
                src={group.images[0].url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Name */}
            <div className="flex items-center gap-2">
              {editingName ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveName}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingName(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="font-medium truncate">{group.suggestedName}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => { setTempName(group.suggestedName); setEditingName(true); }}
                  >
                    <Pencil className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>

            {/* SKU */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">SKU:</span>
              {editingSku ? (
                <div className="flex items-center gap-1">
                  <Input
                    value={tempSku}
                    onChange={(e) => setTempSku(e.target.value)}
                    className="h-6 text-xs w-40 uppercase"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveSku}>
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingSku(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{group.suggestedSku}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={() => { setTempSku(group.suggestedSku); setEditingSku(true); }}
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </Button>
                </>
              )}
            </div>

            {/* Confidence & count */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {group.images.length} angle{group.images.length !== 1 ? 's' : ''}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${group.confidence >= 80 ? 'text-green-600' : group.confidence >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}
              >
                {group.confidence}% confidence
              </Badge>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            {/* Image grid with angle labels */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {group.images.map((img) => (
                <div key={img.id} className="space-y-1">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {/* Move to another group */}
                    {otherGroups.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute top-1 right-1 w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-3 h-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                            Move to...
                          </DropdownMenuItem>
                          {otherGroups.map(g => (
                            <DropdownMenuItem
                              key={g.id}
                              onClick={() => onMoveImage(img.id, g.id)}
                            >
                              {g.suggestedName}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  {/* Angle selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-full text-xs bg-muted hover:bg-muted/80 rounded px-2 py-1 text-center capitalize">
                        {img.detectedAngle}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {angleOptions.map(angle => (
                        <DropdownMenuItem
                          key={angle}
                          onClick={() => updateImageAngle(img.id, angle)}
                          className="capitalize"
                        >
                          {angle}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {/* Product analysis tags */}
            {group.productAnalysis.colors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {group.productAnalysis.colors.map((color, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{color}</Badge>
                ))}
                {group.productAnalysis.materials.slice(0, 2).map((mat, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{mat}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
