import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { LinkVaultProvider, useVault } from './store/useLinkVault';
import { Sidebar } from './components/Sidebar';
import { HoneycombGrid } from './components/HoneycombGrid';
import { Settings2 } from 'lucide-react';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function VaultApp() {
  const { isEditMode, toggleEditMode } = useVault();

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background overflow-hidden dark text-foreground">
      <Sidebar />
      <div className="flex-1 relative flex flex-col min-h-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background via-background to-[#050508]">
        {/* Top bar */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
              isEditMode 
                ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-primary-foreground/20' 
                : 'bg-card text-muted-foreground border border-border hover:border-primary/50 hover:text-primary'
            }`}
          >
            <Settings2 className={`w-4 h-4 ${isEditMode ? 'animate-spin-slow' : ''}`} />
            {isEditMode ? 'EXIT EDIT MODE' : 'EDIT VAULT'}
          </button>
        </div>
        
        {/* Main Grid Area */}
        <div className="flex-1 relative">
          <HoneycombGrid />
        </div>
        
        {/* Aesthetic background elements */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" style={{ backgroundSize: '4px 4px' }} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LinkVaultProvider>
          <VaultApp />
        </LinkVaultProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
