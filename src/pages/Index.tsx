import { useState, useRef, useEffect, useCallback } from "react";
import kittykatLogo from "@/assets/kittykat-logo-transparent.png";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useBrandDrafts } from "@/hooks/useBrandDrafts";
import BrandSection from "@/components/brand/BrandSection";
import { 
  Image, 
  Megaphone, 
  Wand2, 
  Layers, 
  Send,
  Cat,
  Home,
  Bell,
  PenTool,
  GalleryHorizontal,
  ListTodo,
  Users,
  Settings2,
  ChevronDown,
  ChevronRight,
  Upload,
  Palette,
  Building2,
  Sparkles,
  Play,
  RefreshCw,
  Copy,
  Star,
  Plus,
  Calendar,
  MapPin,
  UserCircle2,
  ImageIcon,
  HelpCircle,
  LogOut,
  Check,
  PanelRightOpen,
  PanelRightClose,
  MessageSquare,
  ChevronUp,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const navItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "notifications", label: "Notifications", icon: Bell, badge: 9 },
  { id: "visual-editor", label: "Visual Editor", icon: PenTool },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { id: "task-lists", label: "Task Lists", icon: ListTodo },
  { id: "users", label: "Users", icon: Users },
  { id: "presets", label: "Presets", icon: Settings2 },
];

const quickActions = [
  { id: "brand", label: "View brand", icon: Palette },
  { id: "campaign", label: "Create campaign", icon: Megaphone },
  { id: "moodboard", label: "Create moodboard", icon: Layers },
  { id: "image", label: "Generate image", icon: Image },
  { id: "video", label: "Generate video", icon: Play },
  { id: "edit-video", label: "Edit video", icon: RefreshCw },
  { id: "edit", label: "Edit image", icon: Wand2 },
  { id: "gallery", label: "View gallery", icon: GalleryHorizontal },
  { id: "ideas", label: "Get ideas", icon: Sparkles },
  { id: "discover-audience", label: "Discover your audience", icon: Users },
  { id: "define-audience", label: "Define your audience", icon: UserCircle2 },
];
const moodboardImages = [
  "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg",
  "/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg",
];

// Context-aware sidebar configuration
type ActiveSection = "hero" | "brand" | "campaign" | "image";

