// Core React and routing
import { useEffect } from "react";
import { Switch, Route } from "wouter";

// Performance utilities
import { initPerformanceOptimizations } from "@/utils/performance";

// Farcaster SDK
import { sdk } from "@farcaster/miniapp-sdk";

// External libraries
import { QueryClientProvider } from "@tanstack/react-query";

// Internal utilities and configs
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "@/lib/theme-provider";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SimpleRadarLogo } from "@/components/holographic-logo";

// Pages
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";



function AppHeader() {
  return (
    <header className="relative">
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between backdrop-blur-sm bg-white/15 border border-amber-900/25 rounded-xl px-6 py-3 shadow-lg hover:bg-white/20 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <SimpleRadarLogo className="w-6 h-6 text-white dark:text-gray-800" />
            <h1 className="text-xl font-bold text-white dark:text-gray-800">
              EthosRadar
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-transparent transition-colors duration-200">
      <AppHeader />
      <main>
        <Router />
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  // Initialize performance optimizations
  useEffect(() => {
    initPerformanceOptimizations();
  }, []);

  // Initialize Farcaster SDK - optimized for faster loading
  useEffect(() => {
    // Initialize Farcaster Mini App SDK
    const initializeSdk = async () => {
      try {
        // Reduce initialization delay for faster startup
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Signal to Farcaster that the app is ready
        await sdk.actions.ready();
        console.log('Farcaster SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        // Still call ready to hide splash screen even if there's an error
        try {
          await sdk.actions.ready();
        } catch (readyError) {
          console.error('Failed to call ready():', readyError);
        }
      }
    };
    
    initializeSdk();
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppContent />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
