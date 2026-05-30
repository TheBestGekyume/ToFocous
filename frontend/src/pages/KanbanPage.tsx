import { KanbanBoard } from "../components/Kanban/KanbanBoard";
import { KanbanProjectSelect } from "../components/Kanban/KanbanProjectSelect";
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

      <main className="w-full px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-2xl border border-secondary/20 bg-background-header p-6 shadow-md md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text">Kanban</h1>

              <p className="mt-1 text-sm text-text/70">
                Organize as tarefas principais por status dentro de um projeto.
              </p>
            </div>

            {projects.length > 0 && (
              <KanbanProjectSelect
                projects={projects}
                selectedProjectId={selectedProjectId}
                onChangeProject={setSelectedProjectId}
              />
            )}
          </header>

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
        </div>
      </main>
    </>
  );
};