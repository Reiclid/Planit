import { create } from 'zustand';

interface AppState {
    tool: string;
    setTool: (tool: string) => void;

    lines: any[];
    setLines: (lines: any[]) => void;
    removeLine: (lineId: string) => void;

    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;

}

export const useStore = create<AppState>((set) => ({
    tool: 'cursor',
    setTool: (tool) => set({ tool }),

    lines: [],
    setLines: (lines) => set({ lines }),
    removeLine: (lineId) => set((state) => ({
        lines: state.lines.filter((line) => line.id !== lineId)
    })),

    selectedIds: [],
    setSelectedIds: (ids) => set({ selectedIds: ids }),
}));