import { useState, useCallback } from "react";

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

export interface ExtractedBrandData {
  name: string;
  tagline: string;
  industry: string;
  personality: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  socialLinks: Record<string, string>;
  mission: string;
  tone: string;
}

export interface AgentDraftState {
  websiteUrl: string;
  extractedData: ExtractedBrandData | null;
  reviewedFields: string[];
  currentReviewIndex: number;
  phase: "url" | "extracting" | "reviewing" | "complete";
}

export interface BrandDraft {
  id: string;
  mode: "manual" | "agent";
  currentStep: number;
  basics: BrandDraftBasics;
  connections: Record<string, SocialConnection>;
  agentState?: AgentDraftState;
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

const getDefaultAgentState = (): AgentDraftState => ({
  websiteUrl: "",
  extractedData: null,
  reviewedFields: [],
  currentReviewIndex: -1,
  phase: "url",
});

export const generateDraftId = (): string => {
  return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useBrandDrafts = () => {
  const [drafts, setDrafts] = useState<BrandDraft[]>(() => {
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

  const saveDrafts = useCallback((newDrafts: BrandDraft[]) => {
    setDrafts(newDrafts);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(newDrafts));
  }, []);

  const createDraft = useCallback((mode: "manual" | "agent" = "manual"): BrandDraft => {
    const now = new Date().toISOString();
    const newDraft: BrandDraft = {
      id: generateDraftId(),
      mode,
      currentStep: mode === "manual" ? 1 : 0,
      basics: getDefaultBasics(),
      connections: getDefaultConnections(),
      agentState: mode === "agent" ? getDefaultAgentState() : undefined,
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
