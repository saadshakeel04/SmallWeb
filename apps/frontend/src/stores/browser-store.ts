"use client";

import { create } from "zustand";
import type { NavigationEntry, NavigationSource, Person, Site } from "@/types/api";

interface BrowserStore {
  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;
  navigationEntries: NavigationEntry[];
  currentNavigationIndex: number;
  nextNavigationEntryId: number;
  navigate: (site: Site, source: NavigationSource) => void;
  goBack: () => void;
  goForward: () => void;
  saveScrollPosition: (entryId: string, scrollY: number) => void;
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  selectedPerson: null,
  setSelectedPerson: (selectedPerson) => set({ selectedPerson }),
  navigationEntries: [],
  currentNavigationIndex: -1,
  nextNavigationEntryId: 1,
  navigate: (site, source) =>
    set((state) => {
      const activeEntries = state.navigationEntries.slice(
        0,
        state.currentNavigationIndex + 1,
      );
      const entryId = `navigation-${state.nextNavigationEntryId}`;
      const entry: NavigationEntry = {
        id: entryId,
        address: site.address,
        siteId: site._id,
        title: site.title,
        site,
        source,
        scrollY: 0,
      };

      return {
        navigationEntries: [...activeEntries, entry],
        currentNavigationIndex: activeEntries.length,
        nextNavigationEntryId: state.nextNavigationEntryId + 1,
      };
    }),
  goBack: () =>
    set((state) =>
      state.currentNavigationIndex > 0
        ? { currentNavigationIndex: state.currentNavigationIndex - 1 }
        : state,
    ),
  goForward: () =>
    set((state) =>
      state.currentNavigationIndex < state.navigationEntries.length - 1
        ? { currentNavigationIndex: state.currentNavigationIndex + 1 }
        : state,
    ),
  saveScrollPosition: (entryId, scrollY) =>
    set((state) => {
      const entryIndex = state.navigationEntries.findIndex((entry) => entry.id === entryId);
      if (entryIndex < 0 || state.navigationEntries[entryIndex].scrollY === scrollY) {
        return state;
      }

      const navigationEntries = [...state.navigationEntries];
      navigationEntries[entryIndex] = { ...navigationEntries[entryIndex], scrollY };
      return { navigationEntries };
    }),
}));
