import { useState, useRef, useEffect, useCallback } from "react";
import kittykatLogo from "@/assets/kittykat-logo-transparent.png";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import { useBrandDrafts } from "@/hooks/useBrandDrafts";
import BrandSelector from "@/components/BrandSelector";
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
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  { id: "brand", label: "View brand", icon: Palette, color: "from-primary to-purple-400" },
  { id: "campaign", label: "Create campaign", icon: Megaphone, color: "from-violet-500 to-purple-400" },
  { id: "moodboard", label: "Create moodboard", icon: Layers, color: "from-amber-500 to-orange-400" },
  { id: "image", label: "Generate image", icon: Image, color: "from-pink-500 to-rose-500" },
  { id: "video", label: "Generate video", icon: Play, color: "from-emerald-500 to-teal-400" },
  { id: "edit-video", label: "Edit video", icon: RefreshCw, color: "from-cyan-500 to-blue-400" },
  { id: "edit", label: "Edit image", icon: Wand2, color: "from-blue-500 to-cyan-400" },
  { id: "gallery", label: "View gallery", icon: GalleryHorizontal, color: "from-purple-500 to-pink-400" },
  { id: "ideas", label: "Get ideas", icon: Sparkles, color: "from-yellow-500 to-amber-400" },
  { id: "discover-audience", label: "Discover your audience", icon: Users, color: "from-indigo-500 to-violet-400" },
  { id: "define-audience", label: "Define your audience", icon: UserCircle2, color: "from-rose-500 to-pink-400" },
];

