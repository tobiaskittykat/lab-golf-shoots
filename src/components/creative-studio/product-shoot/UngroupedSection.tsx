import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, FolderPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UngroupedImage {
  id: string;
  url: string;
  reason: string;
}

interface ProductGroup {
  id: string;
  suggestedName: string;
}

interface UngroupedSectionProps {
  images: UngroupedImage[];
  groups: ProductGroup[];
  onCreateGroup: (imageIds: string[]) => void;
  onMoveToGroup: (imageId: string, groupId: string) => void;
}

export function UngroupedSection({
  images,
  groups,
  onCreateGroup,
  onMoveToGroup,
}: UngroupedSectionProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateGroup = () => {
    if (selectedIds.size > 0) {
      onCreateGroup(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Ungrouped Images</span>
            <Badge variant="outline">{images.length}</Badge>
          </div>
          {selectedIds.size > 0 && (
            <Button size="sm" variant="outline" onClick={handleCreateGroup} className="gap-1">
              <FolderPlus className="w-3 h-3" />
              Create Group ({selectedIds.size})
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          These images couldn't be confidently grouped. Select multiple to create a new product group, or move them individually.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img) => {
            const isSelected = selectedIds.has(img.id);
            return (
              <div key={img.id} className="space-y-1">
                <div
                  className={`relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer ring-2 transition-all ${
                    isSelected ? 'ring-accent' : 'ring-transparent hover:ring-accent/30'
                  }`}
                  onClick={() => toggleSelect(img.id)}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Selection indicator */}
                  <div className={`absolute top-1 left-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-accent border-accent' : 'border-white/70 bg-black/30'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-accent-foreground" />}
                  </div>

                  {/* Quick add to group */}
                  {groups.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="absolute bottom-1 right-1 w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          Add to...
                        </DropdownMenuItem>
                        {groups.map(g => (
                          <DropdownMenuItem
                            key={g.id}
                            onClick={() => onMoveToGroup(img.id, g.id)}
                          >
                            {g.suggestedName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate" title={img.reason}>
                  {img.reason}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
