import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  industry: string | null;
  markets: string[];
  personality: string | null;
  social_connections: Record<string, { url: string; connected: boolean }>;
  assets: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface BrandsContextType {
  brands: Brand[];
  currentBrand: Brand | null;
  isLoading: boolean;
  setCurrentBrand: (brand: Brand | null) => void;
  createBrand: (data: Partial<Brand>) => Promise<{ data: Brand | null; error: Error | null }>;
  updateBrand: (id: string, data: Partial<Brand>) => Promise<{ error: Error | null }>;
  deleteBrand: (id: string) => Promise<{ error: Error | null }>;
  refetch: () => Promise<void>;
}

const BrandsContext = createContext<BrandsContextType | undefined>(undefined);

export const BrandsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  // Use stable userId string instead of user object to prevent unnecessary refetches
  const userId = user?.id ?? null;

  const fetchBrands = useCallback(async () => {
    if (!userId) {
      setBrands([]);
      setCurrentBrand(null);
      setLoadedUserId(null);
      hasLoadedOnceRef.current = false;
      setIsLoading(false);
      return;
    }

    // Only show global loading on initial load or user change
    // Don't show loading on background refreshes
    const isInitialLoad = !hasLoadedOnceRef.current || loadedUserId !== userId;
    if (isInitialLoad) {
      setIsLoading(true);
    }

    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching brands:", error);
      // On error, keep existing brands and mark as loaded to prevent redirect loops
      hasLoadedOnceRef.current = true;
      setLoadedUserId(userId);
      setIsLoading(false);
      return;
    }

    const typedBrands = (data || []).map((b: any) => ({
      ...b,
      markets: b.markets || [],
      social_connections: b.social_connections || {},
      assets: b.assets || {},
    })) as Brand[];

    setBrands(typedBrands);

    // Set current brand to first one if not set
    setCurrentBrand(prev => {
      if (!prev && typedBrands.length > 0) {
        return typedBrands[0];
      }
      return prev;
    });

    hasLoadedOnceRef.current = true;
    setLoadedUserId(userId);
    setIsLoading(false);
  }, [userId, loadedUserId]);

  useEffect(() => {
    fetchBrands();
  }, [userId]); // Only refetch when userId changes, not on every fetchBrands recreation

  const createBrand = async (data: Partial<Brand>) => {
    if (!user) return { data: null, error: new Error("Not authenticated") };

    const { data: newBrand, error } = await supabase
      .from("brands")
      .insert({
        user_id: user.id,
        name: data.name || "Untitled Brand",
        website: data.website,
        industry: data.industry,
        markets: data.markets || [],
        personality: data.personality,
        social_connections: data.social_connections || {},
        assets: data.assets || {},
      })
      .select()
      .single();

    if (!error && newBrand) {
      const typedBrand = {
        ...newBrand,
        markets: newBrand.markets || [],
        social_connections: newBrand.social_connections || {},
        assets: newBrand.assets || {},
      } as Brand;
      setBrands(prev => [typedBrand, ...prev]);
      setCurrentBrand(typedBrand);
      return { data: typedBrand, error: null };
    }

    return { data: null, error: error as Error | null };
  };

  const updateBrand = async (id: string, data: Partial<Brand>) => {
    const { error } = await supabase
      .from("brands")
      .update(data)
      .eq("id", id);

    if (!error) {
      setBrands(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
      if (currentBrand?.id === id) {
        setCurrentBrand({ ...currentBrand, ...data });
      }
    }

    return { error: error as Error | null };
  };

  const deleteBrand = async (id: string) => {
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);

    if (!error) {
      setBrands(prev => prev.filter(b => b.id !== id));
      if (currentBrand?.id === id) {
        const remaining = brands.filter(b => b.id !== id);
        setCurrentBrand(remaining[0] || null);
      }
    }

    return { error: error as Error | null };
  };

  return (
    <BrandsContext.Provider value={{
      brands,
      currentBrand,
      isLoading: isLoading || (!!userId && loadedUserId !== userId),
      setCurrentBrand,
      createBrand,
      updateBrand,
      deleteBrand,
      refetch: fetchBrands,
    }}>
      {children}
    </BrandsContext.Provider>
  );
};

export const useBrands = () => {
  const context = useContext(BrandsContext);
  if (context === undefined) {
    throw new Error("useBrands must be used within a BrandsProvider");
  }
  return context;
};
