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

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-transparent overflow-hidden text-foreground">
      <Sidebar />
      <div className="flex-1 relative flex flex-col min-h-0" style={{background: 'rgba(215,210,242,0.6)'}}>
        {/* Top bar */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
              isEditMode 
                ? 'glass-panel glow-accent border-primary text-primary shadow-[0_0_20px_rgba(124,58,237,0.3)]' 
                : 'glass-panel neo-shadow text-foreground border-white/60 hover:border-primary/30 hover:text-primary'
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
