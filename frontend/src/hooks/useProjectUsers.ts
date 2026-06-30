import { useCallback, useState } from "react";
import { projectUserService } from "../services/projects/projectUserService";
import type { TProjectUser } from "../types/TProjectUser";
import { logApiError } from "../utils/apiError";

export const useProjectUsers = (projectId: string) => {
  const [projectUsers, setProjectUsers] = useState<TProjectUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjectUsers = useCallback(async (): Promise<TProjectUser[]> => {
    if (!projectId) return [];

    setLoading(true);

    try {
      const users = await projectUserService.getProjectUsers(projectId);

      setProjectUsers(users);

      return users;
    } catch (error: unknown) {
      logApiError("Erro ao buscar usuários do projeto", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addProjectUser = useCallback(
    async (userId: string): Promise<TProjectUser | null> => {
      if (!projectId) return null;

      try {
        const created = await projectUserService.addProjectUser({
          project_id: projectId,
          user_id: userId,
        });

        setProjectUsers((prev) => {
          const alreadyExists = prev.some(
            (projectUser) => projectUser.user_id === created.user_id
          );

          if (alreadyExists) return prev;

          return [...prev, created];
        });

        return created;
      } catch (error: unknown) {
        logApiError("Erro ao adicionar usuário ao projeto", error);
        throw error;
      }
    },
    [projectId]
  );

  const removeProjectUser = useCallback(
    async (userId: string): Promise<void> => {
      if (!projectId) return;

      try {
        await projectUserService.removeProjectUser({
          project_id: projectId,
          user_id: userId,
        });

        setProjectUsers((prev) =>
          prev.filter((projectUser) => projectUser.user_id !== userId)
        );
      } catch (error: unknown) {
        logApiError("Erro ao remover usuário do projeto", error);
        throw error;
      }
    },
    [projectId]
  );

  const leaveProject = useCallback(async (): Promise<void> => {
    if (!projectId) return;

    try {
      await projectUserService.leaveProject(projectId);
    } catch (error: unknown) {
      logApiError("Erro ao sair do projeto", error);
      throw error;
    }
  }, [projectId]);

  return {
    projectUsers,
    loading,
    fetchProjectUsers,
    addProjectUser,
    removeProjectUser,
    leaveProject,
  };
};