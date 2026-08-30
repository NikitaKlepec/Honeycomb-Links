import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { SEED_DATA } from '../data/seed';
import { loadVaultFromSupabase, syncVaultToSupabase } from '../lib/linkVaultPersistence';
import { isSupabaseConfigured, supabaseConfigError } from '../lib/supabase';

export interface Link {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  imagePosition?: { x: number; y: number };
  imageOpacity?: number;
  titleColor?: string;
  descriptionColor?: string;
  titleFontSize?: number;
  descriptionFontSize?: number;
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  titleBold?: boolean;
  titleItalic?: boolean;
  titleUnderline?: boolean;
  descriptionBold?: boolean;
  descriptionItalic?: boolean;
  descriptionUnderline?: boolean;
  screenshotUrl?: string;
  color?: string;
  order: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  links: Link[];
}

export interface LinkVaultData {
  categories: Category[];
  activeCategory: string;
}

const STORAGE_KEY = 'link-vault-data';

function cloneData(data: LinkVaultData): LinkVaultData {
  return JSON.parse(JSON.stringify(data)) as LinkVaultData;
}

function readLegacyData(): LinkVaultData | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as LinkVaultData;
  } catch (error) {
    console.error('Failed to parse legacy localStorage data', error);
    return null;
  }
}

function getInitialData() {
  return readLegacyData() ?? cloneData({
    categories: SEED_DATA,
    activeCategory: SEED_DATA[0]?.id ?? '',
  });
}

function getPersistenceErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Could not find the table')) {
    return 'Supabase is connected, but the Link Vault tables are missing. Run artifacts/link-vault/supabase/schema.sql in the Supabase SQL Editor.';
  }
  return `Supabase storage error: ${message}`;
}

export function useLinkVaultHook() {
  const [data, setData] = useState<LinkVaultData>(getInitialData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const legacyMigrationPendingRef = useRef(false);
  const syncQueueRef = useRef(Promise.resolve());
  const syncRevisionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      if (!isSupabaseConfigured) {
        setPersistenceError(supabaseConfigError);
        setIsLoading(false);
        return;
      }

      try {
        const remoteData = await loadVaultFromSupabase();
        if (cancelled) return;

        if (remoteData.categories.length === 0) {
          const legacyData = readLegacyData();
          const sourceData = legacyData ?? getInitialData();
          legacyMigrationPendingRef.current = Boolean(legacyData);
          setData(sourceData);
        } else {
          setData(remoteData);
        }

        setPersistenceError(null);
        setIsHydrated(true);
      } catch (error) {
        if (cancelled) return;
        setPersistenceError(getPersistenceErrorMessage(error));
        setIsLoading(false);
      }
    }

    void hydrate().finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated || !isSupabaseConfigured) return;

    const revision = ++syncRevisionRef.current;
    setIsSaving(true);
    const snapshot = cloneData(data);
    const migrationPending = legacyMigrationPendingRef.current;

    const operation = syncQueueRef.current
      .catch(() => undefined)
      .then(() => syncVaultToSupabase(snapshot))
      .then(() => {
        if (migrationPending && typeof window !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
          legacyMigrationPendingRef.current = false;
        }
        if (syncRevisionRef.current === revision) {
          setPersistenceError(null);
        }
      })
      .catch((error) => {
        if (syncRevisionRef.current === revision) {
          setPersistenceError(getPersistenceErrorMessage(error));
        }
      })
      .finally(() => {
        if (syncRevisionRef.current === revision) setIsSaving(false);
      });

    syncQueueRef.current = operation.then(() => undefined, () => undefined);
  }, [data, isHydrated]);

  const setActiveCategory = useCallback((id: string) => {
    setData((prev) => ({ ...prev, activeCategory: id }));
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  // Category Actions
  const addCategory = useCallback((name: string, icon: string) => {
    setData((prev) => {
      const newCategory: Category = {
        id: crypto.randomUUID(),
        name,
        icon,
        links: [],
      };
      return {
        ...prev,
        categories: [...prev.categories, newCategory],
        activeCategory: newCategory.id,
      };
    });
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Omit<Category, 'id' | 'links'>>) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setData((prev) => {
      const newCategories = prev.categories.filter((c) => c.id !== id);
      const newActive = prev.activeCategory === id ? (newCategories[0]?.id || '') : prev.activeCategory;
      return {
        ...prev,
        categories: newCategories,
        activeCategory: newActive,
      };
    });
  }, []);

  // Link Actions
  const addLink = useCallback((categoryId: string, link: Omit<Link, 'id' | 'order'>) => {
    setData((prev) => {
      const categories = [...prev.categories];
      const catIdx = categories.findIndex((c) => c.id === categoryId);
      if (catIdx === -1) return prev;

      const cat = { ...categories[catIdx] };
      const newLink: Link = {
        ...link,
        id: crypto.randomUUID(),
        order: cat.links.length,
      };
      cat.links = [...cat.links, newLink];
      categories[catIdx] = cat;

      return { ...prev, categories };
    });
  }, []);

  const updateLink = useCallback((categoryId: string, linkId: string, updates: Partial<Omit<Link, 'id' | 'order'>>) => {
    setData((prev) => {
      return {
        ...prev,
        categories: prev.categories.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            links: cat.links.map((l) => (l.id === linkId ? { ...l, ...updates } : l)),
          };
        }),
      };
    });
  }, []);

  const deleteLink = useCallback((categoryId: string, linkId: string) => {
    setData((prev) => {
      return {
        ...prev,
        categories: prev.categories.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            links: cat.links.filter((l) => l.id !== linkId).map((l, idx) => ({ ...l, order: idx })),
          };
        }),
      };
    });
  }, []);

  const reorderLinks = useCallback((categoryId: string, activeId: string, overId: string) => {
    setData((prev) => {
      const categories = [...prev.categories];
      const catIdx = categories.findIndex((c) => c.id === categoryId);
      if (catIdx === -1) return prev;

      const cat = { ...categories[catIdx] };
      const links = [...cat.links];
      const oldIndex = links.findIndex((l) => l.id === activeId);
      const newIndex = links.findIndex((l) => l.id === overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const [movedItem] = links.splice(oldIndex, 1);
      links.splice(newIndex, 0, movedItem);

      cat.links = links.map((l, idx) => ({ ...l, order: idx }));
      categories[catIdx] = cat;

      return { ...prev, categories };
    });
  }, []);

  return {
    data,
    isEditMode,
    isLoading,
    isSaving,
    persistenceError,
    toggleEditMode,
    setActiveCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
  };
}

export type LinkVaultContextType = ReturnType<typeof useLinkVaultHook>;

export const LinkVaultContext = createContext<LinkVaultContextType | null>(null);

export function LinkVaultProvider({ children }: { children: ReactNode }) {
  const vault = useLinkVaultHook();
  return <LinkVaultContext.Provider value={vault}>{children}</LinkVaultContext.Provider>;
}

export function useVault() {
  const ctx = useContext(LinkVaultContext);
  if (!ctx) throw new Error('useVault must be used within LinkVaultProvider');
  return ctx;
}
