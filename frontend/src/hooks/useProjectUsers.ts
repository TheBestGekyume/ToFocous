
import { useCallback, useState } from "react";
import { projectUserService } from "../services/projects/projectUserService";
import type { TProjectUser } from "../types/TProjectUser";

export const useProjectUsers = (projectId: string) => {
  const [projectUsers, setProjectUsers] = useState<TProjectUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjectUsers = useCallback(async () => {
    setLoading(true);

    try {
      const users = await projectUserService.getProjectUsers(projectId);
      setProjectUsers(users);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addProjectUser = useCallback(
    async (userId: string) => {
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
    },
    [projectId]
  );

  const removeProjectUser = useCallback(
    async (userId: string) => {
      await projectUserService.removeProjectUser({
        project_id: projectId,
        user_id: userId,
      });

      setProjectUsers((prev) =>
        prev.filter((projectUser) => projectUser.user_id !== userId)
      );
    },
    [projectId]
  );

  return {
    projectUsers,
    loading,
    fetchProjectUsers,
    addProjectUser,
    removeProjectUser,
  };
};