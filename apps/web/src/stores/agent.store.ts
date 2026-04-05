import { create } from 'zustand'
import type { Agent } from '@/types'

const LAST_AGENT_KEY = 'lastAgentId'

interface AgentState {
  agents: Agent[]
  selectedAgent: Agent | null
  lastAgentId: string | null
  isLoading: boolean
  error: string | null
  setAgents: (agents: Agent[]) => void
  setSelectedAgent: (agent: Agent | null) => void
  setLastAgentId: (id: string) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  removeAgent: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  selectedAgent: null,
  lastAgentId: localStorage.getItem(LAST_AGENT_KEY),
  isLoading: false,
  error: null,

  setAgents: (agents) => set({ agents, isLoading: false, error: null }),
  setSelectedAgent: (selectedAgent) => set({ selectedAgent }),
  setLastAgentId: (id) => {
    localStorage.setItem(LAST_AGENT_KEY, id)
    set({ lastAgentId: id })
  },
  addAgent: (agent) => set((s) => ({ agents: [agent, ...s.agents] })),
  updateAgent: (id, updates) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      selectedAgent:
        s.selectedAgent?.id === id
          ? { ...s.selectedAgent, ...updates }
          : s.selectedAgent,
    })),
  removeAgent: (id) =>
    set((s) => ({
      agents: s.agents.filter((a) => a.id !== id),
      selectedAgent: s.selectedAgent?.id === id ? null : s.selectedAgent,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}))
