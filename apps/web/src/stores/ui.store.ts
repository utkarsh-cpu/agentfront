import type { ReactNode } from 'react'
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  rightPanelOpen: boolean
  rightPanelContent: ReactNode | null
  commandPaletteOpen: boolean
  theme: 'light' | 'dark' | 'system'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleRightPanel: () => void
  setRightPanelOpen: (open: boolean) => void
  setRightPanelContent: (content: ReactNode | null) => void
  setCommandPaletteOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  rightPanelOpen: false,
  rightPanelContent: null,
  commandPaletteOpen: false,
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
  setRightPanelContent: (rightPanelContent) => set({ rightPanelContent, rightPanelOpen: true }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setTheme: (theme) => set({ theme }),
}))
