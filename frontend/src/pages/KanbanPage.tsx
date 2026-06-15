import { KanbanBoard } from "../components/Kanban/KanbanBoard";
import { KanbanHeader } from "../components/Kanban/KanbanHeader";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { useKanban } from "../hooks/useKanban";

export const KanbanPage = () => {
  const {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,

    tasks,
    tasksByStatus,
    kanbanColumns,

    loading,
    updatingTaskId,

    updateTaskStatus,
  } = useKanban();

  return (
    <>
      <LoadingOverlay show={loading} />

      <section className="w-full mx-auto flex max-w-6xl flex-col px-4 py-8 gap-6">
        <KanbanHeader
          projects={projects}
          selectedProjectId={selectedProjectId}
          onChangeProject={setSelectedProjectId}
        />

        {projects.length === 0 && !loading && (
          <section className="rounded-2xl border border-secondary/20 bg-background-header p-6 text-center text-text/70">
            Nenhum projeto encontrado. Crie um projeto para usar o Kanban.
          </section>
        )}

        {selectedProject && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-text">
                {selectedProject.title}
              </h2>

              <p className="text-sm text-text/60">
                {tasks.length} tarefa{tasks.length !== 1 ? "s" : ""} neste
                projeto.
              </p>
            </div>

            <KanbanBoard
              columns={kanbanColumns}
              tasksByStatus={tasksByStatus}
              updatingTaskId={updatingTaskId}
              onUpdateTaskStatus={updateTaskStatus}
            />
          </section>
        )}
      </section>
    </>
  );
};