const sidebarContextConfig: Record<ActiveSection, {
  title: string;
  description: string;
  starterPrompts: { label: string; prompt: string }[];
}> = {
  hero: {
    title: "KittyKat",
    description: "I can help you create stunning visuals, manage your brand, and run campaigns.",
    starterPrompts: [
      { label: "🎨 Generate a new image", prompt: "Help me generate a new product image" },
      { label: "📢 Plan a campaign", prompt: "I want to create a new marketing campaign" },
      { label: "🏷️ Update my brand", prompt: "Help me refine my brand guidelines" },
    ],
  },
  brand: {
    title: "Brand Assistant",
    description: "I can help you refine your brand identity, colors, typography, and personas.",
    starterPrompts: [
      { label: "🎨 Suggest new colors", prompt: "Suggest complementary colors for my brand palette" },
      { label: "✍️ Improve tagline", prompt: "Help me improve my brand tagline" },
      { label: "👤 Create a persona", prompt: "Help me create a new target audience persona" },
      { label: "📝 Refine mission", prompt: "Help me refine my brand mission statement" },
    ],
  },
  campaign: {
    title: "Campaign Assistant",
    description: "I can help you plan campaigns, select moodboards, and craft messaging.",
    starterPrompts: [
      { label: "📅 Plan launch", prompt: "Help me plan a product launch campaign" },
      { label: "💡 Generate ideas", prompt: "Give me creative campaign ideas for this brand" },
      { label: "🎯 Target audience", prompt: "Help me define the target audience for this campaign" },
      { label: "📊 Campaign strategy", prompt: "Suggest a multi-channel campaign strategy" },
    ],
  },
  image: {
    title: "Image Assistant",
    description: "I can help you generate, edit, and refine images for your brand.",
    starterPrompts: [
      { label: "✨ Enhance prompt", prompt: "Help me improve this image prompt" },
      { label: "🔄 Create variations", prompt: "Suggest variations of my current image concept" },
      { label: "📐 Adjust composition", prompt: "How can I improve the composition of this image?" },
      { label: "🎭 Style transfer", prompt: "Apply a different visual style to my image" },
    ],
  },
};

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentBrand } = useBrands();
  const { drafts, deleteDraft } = useBrandDrafts();
  const [prompt, setPrompt] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [activeNav, setActiveNav] = useState("home");
  
  // Section refs for scrolling
  const brandRef = useRef<HTMLDivElement>(null);
  const campaignRef = useRef<HTMLDivElement>(null);
  const moodboardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Context-aware sidebar state
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Section collapse state
  const [isCampaignOpen, setIsCampaignOpen] = useState(true);
  const [isMoodboardOpen, setIsMoodboardOpen] = useState(true);
  const [isImageOpen, setIsImageOpen] = useState(true);

  // Campaign state
  const [selectedMoodboard, setSelectedMoodboard] = useState<string | null>(null);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageCount, setImageCount] = useState("1x");
  const [generationMode, setGenerationMode] = useState<"image" | "edit" | "video">("image");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll position to update active section and back to top button
  const updateActiveSection = useCallback(() => {
    const mainContent = mainContentRef.current;

    const isMainScrollable =
      !!mainContent && mainContent.scrollHeight > mainContent.clientHeight + 1;

    const scrollTop = isMainScrollable ? mainContent!.scrollTop : window.scrollY;
    const offset = 200; // Offset to trigger section change earlier

    // Show back to top button when scrolled down at all
    setShowBackToTop(scrollTop > 0);

    const sections = [
      { ref: imageRef, id: "image" as ActiveSection },
      { ref: campaignRef, id: "campaign" as ActiveSection },
      { ref: brandRef, id: "brand" as ActiveSection },
      { ref: heroRef, id: "hero" as ActiveSection },
    ];

    for (const section of sections) {
      if (section.ref.current) {
        const rect = section.ref.current.getBoundingClientRect();
        const mainRectTop = isMainScrollable && mainContent ? mainContent.getBoundingClientRect().top : 0;
        const relativeTop = rect.top - mainRectTop;

        if (relativeTop <= offset) {
          setActiveSection(section.id);
          return;
        }
      }
    }

    setActiveSection("hero");
  }, []);

  useEffect(() => {
    const mainContent = mainContentRef.current;

    // Initial state (so it updates even if user lands mid-scroll)
    updateActiveSection();

    // Listen to whichever scroll container is actually used
    mainContent?.addEventListener("scroll", updateActiveSection, { passive: true } as AddEventListenerOptions);
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      mainContent?.removeEventListener("scroll", updateActiveSection as EventListener);
      window.removeEventListener("scroll", updateActiveSection as EventListener);
    };
  }, [updateActiveSection]);

  const scrollToSection = useCallback((sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      brand: brandRef,
      campaign: campaignRef,
      moodboard: moodboardRef,
      image: imageRef,
      edit: imageRef,
      batch: imageRef,
      video: imageRef,
      "edit-video": imageRef,
    };
    refs[sectionId]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const { messages: chatMessages, isLoading: isChatLoading, sendMessage, addWelcomeMessage } = useChat(scrollToSection);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const handleStarterPrompt = (promptText: string) => {
    sendMessage(promptText, activeSection);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && !isChatLoading) {
      sendMessage(chatMessage.trim(), activeSection);
      setChatMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const currentContext = sidebarContextConfig[activeSection];

  const handleQuickAction = (actionId: string) => {
    // Actions that require chat interaction - open sidebar with contextual message
    const chatActionMessages: Record<string, string> = {
      "ideas": "Let's brainstorm some creative ideas! What kind of content or campaign are you thinking about?",
      "discover-audience": "I can help you discover your target audience. Tell me about your product or service, and I'll help identify who would be most interested.",
      "define-audience": "Let's define your ideal audience together. Do you have any existing customer data or personas we should start from?",
      "brand": "I see you want to work on your brand. Would you like to update your brand colors, refine your messaging, or create new brand assets?",
      "campaign": "Great choice! Let's create a campaign. What's the goal - awareness, engagement, or conversions? And what platforms are you targeting?",
    };

    if (actionId in chatActionMessages) {
      if (chatMessages.length === 0) {
        addWelcomeMessage();
      }
      setIsSidebarOpen(true);
      // Add the contextual assistant message after a brief delay
      setTimeout(() => {
        sendMessage(`I want to ${actionId.replace("-", " ")}`, activeSection);
      }, 100);
    }
    
    scrollToSection(actionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isChatLoading) {
      // If chat is empty and sidebar wasn't open, add welcome message first
      if (chatMessages.length === 0) {
        addWelcomeMessage();
      }
      setIsSidebarOpen(true);
      sendMessage(prompt.trim(), activeSection);
      setPrompt("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src={kittykatLogo} alt="KittyKat" className="h-16" />
          </div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors relative ${
                    activeNav === item.id 
                      ? "text-accent" 
                      : "text-foreground hover:text-accent/80 hover:bg-secondary/50"
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-[10px] text-white rounded-full flex items-center justify-center font-medium">
                        {item.badge}+
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span>957</span>
              <span className="text-primary">💎</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium">
              <span>3,491,370</span>
              <span>$</span>
            </div>
            <button className="p-2 rounded-lg hover:bg-secondary">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-popover border border-border shadow-lg z-50">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user?.user_metadata?.name || user?.email?.split("@")[0] || "User"}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Actions */}
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 cursor-pointer">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                  onClick={async () => {
                    await signOut();
                    navigate("/login");
                  }}
                >
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Layout: Content + Chat Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Floating buttons */}
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
          {/* Back to top button - hidden when chat sidebar is open */}
          {showBackToTop && !isSidebarOpen && (
            <button
              onClick={() => {
                const mainContent = mainContentRef.current;
                const isMainScrollable =
                  !!mainContent && mainContent.scrollHeight > mainContent.clientHeight + 1;

                if (isMainScrollable) {
                  mainContent!.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="p-3 rounded-full bg-secondary border border-border text-foreground shadow-lg hover:bg-secondary/80 transition-all hover:scale-105"
              title="Back to top"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          )}
          {/* Chat open button - only visible when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 rounded-full bg-accent text-white shadow-lg hover:opacity-90 transition-all hover:scale-105"
              title="Open chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <main ref={mainContentRef} className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'pr-[400px]' : 'pr-0'}`}>
          {/* Hero Section - Fullscreen */}
          <section ref={heroRef} className="min-h-[calc(100vh-73px)] flex flex-col justify-center px-8 py-16 max-w-4xl mx-auto relative">
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-10 animate-fade-in">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  How can <span className="text-gradient">KittyKat</span> help you today?
                </h1>
                <p className="text-muted-foreground text-lg">
                  Describe your vision and let us bring it to life
                </p>
              </div>

              {/* Resume Draft Dropdown */}
              {drafts.length > 0 && (
                <div className="mb-6 flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-sm font-medium text-primary transition-colors">
                        <Building2 className="w-4 h-4" />
                        Continue brand setup
                        <span className="px-1.5 py-0.5 bg-primary/20 rounded text-xs">{drafts.length}</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-72 bg-popover border border-border shadow-lg z-50">
                      <DropdownMenuLabel className="text-xs text-muted-foreground">In-progress brands</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {drafts.map((draft) => (
                        <DropdownMenuItem
                          key={draft.id}
                          className="flex items-center justify-between gap-3 p-3 cursor-pointer focus:bg-secondary hover:bg-secondary"
                          onClick={() => navigate(`/brand-setup?draft=${draft.id}`)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{draft.basics.name || "Untitled Brand"}</p>
                            <p className="text-xs text-muted-foreground">Step {draft.currentStep} of 4</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDraft(draft.id);
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete draft"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Main Prompt Input */}
              <form onSubmit={handleSubmit} className="relative mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-blue-500/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim() && !isChatLoading) {
                          handleSubmit(e as unknown as React.FormEvent);
                        }
                      }
                    }}
                    placeholder="Describe your ad creative..."
                    rows={3}
                    className="relative command-input resize-none pr-16"
                  />
                </div>
                <button
                  type="submit"
                  className="absolute right-4 bottom-4 w-11 h-11 rounded-xl bg-accent hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-accent/25"
                  disabled={!prompt.trim()}
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className="action-chip group hover:scale-105 transition-all"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-coral to-primary flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll indicator at bottom */}
            <button 
              onClick={() => {
                const element = brandRef.current;
                if (element) {
                  const headerOffset = 80; // Account for sticky navbar
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.scrollY - headerOffset;
                  window.scrollTo({ top: offsetPosition, behavior: "smooth" });
                }
              }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:text-accent transition-colors"
            >
              <ChevronDown className="w-8 h-8 text-muted-foreground" />
            </button>
          </section>

          {/* Brand Section */}
          <BrandSection brandRef={brandRef} />

          {/* Campaign Section */}
          <section ref={campaignRef} className="px-8 py-16 border-t border-border bg-secondary/20">
            <div className="max-w-5xl mx-auto">
              <Collapsible open={isCampaignOpen} onOpenChange={setIsCampaignOpen}>
                <div className="flex items-center gap-3 mb-6">
                  <CollapsibleTrigger asChild>
                    <button 
                      className="w-8 h-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                      title={isCampaignOpen ? "Collapse section" : "Expand section"}
                    >
                      {isCampaignOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Campaign</p>
                    <h2 className="font-display text-2xl font-bold">Summer Collection 2026</h2>
                  </div>
                </div>

                <CollapsibleContent>

              <div className="space-y-6">
                {/* Moodboard */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Reference Moodboard</h3>
                      <p className="text-sm text-muted-foreground">Everyday Icons: Helzberg Necklace's Moodboard v1</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="🔍 Select Moodboard"
                        className="input-field w-48 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {moodboardImages.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedMoodboard(img)}
                        className={`aspect-square rounded-lg bg-secondary overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedMoodboard === img ? "border-primary" : "border-transparent hover:border-primary/30"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prompts */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Prompts</span>
                      <select className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm">
                        <option>3</option>
                        <option>5</option>
                        <option>10</option>
                      </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      Generate Prompts
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          A young woman in her late twenties with luminous fair skin stands confidently in an urban setting...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </section>

          {/* Moodboard Section */}
          <section ref={moodboardRef} className="px-8 py-16 border-t border-border">
            <div className="max-w-5xl mx-auto">
              <Collapsible open={isMoodboardOpen} onOpenChange={setIsMoodboardOpen}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CollapsibleTrigger asChild>
                      <button 
                        className="w-8 h-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                        title={isMoodboardOpen ? "Collapse section" : "Expand section"}
                      >
                        {isMoodboardOpen ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </CollapsibleTrigger>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Moodboard</p>
                      <h2 className="font-display text-2xl font-bold">Sunlit Steps: Begin Your Yellow Diamond Story</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select Moodboard"
                        className="input-field w-48 text-sm pl-9"
                      />
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <button className="p-2.5 rounded-xl border border-border hover:bg-secondary transition-colors">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="space-y-4">
                    {/* Campaign Concept Card */}
                    <div className="glass-card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold">Campaign Concept: "Sunlit Steps: Begin Your Yellow Diamond Story"</h3>
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground" title="Copy">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground" title="Pin">
                            <Star className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-4">
                        A luminous, editorial campaign designed for women in New York ready to begin their own collection of rare, colored diamonds—starting with a princess cut yellow diamond of 1 carat or more. 'Sunlit Steps' shines a light on the modern woman's desire for self-celebration and milestone marking, offering exquisitely cut yellow diamonds as the gateway to personalized luxury. Visuals focus on natural light, authentic urban glamour, and the radiant vibrance of each unique diamond, inviting women to take their first sunlit step into the world of special colored stones.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Radiant", "Empowering", "Editorial", "Modern", "Aspirational"].map((tag) => (
                          <span key={tag} className="px-3 py-1.5 rounded-full border border-border text-sm text-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Create Moodboard Button */}
                    <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-colors">
                      Create Moodboard
                    </button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </section>

          {/* Image Generation Section */}
          <section ref={imageRef} className="px-8 py-16 border-t border-border bg-secondary/20">
            <div className="max-w-5xl mx-auto">
              <Collapsible open={isImageOpen} onOpenChange={setIsImageOpen}>
                <div className="flex items-center gap-3 mb-6">
                  <CollapsibleTrigger asChild>
                    <button 
                      className="w-8 h-8 rounded-lg border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                      title={isImageOpen ? "Collapse section" : "Expand section"}
                    >
                      {isImageOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visual Media</p>
                    <h2 className="font-display text-2xl font-bold">Creative Studio</h2>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="glass-card p-6">
                    <div className="flex flex-col gap-4">
                      {/* Top row - Icons aligned with prompt */}
                      <div className="flex items-start gap-4">
                        {/* Mode toggles column */}
                        <div className="flex flex-col gap-2">
                          <button 
                            onClick={() => setGenerationMode("image")}
                            className={`p-2 rounded-lg transition-colors ${
                              generationMode === "image" 
                                ? "text-accent" 
                                : "hover:bg-secondary text-foreground"
                            }`}
                            title="Image Generation"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => setGenerationMode("edit")}
                            className={`p-2 rounded-lg transition-colors ${
                              generationMode === "edit" 
                                ? "text-accent" 
                                : "hover:bg-secondary text-foreground"
                            }`}
                            title="Image Editing"
                          >
                            <PenTool className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setGenerationMode("video")}
                            className={`p-2 rounded-lg transition-colors ${
                              generationMode === "video" 
                                ? "text-accent" 
                                : "hover:bg-secondary text-foreground"
                            }`}
                            title="Video Generation"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="4" width="6" height="16" rx="1" />
                              <rect x="9" y="4" width="6" height="16" rx="1" />
                              <rect x="16" y="4" width="6" height="16" rx="1" />
                            </svg>
                          </button>
                        </div>

                        {/* Prompt Input - aligned with first icon */}
                        <div className="flex-1 pt-1">
                          <input
                            type="text"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="Describe what you want to see ..."
                            className="w-full bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                          />
                        </div>

                        {/* Lock and Bin icons - aligned with prompt */}
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </button>
                          <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center gap-3">
                        {/* Left controls */}
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => setAspectRatio("1:1")}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              aspectRatio === "1:1"
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-border hover:bg-secondary"
                            }`}
                          >
                            1:1
                          </button>
                          <button 
                            onClick={() => setImageCount("1x")}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              imageCount === "1x"
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-border hover:bg-secondary"
                            }`}
                          >
                            1x
                          </button>
                          <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                            <Settings2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Right controls */}
                        <div className="ml-auto flex items-center gap-3">
                          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">
                            <span>🌐</span>
                            <span>GPT Image 1</span>
                            <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m6 9 6 6 6-6"/>
                            </svg>
                          </button>
                          <button className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
                            <Wand2 className="w-5 h-5" />
                          </button>
                          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-all">
                            Generate (1,700 tokens)
                          </button>
                        </div>
                      </div>

                      {/* Image Grid */}
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div 
                            key={i}
                            className={`bg-secondary/50 border-r border-b border-border ${i <= 3 ? 'aspect-[4/3]' : 'aspect-[4/2]'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </section>
        </main>

        {/* Right Chat Sidebar - Context Aware */}
        <aside className={`fixed right-0 top-[73px] w-[400px] h-[calc(100vh-73px)] border-l border-border bg-card flex flex-col overflow-hidden z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Context Header */}
          <div className="p-4 pt-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">KittyKat Assistant</span>
            </div>
            <p className="text-xs text-muted-foreground">I can help you create stunning visuals, manage your brand, and run campaigns.</p>
          </div>

          {/* Chat Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="p-4 rounded-xl bg-accent/10 text-sm">
                <p>Hi! I'm here to help with your creative work. What would you like to do today?</p>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-secondary ml-8"
                      : "bg-accent/10 mr-8"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))
            )}
            {isChatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
              <div className="p-4 rounded-xl bg-accent/10 text-sm mr-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-100" />
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse delay-200" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            {/* Quick suggestions - static prompts */}
            {chatMessages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "🎨 Generate an image", prompt: "Help me generate a new product image" },
                  { label: "📢 Plan a campaign", prompt: "I want to create a new marketing campaign" },
                  { label: "🏷️ Update my brand", prompt: "Help me refine my brand guidelines" },
                  { label: "💡 Get ideas", prompt: "Give me creative campaign ideas" },
                ].map((starter, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterPrompt(starter.prompt)}
                    className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs transition-colors border border-border hover:border-accent/30"
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                rows={2}
                disabled={isChatLoading}
                className="w-full bg-secondary border border-border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
              />
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                  <span>Close</span>
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isChatLoading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Index;
