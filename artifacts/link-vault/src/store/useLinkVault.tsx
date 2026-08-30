import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { SEED_DATA } from '../data/seed';

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

export function useLinkVaultHook() {
  const [data, setData] = useState<LinkVaultData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse localStorage data', e);
      }
    }
    return {
      categories: SEED_DATA,
      activeCategory: SEED_DATA[0].id,
    };
  });

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

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
