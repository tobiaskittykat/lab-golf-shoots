import { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Grid3X3, Wand2, Check, Loader2, Trash2, RefreshCw } from "lucide-react";
import { Moodboard } from "./types";
import { MoodboardThumbnail } from "./MoodboardThumbnail";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMoodboard: string | null;
  onSelect: (moodboardId: string, fromGallery: boolean) => void;
}

// CustomMoodboard removed - now using Moodboard type from types.ts for cache consistency

interface RepairChange {
  id: string;
  oldName: string;
  newName: string;
  consistencyNotes: string;
}

export const MoodboardModal = ({ 
  isOpen, 
  onClose, 
  selectedMoodboard, 
  onSelect 
}: MoodboardModalProps) => {
  const [activeTab, setActiveTab] = useState("browse");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState({ processed: 0, total: 0 });
  const [repairChanges, setRepairChanges] = useState<RepairChange[]>([]);
  const [showRepairConfirm, setShowRepairConfirm] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch custom moodboards - transform to Moodboard shape for cache consistency with StepTwoCustomize
  const { data: customMoodboards = [], isLoading: loadingCustom } = useQuery<Moodboard[]>({
    queryKey: ['custom-moodboards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('custom_moodboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to Moodboard shape (matching StepTwoCustomize)
      return (data || []).map(m => ({
        id: `custom-${m.id}`,
        name: m.name,
        thumbnail: m.thumbnail_url,
        filePath: m.file_path,
        description: m.description || 'Custom moodboard',
      }));
    },
    enabled: !!user?.id && isOpen,
  });

  const handleSelect = (moodboardId: string) => {
    onSelect(moodboardId, true); // fromGallery = true when selecting from modal
    onClose();
  };

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    if (!user?.id) {
      toast({ title: 'Please sign in to upload moodboards', variant: 'destructive' });
      return;
    }

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => 
      f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024
    );

    if (validFiles.length === 0) {
      toast({ title: 'Please upload valid images (PNG, JPG) under 10MB', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setUploadProgress([]);

    try {
      for (const file of validFiles) {
        const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        setUploadProgress(prev => [...prev, `Uploading ${file.name}...`]);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('moodboards')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('moodboards')
          .getPublicUrl(fileName);

        // Create metadata record
        const { data: insertedMoodboard, error: dbError } = await supabase
          .from('custom_moodboards')
          .insert({
            user_id: user.id,
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            file_path: fileName,
            thumbnail_url: urlData.publicUrl,
          })
          .select('id')
          .single();

        if (dbError) throw dbError;

        // Trigger AI repair to get correct name/description from image
        if (insertedMoodboard?.id) {
          setUploadProgress(prev => [...prev, `Analyzing ${file.name}...`]);
          supabase.functions.invoke('repair-moodboard-metadata', {
            body: { moodboardId: insertedMoodboard.id }
          }).then(res => {
            if (res.error) {
              console.error('Moodboard metadata repair failed:', res.error);
            } else {
              console.log('Moodboard metadata repaired:', res.data);
              queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
            }
          });
        }

        setUploadProgress(prev => [...prev, `✓ ${file.name} uploaded`]);
      }

      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
      toast({ title: `${validFiles.length} moodboard(s) uploaded successfully` });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Failed to upload moodboard', variant: 'destructive' });
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
    }
  }, [user?.id, toast, queryClient]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDeleteCustomMoodboard = async (moodboard: Moodboard) => {
    try {
      // Extract raw ID (strip custom- prefix) and file path
      const rawId = moodboard.id.replace(/^custom-/, '');
      const filePath = moodboard.filePath || '';
      
      // Delete from storage
      if (filePath) {
        await supabase.storage.from('moodboards').remove([filePath]);
      }
      
      // Delete from database
      await supabase.from('custom_moodboards').delete().eq('id', rawId);
      
      queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
      toast({ title: 'Moodboard deleted' });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Repair all moodboards batch function
  const handleRepairAllMoodboards = async () => {
    setShowRepairConfirm(false);
    setIsRepairing(true);
    setRepairChanges([]);
    setRepairProgress({ processed: 0, total: customMoodboards.length });

    let cursor: string | null = null;
    let totalProcessed = 0;
    const allChanges: RepairChange[] = [];

    try {
      // Loop until done
      while (true) {
        const { data, error } = await supabase.functions.invoke('repair-moodboard-metadata', {
          body: { batch: true, limit: 4, cursor, force: true }
        });

        if (error) {
          console.error('Repair batch error:', error);
          toast({ title: 'Repair failed', description: error.message, variant: 'destructive' });
          break;
        }

        totalProcessed += data.processed || 0;
        setRepairProgress({ processed: totalProcessed, total: data.totalCount || customMoodboards.length });

        if (data.changes) {
          allChanges.push(...data.changes);
          setRepairChanges([...allChanges]);
        }

        if (data.done || !data.nextCursor) {
          break;
        }

        cursor = data.nextCursor;
      }

      // Force immediate refetch across all components using this query
      await queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
      await queryClient.refetchQueries({ queryKey: ['custom-moodboards'] });
      toast({ 
        title: 'All moodboards repaired!', 
        description: `Updated ${allChanges.length} moodboard names & descriptions` 
      });
    } catch (err) {
      console.error('Repair error:', err);
      toast({ title: 'Repair failed', variant: 'destructive' });
    } finally {
      setIsRepairing(false);
    }
  };

  // All moodboards come from the database now - already transformed in query
  const allMoodboards: Moodboard[] = customMoodboards;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Choose a Moodboard</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Browse Gallery
            </TabsTrigger>
            <TabsTrigger value="build" className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Build Your Own
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allMoodboards.map((moodboard) => (
                <MoodboardThumbnail
                  key={moodboard.id}
                  moodboard={moodboard}
                  isSelected={selectedMoodboard === moodboard.id}
                  onSelect={() => handleSelect(moodboard.id)}
                  size="large"
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="build" className="flex-1 mt-4">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Wand2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Build Your Own Moodboard</h4>
              <p className="text-sm text-muted-foreground max-w-sm">
                Coming soon! You'll be able to combine colors, textures, and reference images to create a custom moodboard.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 mt-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Upload Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative w-full aspect-video max-h-48 rounded-xl border-2 border-dashed transition-all ${
                  isDragging 
                    ? 'border-accent bg-accent/10' 
                    : 'border-border hover:border-accent/50 bg-secondary/30'
                } flex flex-col items-center justify-center gap-3`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-accent animate-spin" />
                    <div className="text-center">
                      <p className="font-medium text-foreground">Uploading...</p>
                      {uploadProgress.map((msg, i) => (
                        <p key={i} className="text-xs text-muted-foreground">{msg}</p>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className={`w-10 h-10 ${isDragging ? 'text-accent' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        {isDragging ? 'Drop files here' : 'Upload moodboard images'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 10MB · Multiple files supported</p>
                    </div>
                  </>
                )}
              </div>

              {/* Custom Moodboards List */}
              {customMoodboards.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">Your Moodboards</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRepairConfirm(true)}
                      disabled={isRepairing}
                      className="gap-2"
                    >
                      {isRepairing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Repairing {repairProgress.processed}/{repairProgress.total}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          Repair All Names
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Repair progress / changes */}
                  {isRepairing && repairChanges.length > 0 && (
                    <div className="p-3 bg-secondary/50 rounded-lg text-xs space-y-1 max-h-32 overflow-y-auto">
                      {repairChanges.slice(-5).map((change, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-accent shrink-0" />
                          <span className="text-muted-foreground line-through">{change.oldName}</span>
                          <span>→</span>
                          <span className="text-foreground font-medium">{change.newName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {customMoodboards.map((moodboard) => (
                      <div key={moodboard.id} className="group relative">
                        <MoodboardThumbnail
                          moodboard={moodboard}
                          isSelected={selectedMoodboard === moodboard.id}
                          onSelect={() => handleSelect(moodboard.id)}
                          size="default"
                        />
                        {/* Delete button overlay */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomMoodboard(moodboard); }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive z-20"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Repair Confirmation Dialog */}
      <AlertDialog open={showRepairConfirm} onOpenChange={setShowRepairConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Repair All Moodboard Names?</AlertDialogTitle>
            <AlertDialogDescription>
              This will re-analyze all {customMoodboards.length} moodboard images using AI and update their names and descriptions to match what's actually visible in each image. This may take a minute or two.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRepairAllMoodboards}>
              Repair All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
