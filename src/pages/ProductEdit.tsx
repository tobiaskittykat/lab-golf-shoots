// Stub - to be filled from source repo
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ProductEdit() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/products")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </button>
        <h1 className="font-display text-3xl font-bold mb-4">Edit Product</h1>
        <p className="text-muted-foreground">Product edit page - stub. Full version to be imported.</p>
      </div>
    </div>
  );
}
