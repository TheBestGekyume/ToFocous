type DeleteEntityName = "tarefa" | "subtarefa";

export const confirmDelete = (entityName: DeleteEntityName): boolean => {
  return window.confirm(
    `Essa ${entityName} será excluída permanentemente, deseja continuar?`
  );
};