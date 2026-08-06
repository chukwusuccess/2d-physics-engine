import { create } from 'zustand';

export interface StudioState {
  activeTab: 'spawn' | 'physics' | 'render';
  isPaused: boolean;
  isSlowMo: boolean;
  gravityY: number;
  restitution: number;
  friction: number;
  iterations: number;
  showContacts: boolean;
  showNormals: boolean;
  showVelocities: boolean;
  showTrails: boolean;
  theme: 'neon' | 'cyan' | 'monochrome';
  isShortcutsOpen: boolean;

  // Actions
  setActiveTab: (tab: 'spawn' | 'physics' | 'render') => void;
  togglePaused: () => void;
  toggleSlowMo: () => void;
  setGravityY: (g: number) => void;
  invertGravity: () => void;
  setRestitution: (r: number) => void;
  setFriction: (f: number) => void;
  setIterations: (n: number) => void;
  setShowContacts: (val: boolean) => void;
  setShowNormals: (val: boolean) => void;
  setShowVelocities: (val: boolean) => void;
  setShowTrails: (val: boolean) => void;
  setTheme: (t: 'neon' | 'cyan' | 'monochrome') => void;
  setShortcutsOpen: (open: boolean) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  activeTab: 'spawn',
  isPaused: false,
  isSlowMo: false,
  gravityY: 490.5,
  restitution: 0.6,
  friction: 0.3,
  iterations: 8,
  showContacts: true,
  showNormals: true,
  showVelocities: false,
  showTrails: false,
  theme: 'neon',
  isShortcutsOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  togglePaused: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleSlowMo: () => set((state) => ({ isSlowMo: !state.isSlowMo })),
  setGravityY: (gravityY) => set({ gravityY }),
  invertGravity: () => set((state) => ({ gravityY: -state.gravityY })),
  setRestitution: (restitution) => set({ restitution }),
  setFriction: (friction) => set({ friction }),
  setIterations: (iterations) => set({ iterations }),
  setShowContacts: (showContacts) => set({ showContacts }),
  setShowNormals: (showNormals) => set({ showNormals }),
  setShowVelocities: (showVelocities) => set({ showVelocities }),
  setShowTrails: (showTrails) => set({ showTrails }),
  setTheme: (theme) => set({ theme }),
  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),
}));
