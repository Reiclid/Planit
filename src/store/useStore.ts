import { create } from 'zustand';

interface AppState {
    tool: string;
    setTool: (tool: string) => void;

    lines: any[];
    setLines: (lines: any[]) => void;
    removeLine: (lineId: string) => void;
    updateLine: (id: string, newConfig: any) => void;

    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;

    penSetting: { color: string; size: number };
    setPenSetting: (penSetting: { color: string; size: number }) => void;
}

export const useStore = create<AppState>((set) => ({
    tool: 'cursor',
    setTool: (tool) => set({ tool }),

    lines: [],
    setLines: (lines) => set({ lines }),
    removeLine: (lineId) => set((state) => ({
        lines: state.lines.filter((line) => line.id !== lineId)
    })),
    updateLine: (id, newConfig) => set((state) => ({
        lines: state.lines.map((line) => 
            line.id === id ? { ...line, ...newConfig } : line
        )
    })),

    selectedIds: [],
    setSelectedIds: (ids) => set({ selectedIds: ids }),

    penSetting: { color: '#000000', size: 5 },
    setPenSetting: (penSetting) => set({ penSetting }),
}));