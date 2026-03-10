import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BrandsProvider } from "@/hooks/useBrands";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import BrandSetup from "./pages/BrandSetup";
import CreateCampaign from "./pages/CreateCampaign";
import CreateImage from "./pages/CreateImage";
import EditImage from "./pages/EditImage";
import BatchGenerate from "./pages/BatchGenerate";
import Settings from "./pages/Settings";
import Gallery from "./pages/Gallery";
import Products from "./pages/Products";
import ProductEdit from "./pages/ProductEdit";
import NotFound from "./pages/NotFound";
import BetaGate from "./components/BetaGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BetaGate>
      <BrowserRouter>
        <AuthProvider>
          <BrandsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/brand-setup"
                element={
                  <ProtectedRoute requireBrand={false}>
                    <BrandSetup />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-campaign"
                element={
                  <ProtectedRoute>
                    <CreateCampaign />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-image"
                element={
                  <ProtectedRoute>
                    <CreateImage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-image"
                element={
                  <ProtectedRoute>
                    <EditImage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/batch-generate"
                element={
                  <ProtectedRoute>
                    <BatchGenerate />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <Gallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:id"
                element={
                  <ProtectedRoute>
                    <ProductEdit />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrandsProvider>
        </AuthProvider>
      </BrowserRouter>
      </BetaGate>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
