import { ChevronDown, Building2, Check, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBrands } from "@/hooks/useBrands";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BrandSelectorProps {
  variant?: "default" | "inline" | "chip";
  className?: string;
}

const BrandSelector = ({ variant = "default", className }: BrandSelectorProps) => {
  const navigate = useNavigate();
  const { brands, currentBrand, setCurrentBrand, isLoading } = useBrands();

  // Chip variant - small pill below heading
  if (variant === "chip") {
    if (!currentBrand) {
      return (
        <button
          onClick={() => navigate("/brand-setup")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-all border border-border/50",
            className
          )}
        >
          <Plus className="w-4 h-4" />
          Set up your brand
        </button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 hover:bg-accent/20 text-sm font-medium text-accent transition-all focus:outline-none border border-accent/20",
              className
            )}
          >
            <Building2 className="w-4 h-4" />
            <span>{currentBrand.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          className="w-52 bg-popover border border-border shadow-xl z-50 rounded-xl p-1"
        >
          {brands.map((brand) => (
            <DropdownMenuItem
              key={brand.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer focus:bg-secondary hover:bg-secondary"
              onClick={() => setCurrentBrand(brand)}
            >
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 font-medium truncate">{brand.name}</span>
              {brand.id === currentBrand.id && (
                <Check className="w-4 h-4 text-accent" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer focus:bg-primary/10 hover:bg-primary/10 text-primary"
            onClick={() => navigate("/brand-setup")}
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add new brand</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Inline variant for use in headings
  if (variant === "inline") {
    if (!currentBrand) {
      return (
        <button
          onClick={() => navigate("/brand-setup")}
          className={cn(
            "inline-flex items-center gap-1 border-b-2 border-dashed border-accent/50 hover:border-accent text-accent transition-all",
            className
          )}
        >
          your brand
          <Plus className="w-5 h-5" />
        </button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "text-gradient border-b-2 border-primary/30 hover:border-primary/60 transition-all focus:outline-none",
              className
            )}
          >
            {currentBrand.name}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="center" 
          className="w-56 bg-popover border border-border shadow-xl z-50 rounded-xl p-1"
        >
          {brands.map((brand) => (
            <DropdownMenuItem
              key={brand.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-secondary hover:bg-secondary"
              onClick={() => setCurrentBrand(brand)}
            >
              <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="flex-1 font-medium truncate text-base">{brand.name}</span>
              {brand.id === currentBrand.id && (
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer focus:bg-primary/10 hover:bg-primary/10 text-primary"
            onClick={() => navigate("/brand-setup")}
          >
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-base">Add new brand</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant (button style)
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 animate-pulse">
        <div className="w-6 h-6 rounded-full bg-muted" />
        <div className="w-20 h-4 rounded bg-muted" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
            {currentBrand?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="max-w-[120px] truncate">{currentBrand?.name || "Select brand"}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 bg-popover border border-border shadow-lg z-50">
        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentBrand(brand)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {brand.name.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 truncate">{brand.name}</span>
            {currentBrand?.id === brand.id && (
              <Check className="w-4 h-4 text-primary shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        {brands.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem
          className="flex items-center gap-3 cursor-pointer text-muted-foreground"
          onClick={() => navigate("/brand-setup")}
        >
          <span className="text-sm">+ Add new brand</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BrandSelector;
