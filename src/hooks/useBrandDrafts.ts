import { useState, useEffect, useCallback } from "react";

export interface SocialConnection {
  url: string;
  connected: boolean;
}

export interface BrandDraftBasics {
  name: string;
  website: string;
  industry: string;
  markets: string[];
  personality: string;
}

export interface BrandDraft {
  id: string;
  currentStep: number;
  basics: BrandDraftBasics;
  connections: Record<string, SocialConnection>;
  createdAt: string;
  updatedAt: string;
}

const DRAFTS_STORAGE_KEY = "kittykat_brand_drafts";

const getDefaultConnections = (): Record<string, SocialConnection> => ({
  website: { url: "", connected: false },
  instagram: { url: "", connected: false },
  facebook: { url: "", connected: false },
  twitter: { url: "", connected: false },
  tiktok: { url: "", connected: false },
  pinterest: { url: "", connected: false },
  youtube: { url: "", connected: false },
});

const getDefaultBasics = (): BrandDraftBasics => ({
  name: "",
  website: "",
  industry: "",
  markets: [],
  personality: "",
});

export const generateDraftId = (): string => {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useBrandDrafts = () => {
  const [drafts, setDrafts] = useState<BrandDraft[]>(() => {
    // Initialize synchronously from localStorage to avoid race conditions
    try {
      const saved = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load drafts:", e);
    }
    return [];
  });

  // Save drafts to localStorage whenever they change
  const saveDrafts = useCallback((newDrafts: BrandDraft[]) => {
    setDrafts(newDrafts);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(newDrafts));
  }, []);

  const createDraft = useCallback((): BrandDraft => {
    const now = new Date().toISOString();
    const newDraft: BrandDraft = {
      id: generateDraftId(),
      currentStep: 1,
      basics: getDefaultBasics(),
      connections: getDefaultConnections(),
      createdAt: now,
      updatedAt: now,
    };
    saveDrafts([...drafts, newDraft]);
    return newDraft;
  }, [drafts, saveDrafts]);

  const updateDraft = useCallback((id: string, updates: Partial<Omit<BrandDraft, "id" | "createdAt">>) => {
    const newDrafts = drafts.map((draft) =>
      draft.id === id
        ? { ...draft, ...updates, updatedAt: new Date().toISOString() }
        : draft
    );
    saveDrafts(newDrafts);
  }, [drafts, saveDrafts]);

  const deleteDraft = useCallback((id: string) => {
    saveDrafts(drafts.filter((draft) => draft.id !== id));
  }, [drafts, saveDrafts]);

  const getDraft = useCallback((id: string): BrandDraft | undefined => {
    return drafts.find((draft) => draft.id === id);
  }, [drafts]);

  return {
    drafts,
    createDraft,
    updateDraft,
    deleteDraft,
    getDraft,
  };
};
