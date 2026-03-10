import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBrands } from "@/hooks/useBrands";
import {
  Image,
  Wand2,
  Layers,
  Settings2,
  GalleryHorizontal,
  Package,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { id: "create-image", label: "Create Image", icon: Image, path: "/create-image" },
  { id: "edit-image", label: "Edit Image", icon: Wand2, path: "/edit-image" },
  { id: "batch", label: "Batch Generate", icon: Layers, path: "/batch-generate" },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal, path: "/gallery" },
  { id: "products", label: "Products", icon: Package, path: "/products" },
  { id: "settings", label: "Settings", icon: Settings2, path: "/settings" },
];

const Index = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { currentBrand } = useBrands();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-coral to-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">KittyKat</span>
            {currentBrand && (
              <span className="text-sm text-muted-foreground ml-2">· {currentBrand.name}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">
            What would you like to <span className="text-gradient">create</span>?
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a tool to get started with your creative workflow
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="glass-card p-6 text-left hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.label}</h3>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Index;
