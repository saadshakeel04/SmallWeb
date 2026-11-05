"use client";

import { create } from "zustand";
import type { Person } from "@/types/api";

interface BrowserStore {
  selectedPerson: Person | null;
  setSelectedPerson: (person: Person | null) => void;
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  selectedPerson: null,
  setSelectedPerson: (selectedPerson) => set({ selectedPerson }),
}));
