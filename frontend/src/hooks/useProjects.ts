import { useEffect, useState } from "react";
import { projectService } from "@/services/projects";
import { useProjectsStore } from "@/store/projects.store";
import {
  CreateExpenseInput,
  CreateProjectInput,
  CreateTaskInput,
  Project,
  ProjectStatus,
  ProjectSummary,
  TaskStatus,
} from "@/types/projects";

export function useProjects() {
  const {
    projects,
    selectedProject,
    statusFilter,
    searchQuery,
    isLoading,
    setProjects,
    selectProject,
    setStatusFilter,
    setSearchQuery,
    setIsLoading,
    updateProjectInState,
    removeProjectFromState,
  } = useProjectsStore();

  const [summary, setSummary] = useState<ProjectSummary | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchQuery || undefined,
      });
      setProjects(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, searchQuery]);

  const loadProjectDetails = async (id: number) => {
    try {
      const [proj, sum] = await Promise.all([
        projectService.getProject(id),
        projectService.getProjectSummary(id),
      ]);
      selectProject(proj);
      setSummary(sum);
      updateProjectInState(proj);
    } catch {
      // ignore
    }
  };

  const createProject = async (data: CreateProjectInput): Promise<Project> => {
    const newProj = await projectService.createProject(data);
    await fetchProjects();
    return newProj;
  };

  const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
    const updated = await projectService.updateProject(id, data);
    updateProjectInState(updated);
    return updated;
  };

  const deleteProject = async (id: number): Promise<void> => {
    await projectService.deleteProject(id);
    removeProjectFromState(id);
    await fetchProjects();
  };

  const addTask = async (projectId: number, data: CreateTaskInput) => {
    const task = await projectService.addTask(projectId, data);
    await loadProjectDetails(projectId);
    return task;
  };

  const updateTask = async (projectId: number, taskId: number, data: { status?: TaskStatus; title?: string }) => {
    const task = await projectService.updateTask(projectId, taskId, data);
    await loadProjectDetails(projectId);
    return task;
  };

  const addExpense = async (projectId: number, data: CreateExpenseInput) => {
    const expense = await projectService.addExpense(projectId, data);
    await loadProjectDetails(projectId);
    return expense;
  };

  return {
    projects,
    selectedProject,
    summary,
    statusFilter,
    searchQuery,
    isLoading,
    fetchProjects,
    loadProjectDetails,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    setStatusFilter,
    setSearchQuery,
    addTask,
    updateTask,
    addExpense,
  };
}
