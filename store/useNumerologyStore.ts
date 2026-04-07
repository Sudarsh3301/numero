import { create } from 'zustand';

interface NumerologyState {
  selectedNumber: number | null;
  missingNumbers: number[];
  dominantNumbers: number[];
  setSelectedNumber: (num: number | null) => void;
  setMissingNumbers: (nums: number[]) => void;
  setDominantNumbers: (nums: number[]) => void;
}

export const useNumerologyStore = create<NumerologyState>((set) => ({
  selectedNumber: null,
  missingNumbers: [],
  dominantNumbers: [],
  setSelectedNumber: (num) => set({ selectedNumber: num }),
  setMissingNumbers: (nums) => set({ missingNumbers: nums }),
  setDominantNumbers: (nums) => set({ dominantNumbers: nums }),
}));
