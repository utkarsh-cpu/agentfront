import { create } from 'zustand'
import type { Task, TaskFilters } from '@/types'

interface TaskState {
  tasks: Task[]
  filters: TaskFilters
  total: number
  totalPages: number
  isLoading: boolean
  error: string | null
  setTasks: (tasks: Task[], total: number, totalPages: number) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  setFilters: (filters: Partial<TaskFilters>) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const defaultFilters: TaskFilters = {
  page: 1,
  pageSize: 20,
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  filters: defaultFilters,
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,

  setTasks: (tasks, total, totalPages) =>
    set({ tasks, total, totalPages, isLoading: false, error: null }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
}))
