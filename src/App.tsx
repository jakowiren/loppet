import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import Header from "./components/Header";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Annonser from "./pages/Annonser";
import SkapaAnnons from "./pages/SkapaAnnons";
import LoginToCreateAd from "./pages/LoginToCreateAd";
import NotFound from "./pages/NotFound";
import Footer from "@/components/Footer";
import OmOss from "./pages/OmOss";
import FAQ from "./pages/FAQ";
import AdDetails from "./pages/AdDetails";
import ScrollToTop from "./components/ScrollToTop";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <div className="min-h-screen bg-gray-50">
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/annonser" element={<Annonser />} />
                <Route path="/skapa-annons" element={<SkapaAnnons />} />
                <Route path="/login-to-create" element={<LoginToCreateAd />} />
                <Route path="/om-oss" element={<OmOss />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/annonser/:id" element={<AdDetails />} />
                {/* Add more routes as needed */}
                {/* Admin route - protected */}
                {/* Add more routes as needed */}
                {/* Catch-all route for 404 Not Found */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
            <Footer/>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
