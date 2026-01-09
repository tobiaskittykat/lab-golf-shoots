import { Plus, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useBrands, Brand } from "@/hooks/useBrands";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BrandSelector = () => {
  const navigate = useNavigate();
  const { brands, currentBrand, setCurrentBrand, isLoading } = useBrands();

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
      <DropdownMenuContent align="start" className="w-64">
        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentBrand(brand)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {brand.name.charAt(0).toUpperCase()}
            </div>
            <span className="flex-1 truncate">{brand.name}</span>
            {currentBrand?.id === brand.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          className="flex items-center gap-3 cursor-pointer text-primary"
          onClick={() => navigate("/brand-setup")}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span>Create new brand</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BrandSelector;
