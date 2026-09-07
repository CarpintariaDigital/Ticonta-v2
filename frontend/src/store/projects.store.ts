import { create } from "zustand";
import { Project, ProjectStatus } from "@/types/projects";

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  statusFilter: ProjectStatus | "all";
  searchQuery: string;
  isLoading: boolean;

  setProjects: (projects: Project[]) => void;
  selectProject: (project: Project | null) => void;
  setStatusFilter: (status: ProjectStatus | "all") => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateProjectInState: (updated: Project) => void;
  removeProjectFromState: (id: number) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  selectedProject: null,
  statusFilter: "all",
  searchQuery: "",
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  selectProject: (selectedProject) => set({ selectedProject }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsLoading: (isLoading) => set({ isLoading }),
  updateProjectInState: (updated) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
      selectedProject: state.selectedProject?.id === updated.id ? updated : state.selectedProject,
    })),
  removeProjectFromState: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProject: state.selectedProject?.id === id ? null : state.selectedProject,
    })),
}));
