import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface SceneImage {
  id: string;
  user_id: string;
  brand_id: string;
  name: string;
  image_url: string;
  category: string;
  region: string;
  created_at: string;
}

export const SCENE_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "indoor", label: "Indoor" },
  { value: "outdoor-urban", label: "Urban" },
  { value: "outdoor-nature", label: "Nature" },
  { value: "cafe-restaurant", label: "Café" },
  { value: "retail-store", label: "Retail" },
  { value: "home", label: "Home" },
  { value: "workspace", label: "Workspace" },
  { value: "beach-pool", label: "Beach" },
  { value: "other", label: "Other" },
] as const;

export const SCENE_REGIONS = [
  { value: "all", label: "All Regions" },
  { value: "usa", label: "USA" },
  { value: "europe", label: "Europe" },
  { value: "apac", label: "APAC" },
  { value: "mea", label: "MEA" },
] as const;

export function useSceneImages(brandId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["scene-images", brandId, user?.id];

  const { data: sceneImages = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id || !brandId) return [];
      const { data, error } = await supabase
        .from("scene_images" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching scene images:", error);
        return [];
      }
      return (data || []) as unknown as SceneImage[];
    },
    enabled: !!user?.id && !!brandId,
  });

  const createScene = useMutation({
    mutationFn: async ({ file, region = "all" }: { file: File; region?: string }) => {
      if (!user?.id || !brandId) throw new Error("Not authenticated or no brand");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/scene/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(path);

      let category = "other";
      let name = "Uploaded Scene";
      try {
        const { data: classifyData, error: classifyError } = await supabase.functions.invoke("classify-scene", {
          body: { imageUrl: publicUrl },
        });
        if (!classifyError && classifyData) {
          category = classifyData.category || "other";
          name = classifyData.name || "Uploaded Scene";
        }
      } catch (e) {
        console.error("Classification failed, using defaults:", e);
      }

      const { data, error } = await supabase
        .from("scene_images" as any)
        .insert({
          user_id: user.id,
          brand_id: brandId,
          name,
          image_url: publicUrl,
          category,
          region,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as SceneImage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      console.error("Scene upload error:", err);
      toast({ title: "Failed to upload scene", variant: "destructive" });
    },
  });

  const updateSceneRegion = useMutation({
    mutationFn: async ({ id, region }: { id: string; region: string }) => {
      const { error } = await supabase
        .from("scene_images" as any)
        .update({ region } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteScene = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scene_images" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { sceneImages, isLoading, createScene, deleteScene, updateSceneRegion };
}
