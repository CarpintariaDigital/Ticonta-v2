import { create } from 'zustand';
import { api } from '../lib/api';
import {
  Project,
  ProjectTask,
  ProjectExpense,
  ProjectSummary,
  ProjectStatus,
  TaskStatus,
} from '@/types/projects';

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  summary: ProjectSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: (filters?: { status?: ProjectStatus; search?: string }) => Promise<void>;
  fetchProjectById: (id: number) => Promise<void>;
  createProject: (data: { name: string; description?: string; budget: number; status?: ProjectStatus; start_date?: string; end_date?: string }) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  addTask: (projectId: number, data: { title: string; description?: string; due_date?: string; status?: TaskStatus }) => Promise<ProjectTask>;
  updateTaskStatus: (projectId: number, taskId: number, status: TaskStatus) => Promise<ProjectTask>;
  deleteTask: (projectId: number, taskId: number) => Promise<void>;
  addExpense: (projectId: number, data: { description: string; amount: number; category?: string; date?: string }) => Promise<ProjectExpense>;
  fetchProjectSummary: (id: number) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  selectedProject: null,
  summary: null,
  isLoading: false,
  error: null,

  fetchProjects: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/v1/projects', { params: filters });
      set({ projects: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar projetos', isLoading: false });
    }
  },

  fetchProjectById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/v1/projects/${id}`);
      set({ selectedProject: res.data, isLoading: false });
      await get().fetchProjectSummary(id);
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao carregar projeto', isLoading: false });
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/v1/projects', data);
      await get().fetchProjects();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao criar projeto', isLoading: false });
      throw err;
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/api/v1/projects/${id}`, data);
      await get().fetchProjectById(id);
      await get().fetchProjects();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao atualizar projeto', isLoading: false });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/projects/${id}`);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao excluir projeto', isLoading: false });
      throw err;
    }
  },

  addTask: async (projectId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/api/v1/projects/${projectId}/tasks`, data);
      await get().fetchProjectById(projectId);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao adicionar tarefa', isLoading: false });
      throw err;
    }
  },

  updateTaskStatus: async (projectId, taskId, status) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put(`/api/v1/projects/${projectId}/tasks/${taskId}`, { status });
      await get().fetchProjectById(projectId);
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao atualizar tarefa', isLoading: false });
      throw err;
    }
  },

  deleteTask: async (projectId, taskId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/api/v1/projects/${projectId}/tasks/${taskId}`);
      await get().fetchProjectById(projectId);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao remover tarefa', isLoading: false });
      throw err;
    }
  },

  addExpense: async (projectId, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/api/v1/projects/${projectId}/expenses`, data);
      await get().fetchProjectById(projectId);
      await get().fetchProjects();
      set({ isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Erro ao lançar despesa', isLoading: false });
      throw err;
    }
  },

  fetchProjectSummary: async (id) => {
    try {
      const res = await api.get(`/api/v1/projects/${id}/summary`);
      set({ summary: res.data });
    } catch (err: any) {
      // Summary optional
    }
  },
}));
