import { useState, useEffect, useRef, useCallback } from "react";
import { Cat, Globe, Loader2, Check, Edit2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ExtractedBrandInfo {
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

interface Message {
  id: string;
  role: "agent" | "user";
  content: string;
  type?: "text" | "review";
  field?: keyof ExtractedBrandInfo;
  reviewIndex?: number;
}

interface AgentBrandSetupProps {
  onComplete: (brandData: {
    name: string;
    website: string;
    industry: string;
    personality: string;
    tagline: string;
    socialLinks: Record<string, string>;
  }) => void;
  onCancel: () => void;
}

const REVIEW_FIELDS: { key: keyof ExtractedBrandInfo; label: string; emoji: string }[] = [
  { key: "name", label: "Brand Name", emoji: "🏷️" },
  { key: "tagline", label: "Tagline", emoji: "💬" },
  { key: "industry", label: "Industry", emoji: "🏢" },
  { key: "personality", label: "Personality", emoji: "✨" },
  { key: "tone", label: "Brand Tone", emoji: "🎯" },
  { key: "mission", label: "Mission", emoji: "🚀" },
];

let messageIdCounter = 0;
const generateMessageId = () => `msg-${Date.now()}-${++messageIdCounter}`;

const AgentBrandSetup = ({ onComplete, onCancel }: AgentBrandSetupProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBrandInfo | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(-1);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [phase, setPhase] = useState<"url" | "extracting" | "reviewing" | "complete">("url");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      addAgentMessage(
        "Hey! I'm KittyKat 🐱 I'll help you set up your brand in just a minute. Drop your website URL below and I'll analyze it to extract your brand info automatically!"
      );
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const addAgentMessage = useCallback((content: string, extras?: Partial<Message>) => {
    const msg: Message = {
      id: generateMessageId(),
      role: "agent",
      content,
      type: "text",
      ...extras,
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const msg: Message = {
      id: generateMessageId(),
      role: "user",
      content,
      type: "text",
    };
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSubmitUrl = async () => {
    if (!websiteUrl.trim()) return;

    addUserMessage(websiteUrl);
    setPhase("extracting");
    setIsExtracting(true);

    addAgentMessage("Perfect! Let me scan your website... 🔍");

    try {
      const { data, error } = await supabase.functions.invoke("extract-brand-info", {
        body: { url: websiteUrl },
      });

      if (error) throw error;

      if (data?.success && data.brandInfo) {
        setExtractedData(data.brandInfo);
        setIsExtracting(false);
        setPhase("reviewing");
        
        setTimeout(() => {
          addAgentMessage(
            `Great news! I found a lot of info about **${data.brandInfo.name || "your brand"}**. Let me walk you through what I discovered and you can confirm or edit each piece. 👇`
          );
          setTimeout(() => startReview(), 1000);
        }, 500);
      } else {
        throw new Error(data?.error || "Failed to extract brand info");
      }
    } catch (err) {
      console.error("Extraction error:", err);
      setIsExtracting(false);
      addAgentMessage(
        "Hmm, I had trouble reading that website. Could you double-check the URL? Make sure it's accessible and try again."
      );
      setPhase("url");
    }
  };

  const startReview = () => {
    setCurrentReviewIndex(0);
    reviewNextField(0);
  };

  const reviewNextField = (index: number) => {
    if (!extractedData || index >= REVIEW_FIELDS.length) {
      // All fields reviewed
      setPhase("complete");
      addAgentMessage(
        "Awesome! Your brand profile is ready. Does everything look good to save? 🎉"
      );
      return;
    }

    const field = REVIEW_FIELDS[index];
    const value = extractedData[field.key];

    if (!value || (typeof value === "string" && !value.trim())) {
      // Skip empty fields
      setCurrentReviewIndex(index + 1);
      reviewNextField(index + 1);
      return;
    }

    setCurrentReviewIndex(index);
    addAgentMessage(
      `${field.emoji} **${field.label}**: "${value}"\n\nDoes this look right?`,
      { type: "review", field: field.key, reviewIndex: index }
    );
  };

  const handleConfirmField = () => {
    const nextIndex = currentReviewIndex + 1;
    setCurrentReviewIndex(nextIndex);
    addUserMessage("✓ Looks good!");
    setTimeout(() => reviewNextField(nextIndex), 500);
  };

  const handleEditField = (field: string) => {
    setEditingField(field);
    setEditValue(extractedData?.[field as keyof ExtractedBrandInfo] as string || "");
  };

  const handleSaveEdit = () => {
    if (!editingField || !extractedData) return;

    setExtractedData({
      ...extractedData,
      [editingField]: editValue,
    });
    
    addUserMessage(`Updated to: "${editValue}"`);
    setEditingField(null);
    setEditValue("");
    
    const nextIndex = currentReviewIndex + 1;
    setCurrentReviewIndex(nextIndex);
    setTimeout(() => reviewNextField(nextIndex), 500);
  };

  const handleComplete = () => {
    if (!extractedData) return;

    onComplete({
      name: extractedData.name,
      website: websiteUrl,
      industry: extractedData.industry,
      personality: extractedData.personality,
      tagline: extractedData.tagline,
      socialLinks: extractedData.socialLinks,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Cat className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">KittyKat</span>
          <span className="text-sm text-muted-foreground ml-2">Brand Setup</span>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 animate-fade-in",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              {msg.role === "agent" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Cat className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "agent"
                    ? "bg-card border border-border"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {msg.content.split("**").map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </p>

                {/* Review actions - only show for the current review item */}
                {msg.type === "review" && msg.role === "agent" && msg.reviewIndex === currentReviewIndex && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {editingField === msg.field ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-background border border-border"
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleConfirmField}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg text-sm hover:bg-green-500/20"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirm
                        </button>
                        <button
                          onClick={() => handleEditField(msg.field as string)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Extracting indicator */}
          {isExtracting && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Cat className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing your website...</span>
                </div>
              </div>
            </div>
          )}

          {/* Complete actions */}
          {phase === "complete" && (
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90"
              >
                <Sparkles className="w-4 h-4" />
                Save Brand Profile
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {phase === "url" && (
        <div className="border-t border-border p-4 bg-card/50">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitUrl()}
                  placeholder="https://yourbrand.com"
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSubmitUrl}
                disabled={!websiteUrl.trim()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
              >
                Analyze
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              I'll extract your brand colors, tone, social links, and more
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentBrandSetup;
