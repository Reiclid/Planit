import { create } from 'zustand';

interface AppState {
  tool: string;
  setTool: (tool: string) => void;
}

export const useStore = create<AppState>((set) => ({
  tool: 'cursor',
  setTool: (tool) => set({ tool }),
}));

export function deleteLine(index: number) {
    
};