// Mock brand data
const brandData = {
  name: "Helzberg",
  tagline: "Jewelry that lasts a lifetime",
  values: ["Ethical sourcing", "Environmental responsibility", "Community involvement"],
  mission: "To provide high-quality, ethically sourced jewelry that customers can cherish for a lifetime.",
  vision: "To be the leading jewelry retailer recognized for our commitment to quality and sustainability.",
  colors: [
    { name: "Burgundy", hex: "#800020" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Gray", hex: "#808080" },
  ],
  typography: { primary: "Playfair Display", secondary: "Inter" },
};

const visualStyle = {
  lastUpdated: "Jan 6, 2026 at 4:02 PM",
  imageCount: 805,
  composition: [
    { label: "close-up detail", score: 0.95 },
    { label: "centered subject", score: 0.91 },
    { label: "rule of thirds", score: 0.24 },
    { label: "cropped framing", score: 0.16 },
  ],
  lighting: [
    { label: "soft diffused", score: 1 },
    { label: "natural daylight", score: 0.89 },
    { label: "even lighting", score: 0.07 },
  ],
  setting: [
    { label: "minimal studio", score: 0.98 },
    { label: "neutral backdrop", score: 0.53 },
    { label: "plain backdrop", score: 0.19 },
  ],
  people: [
    { label: "single model", score: 0.37 },
    { label: "neutral expression", score: 0.34 },
    { label: "candid expression", score: 0.21 },
  ],
  styling: [
    { label: "minimalist clean", score: 1 },
    { label: "casual relaxed", score: 0.63 },
    { label: "understated elegance", score: 0.2 },
  ],
};

const brandPersonas = [
  {
    id: 1,
    name: "College Graduate Dreamer",
    description: "A recent college graduate seeking to mark the start of a promising career with...",
    age: "23-28",
    gender: "Female",
    location: "Urban",
  },
  {
    id: 2,
    name: "Family-Oriented Guardian",
    description: "A devoted parent seeking jewelry that commemorates family milestones and...",
    age: "35-45",
    gender: "Male",
    location: "Suburban",
  },
  {
    id: 3,
    name: "Golden Years Celebrant",
    description: "A retiree embracing a socially active lifestyle, looking for jewelry that accompanies...",
    age: "65-75",
    gender: "Non-binary",
    location: "Coastal",
  },
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
  const imageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLElement>(null);

  // Context-aware sidebar state
  const [activeSection, setActiveSection] = useState<ActiveSection>("hero");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      image: imageRef,
      edit: imageRef,
      batch: imageRef,
      video: imageRef,
      "edit-video": imageRef,
    };
    refs[sectionId]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const { messages: chatMessages, isLoading: isChatLoading, sendMessage } = useChat(scrollToSection);
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
    // Actions that require chat continuation should open sidebar
    const chatActions = ["ideas", "discover-audience", "define-audience"];
    if (chatActions.includes(actionId)) {
      setIsSidebarOpen(true);
    }
    scrollToSection(actionId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isChatLoading) {
      sendMessage(prompt.trim(), activeSection);
      setPrompt("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Logo + Brand Selector */}
          <div className="flex items-center gap-4">
            <img src={kittykatLogo} alt="KittyKat" className="h-16" />
            <BrandSelector />
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
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
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
          {/* Back to top button */}
          {showBackToTop && (
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
          {/* Chat toggle button when sidebar is closed */}
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

              {/* Resume Draft Banners */}
              {drafts.length > 0 && (
                <div className="mb-6 space-y-3">
                  {drafts.slice(0, 3).map((draft) => (
                    <div 
                      key={draft.id}
                      className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Resume brand setup</p>
                          <p className="text-sm text-muted-foreground">
                            Continue setting up "{draft.basics.name || "Untitled Brand"}" - Step {draft.currentStep}/4
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => navigate(`/brand-setup?draft=${draft.id}`)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      className="action-chip group hover:scale-105 transition-all"
                    >
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      {action.label}
                    </button>
                  );
                })}
              </div>

              {/* Main Prompt Input */}
              <form onSubmit={handleSubmit} className="relative mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
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
            </div>

            {/* Scroll indicator at bottom */}
            <button 
              onClick={() => brandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer hover:text-accent transition-colors"
            >
              <ChevronDown className="w-8 h-8 text-muted-foreground" />
            </button>
          </section>

          {/* Brand Section */}
          <section ref={brandRef} className="px-8 py-16 border-t border-border">
            <div className="max-w-5xl mx-auto">
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    H
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-display text-xl font-bold">{brandData.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Select Brand"
                      className="input-field w-48 text-sm"
                    />
                  </div>
                  <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Brand Overview */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Brand Overview</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Star className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{brandData.tagline}</p>
                  <div className="flex flex-wrap gap-2">
                    {brandData.values.map((value) => (
                      <span key={value} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm border border-accent/20">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Brand Purpose */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Brand Purpose</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Star className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">Mission</span>
                      <p className="text-sm text-muted-foreground">{brandData.mission}</p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Vision</span>
                      <p className="text-sm text-muted-foreground">{brandData.vision}</p>
                    </div>
                  </div>
                </div>

                {/* Brand Colors */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Brand Colors</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Star className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {brandData.colors.map((color) => (
                      <div key={color.name} className="text-center">
                        <div 
                          className="w-20 h-20 rounded-lg mb-2 border border-border relative"
                          style={{ backgroundColor: color.hex }}
                        >
                          <button className="absolute top-1 right-1 p-1 rounded bg-background/80">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-medium" style={{ color: color.hex === "#FFFFFF" ? undefined : color.hex }}>{color.name}</p>
                        <p className="text-xs text-muted-foreground">{color.hex}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand Typography */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Brand Typography</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Copy className="w-4 h-4 text-muted-foreground" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-secondary"><Star className="w-4 h-4 text-muted-foreground" /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Primary font</span>
                      <span className="font-medium">{brandData.typography.primary}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Secondary font</span>
                      <span className="font-medium">{brandData.typography.secondary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Style / Brand Brain */}
              <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Visual Style</h3>
                      <p className="text-sm text-muted-foreground">
                        Visual Style learned from {visualStyle.imageCount} curated images
                      </p>
                      <p className="text-xs text-muted-foreground">Last updated: {visualStyle.lastUpdated}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors">
                    <RefreshCw className="w-4 h-4" />
                    Re-analyze curated images
                  </button>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "COMPOSITION", items: visualStyle.composition },
                    { label: "LIGHTING", items: visualStyle.lighting },
                    { label: "SETTING", items: visualStyle.setting },
                    { label: "PEOPLE", items: visualStyle.people },
                    { label: "STYLING", items: visualStyle.styling },
                  ].map((category) => (
                    <div key={category.label}>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">{category.label}</h4>
                      <div className="flex flex-wrap gap-2">
                        {category.items.map((item) => (
                          <span 
                            key={item.label}
                            className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm border border-accent/20 flex items-center gap-2"
                          >
                            {item.label}
                            <span className="text-xs text-accent/60">{item.score}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Personas */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold">Brand Personas</h3>
                    <p className="text-sm text-muted-foreground">Target audience segments for your brand</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary transition-colors">
                      <Plus className="w-4 h-4" />
                      Create
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {brandPersonas.map((persona) => (
                    <div key={persona.id} className="rounded-xl border border-border overflow-hidden bg-card">
                      <div className="aspect-[4/3] bg-secondary relative">
                        <img src="/placeholder.svg" alt={persona.name} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button className="p-1.5 rounded-lg bg-background/80 hover:bg-background transition-colors">
                            <UserCircle2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg bg-background/80 hover:bg-background transition-colors">
                            <Wand2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-lg mb-1">{persona.name}</h4>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{persona.description}</p>
                        
                        <div className="border-t border-border pt-3">
                          <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1">
                            <span className="w-0.5 h-3 bg-accent rounded-full" />
                            IDENTITY SNAPSHOT
                          </p>
                          <div className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Age</span>
                              <span className="font-medium">{persona.age}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCircle2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Gender</span>
                              <span className="font-medium">{persona.gender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Location</span>
                              <span className="font-medium">{persona.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Campaign Section */}
          <section ref={campaignRef} className="px-8 py-16 border-t border-border bg-secondary/20">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Campaign Setup</h2>
                  <p className="text-sm text-muted-foreground">Create your advertising campaign</p>
                </div>
              </div>

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
            </div>
          </section>

          {/* Image Generation Section */}
          <section ref={imageRef} className="px-8 py-16 border-t border-border bg-secondary/20">
            <div className="max-w-5xl mx-auto">
              <div className="glass-card p-6">
                {/* Top right actions */}
                <div className="flex justify-end gap-2 mb-4">
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

                <div className="flex gap-6">
                  {/* Left side - Mode toggles */}
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setGenerationMode("image")}
                      className={`p-3 rounded-lg transition-colors ${
                        generationMode === "image" 
                          ? "bg-accent/10 text-accent" 
                          : "hover:bg-secondary text-muted-foreground"
                      }`}
                      title="Image Generation"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setGenerationMode("edit")}
                      className={`p-3 rounded-lg transition-colors ${
                        generationMode === "edit" 
                          ? "bg-accent/10 text-accent" 
                          : "hover:bg-secondary text-muted-foreground"
                      }`}
                      title="Image Editing"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => setGenerationMode("video")}
                      className={`p-3 rounded-lg transition-colors ${
                        generationMode === "video" 
                          ? "bg-accent/10 text-accent" 
                          : "hover:bg-secondary text-muted-foreground"
                      }`}
                      title="Video Generation"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </button>
                  </div>

                  {/* Right side - Main content */}
                  <div className="flex-1">
                    {/* Prompt Input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe what you want to see ..."
                        className="w-full bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center gap-3 mb-6">
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
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Model</span>
                          <select className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm">
                            <option>🌐 GPT Image 1</option>
                            <option>🎨 DALL-E 3</option>
                            <option>✨ Midjourney</option>
                          </select>
                        </div>
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
              </div>
            </div>
          </section>
        </main>

        {/* Right Chat Sidebar - Context Aware */}
        <aside className={`fixed right-0 top-[73px] w-[400px] h-[calc(100vh-73px)] border-l border-border bg-card flex flex-col overflow-hidden z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Context Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">{currentContext.title}</span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center"
                title="Close sidebar"
              >
                <PanelRightClose className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{currentContext.description}</p>
          </div>

          {/* Chat Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="p-4 rounded-xl bg-accent/10 text-sm">
                <p>I'm ready to help with your {activeSection === "hero" ? "creative needs" : activeSection} work. What would you like to do?</p>
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
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {currentContext.starterPrompts.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterPrompt(starter.prompt)}
                  className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-xs transition-colors border border-border hover:border-accent/30"
                >
                  {starter.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${activeSection === "hero" ? "anything" : activeSection}...`}
                rows={3}
                disabled={isChatLoading}
                className="w-full bg-secondary border border-border rounded-xl p-4 pr-12 pb-12 resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || isChatLoading}
                  className="p-2 rounded-lg bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
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
