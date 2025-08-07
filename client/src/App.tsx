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
    <header className="relative z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="neo-card flex items-center justify-between px-6 py-4 floating-animation">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <SimpleRadarLogo className="w-8 h-8 text-blue-400 rotating-slow" />
              <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full blur-lg"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                EthosRadar
              </h1>
              <p className="text-xs text-slate-400 font-medium">Trust Network Scanner</p>
            </div>
          </div>
          <div className="neo-card p-2 bg-opacity-50">
            <ThemeToggle />
          </div>
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
