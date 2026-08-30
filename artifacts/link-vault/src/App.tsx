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
  const { isEditMode, isLoading, isSaving, persistenceError, toggleEditMode } = useVault();

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-transparent overflow-hidden text-foreground">
      <Sidebar />
      <div className="flex-1 relative flex flex-col min-h-0" style={{background: '#f5f5f1'}}>
        <div className="absolute top-20 left-4 z-40 max-w-[min(28rem,calc(100%-6rem))] space-y-2">
          {isLoading && (
            <div className="rounded-md bg-white/85 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
              Loading vault…
            </div>
          )}
          {persistenceError && (
            <div
              role="alert"
              className="rounded-md border border-orange-200 bg-orange-50/95 px-3 py-2 text-xs leading-relaxed text-orange-900 shadow-sm backdrop-blur-sm"
            >
              {persistenceError}
            </div>
          )}
          {isSaving && !persistenceError && (
            <div className="rounded-md bg-white/85 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
              Saving…
            </div>
          )}
        </div>
        {/* Top bar */}
        <div className="absolute top-4 right-4 z-40">
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 ${
              isEditMode 
                ? 'bg-primary text-primary-foreground border-primary glow-accent' 
                : 'glass-panel neo-shadow text-foreground hover:border-orange-500 hover:text-orange-600'
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
