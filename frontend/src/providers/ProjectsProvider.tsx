import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RealtimeChannel, Session } from "@supabase/supabase-js";
import { ProjectsContext } from "../contexts/ProjectsContext";
import { projectService } from "../services/projects/projectService";
import { supabaseRealtimeClient } from "../services/realtime/supabaseRealtimeClient";
import { supabaseAuthClient } from "../services/auth/supabaseAuthClient";
import type {
  TCreateProjectDTO,
  TProject,
  TUpdateProjectDTO,
} from "../types/TProject";
import { logApiError } from "../utils/apiError";

type ProjectsProviderProps = {
  children: ReactNode;
};

const REALTIME_REFRESH_DELAY = 150;

const upsertProject = (
  list: TProject[],
  project: TProject
): TProject[] => {
  const alreadyExists = list.some((item) => item.id === project.id);

  if (alreadyExists) {
    return list.map((item) =>
      item.id === project.id ? project : item
    );
  }

  return [...list, project];
};

const removeDuplicatedProjects = (
  list: TProject[]
): TProject[] => {
  const projectsById = new Map<string, TProject>();

  list.forEach((project) => {
    projectsById.set(project.id, project);
  });

  return Array.from(projectsById.values());
};

export const ProjectsProvider = ({
  children,
}: ProjectsProviderProps) => {
  const [projects, setProjects] = useState<TProject[]>([]);
  const [loading, setLoading] = useState(false);

  const realtimeRefreshTimeoutRef = useRef<number | null>(null);

  const getProjectsFromApi = useCallback(
    async (): Promise<TProject[]> => {
      const data = await projectService.getAllProjects();

      return removeDuplicatedProjects(data);
    },
    []
  );

  const fetchProjects = useCallback(async (): Promise<TProject[]> => {
    setLoading(true);

    try {
      const uniqueProjects = await getProjectsFromApi();

      setProjects(uniqueProjects);

      return uniqueProjects;
    } catch (error: unknown) {
      logApiError("Erro ao buscar projetos", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getProjectsFromApi]);

  /*
   * Atualização usada pelo Realtime.
   *
   * Não altera o loading geral para evitar que o LoadingOverlay
   * apareça sempre que outra pessoa modificar um projeto.
   */
  const refreshProjectsSilently = useCallback(async (): Promise<void> => {
    try {
      const uniqueProjects = await getProjectsFromApi();

      setProjects(uniqueProjects);
    } catch (error: unknown) {
      logApiError(
        "Erro ao sincronizar projetos em tempo real",
        error
      );
    }
  }, [getProjectsFromApi]);

  const scheduleRealtimeRefresh = useCallback(() => {
    if (realtimeRefreshTimeoutRef.current !== null) {
      window.clearTimeout(realtimeRefreshTimeoutRef.current);
    }

    realtimeRefreshTimeoutRef.current = window.setTimeout(() => {
      realtimeRefreshTimeoutRef.current = null;

      void refreshProjectsSilently();
    }, REALTIME_REFRESH_DELAY);
  }, [refreshProjectsSilently]);

  const getProjectById = useCallback(
    async (id: string): Promise<TProject> => {
      const existingProject = projects.find(
        (project) => project.id === id
      );

      if (existingProject) {
        return existingProject;
      }

      setLoading(true);

      try {
        const data = await projectService.getProjectById(id);

        setProjects((previousProjects) =>
          upsertProject(previousProjects, data)
        );

        return data;
      } catch (error: unknown) {
        logApiError(`Erro ao buscar projeto ${id}`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [projects]
  );

  const createProject = useCallback(
    async (
      payload: TCreateProjectDTO
    ): Promise<TProject> => {
      try {
        const newProject =
          await projectService.createProject(payload);

        setProjects((previousProjects) =>
          upsertProject(previousProjects, newProject)
        );

        return newProject;
      } catch (error: unknown) {
        logApiError("Erro ao criar projeto", error);
        throw error;
      }
    },
    []
  );

  const updateProject = useCallback(
    async (
      id: string,
      payload: TUpdateProjectDTO
    ): Promise<TProject> => {
      try {
        const updatedProject =
          await projectService.updateProject(id, payload);

        setProjects((previousProjects) =>
          upsertProject(previousProjects, updatedProject)
        );

        return updatedProject;
      } catch (error: unknown) {
        logApiError(`Erro ao atualizar projeto ${id}`, error);
        throw error;
      }
    },
    []
  );

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      try {
        await projectService.deleteProject(id);

        setProjects((previousProjects) =>
          previousProjects.filter(
            (project) => project.id !== id
          )
        );
      } catch (error: unknown) {
        logApiError(`Erro ao deletar projeto ${id}`, error);
        throw error;
      }
    },
    []
  );

  useEffect(() => {
    void fetchProjects().catch(() => undefined);
  }, [fetchProjects]);

  useEffect(() => {
    let realtimeChannel: RealtimeChannel | null = null;
    let channelIsStarting = false;
    let effectWasDisposed = false;

    const removeRealtimeChannel = async (): Promise<void> => {
      if (!realtimeChannel) return;

      const channelToRemove = realtimeChannel;

      realtimeChannel = null;

      await supabaseRealtimeClient.removeChannel(channelToRemove);
    };

    const startRealtimeChannel = async (
      session: Session
    ): Promise<void> => {
      /*
       * Como o cliente Realtime não persiste a sessão,
       * o JWT precisa ser informado manualmente.
       */
      await supabaseRealtimeClient.realtime.setAuth(
        session.access_token
      );

      if (
        effectWasDisposed ||
        realtimeChannel ||
        channelIsStarting
      ) {
        return;
      }

      channelIsStarting = true;

      try {
        realtimeChannel = supabaseRealtimeClient
          .channel(`projects:${session.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "projects",
            },
            scheduleRealtimeRefresh
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "project_users",
            },
            scheduleRealtimeRefresh
          )
          .subscribe((status, error) => {
            if (
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT"
            ) {
              console.error(
                "Erro no canal Realtime de projetos:",
                {
                  status,
                  error,
                }
              );
            }
          });
      } finally {
        channelIsStarting = false;
      }
    };

    const applyRealtimeSession = async (
      session: Session | null
    ): Promise<void> => {
      if (!session) {
        await removeRealtimeChannel();
        return;
      }

      /*
       * Atualiza o JWT mesmo que o canal já exista.
       * Isso mantém o Realtime funcionando após refresh do token.
       */
      await supabaseRealtimeClient.realtime.setAuth(
        session.access_token
      );

      if (!realtimeChannel) {
        await startRealtimeChannel(session);
      }
    };

    const initializeRealtime = async (): Promise<void> => {
      const {
        data: { session },
        error,
      } = await supabaseAuthClient.auth.getSession();

      if (error) {
        logApiError(
          "Erro ao obter sessão para o Realtime de projetos",
          error
        );
        return;
      }

      await applyRealtimeSession(session);
    };

    void initializeRealtime();

    const {
      data: { subscription: authSubscription },
    } = supabaseAuthClient.auth.onAuthStateChange(
      (_event, session) => {
        void applyRealtimeSession(session);
      }
    );

    return () => {
      effectWasDisposed = true;

      authSubscription.unsubscribe();

      if (realtimeRefreshTimeoutRef.current !== null) {
        window.clearTimeout(
          realtimeRefreshTimeoutRef.current
        );

        realtimeRefreshTimeoutRef.current = null;
      }

      if (realtimeChannel) {
        void supabaseRealtimeClient.removeChannel(
          realtimeChannel
        );

        realtimeChannel = null;
      }
    };
  }, [scheduleRealtimeRefresh]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        fetchProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};