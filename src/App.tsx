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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrandsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
