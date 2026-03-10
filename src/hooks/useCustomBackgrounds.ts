import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CustomBackground {
  id: string;
  user_id: string;
  brand_id: string;
  name: string;
  prompt: string;
  thumbnail_url: string | null;
  reference_urls: string[] | null;
  ai_analysis: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export function useCustomBackgrounds(brandId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const queryKey = ["custom-backgrounds", brandId, user?.id];

  const { data: backgrounds = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id || !brandId) return [];
      const { data, error } = await supabase
        .from("custom_backgrounds" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching custom backgrounds:", error);
        return [];
      }
      return (data || []) as unknown as CustomBackground[];
    },
    enabled: !!user?.id && !!brandId,
  });

  const createBackground = useMutation({
    mutationFn: async (bg: {
      name: string;
      prompt: string;
      thumbnail_url: string | null;
      reference_urls: string[];
      ai_analysis: Record<string, any> | null;
    }) => {
      if (!user?.id || !brandId) throw new Error("Not authenticated or no brand");
      const { data, error } = await supabase
        .from("custom_backgrounds" as any)
        .insert({
          user_id: user.id,
          brand_id: brandId,
          name: bg.name,
          prompt: bg.prompt,
          thumbnail_url: bg.thumbnail_url,
          reference_urls: bg.reference_urls,
          ai_analysis: bg.ai_analysis,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CustomBackground;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteBackground = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_backgrounds" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    backgrounds,
    isLoading,
    createBackground,
    deleteBackground,
  };
}
