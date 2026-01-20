import { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Grid3X3, Wand2, Check, Loader2, X, Trash2 } from "lucide-react";
import { sampleMoodboards, Moodboard } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface MoodboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMoodboard: string | null;
  onSelect: (moodboardId: string) => void;
}

interface CustomMoodboard {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string;
  file_path: string;
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
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch custom moodboards
  const { data: customMoodboards = [], isLoading: loadingCustom } = useQuery({
    queryKey: ['custom-moodboards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('custom_moodboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CustomMoodboard[];
    },
    enabled: !!user?.id && isOpen,
  });

  const handleSelect = (moodboardId: string) => {
    onSelect(moodboardId);
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
        const { error: dbError } = await supabase
          .from('custom_moodboards')
          .insert({
            user_id: user.id,
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            file_path: fileName,
            thumbnail_url: urlData.publicUrl,
          });

        if (dbError) throw dbError;

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

  const handleDeleteCustomMoodboard = async (moodboard: CustomMoodboard) => {
    try {
      // Delete from storage
      await supabase.storage.from('moodboards').remove([moodboard.file_path]);
      
      // Delete from database
      await supabase.from('custom_moodboards').delete().eq('id', moodboard.id);
      
      queryClient.invalidateQueries({ queryKey: ['custom-moodboards'] });
      toast({ title: 'Moodboard deleted' });
    } catch (err) {
      console.error('Delete error:', err);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  // Combine sample and custom moodboards for the browse tab
  const allMoodboards: Moodboard[] = [
    ...customMoodboards.map(m => ({
      id: `custom-${m.id}`,
      name: m.name,
      thumbnail: m.thumbnail_url,
      description: m.description || 'Custom moodboard',
    })),
    ...sampleMoodboards,
  ];

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
                <button
                  key={moodboard.id}
                  onClick={() => handleSelect(moodboard.id)}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${
                    selectedMoodboard === moodboard.id
                      ? 'border-accent ring-2 ring-accent/30'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <img 
                    src={moodboard.thumbnail} 
                    alt={moodboard.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h4 className="font-medium text-white text-sm">{moodboard.name}</h4>
                    {moodboard.description && (
                      <p className="text-xs text-white/70 mt-0.5">{moodboard.description}</p>
                    )}
                  </div>
                  {selectedMoodboard === moodboard.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <Check className="w-4 h-4 text-accent-foreground" />
                    </div>
                  )}
                  {/* Custom moodboard indicator */}
                  {moodboard.id.startsWith('custom-') && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-accent/80 text-[10px] font-medium text-accent-foreground">
                      Custom
                    </div>
                  )}
                </button>
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
                  <h4 className="text-sm font-medium text-foreground">Your Moodboards</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {customMoodboards.map((moodboard) => (
                      <div key={moodboard.id} className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
                        <img 
                          src={moodboard.thumbnail_url} 
                          alt={moodboard.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <p className="absolute bottom-1.5 left-2 right-2 text-xs text-white truncate">{moodboard.name}</p>
                        
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteCustomMoodboard(moodboard)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
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
    </Dialog>
  );
};
