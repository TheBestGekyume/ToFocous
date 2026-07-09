import { useEditableItem } from "./useEditableItem";
import { useProjects } from "./useProjects";
import type { TProject } from "../types/TProject";

export const useProjectItem = (project: TProject) => {
  const { updateProject, deleteProject } = useProjects();

  const editable = useEditableItem<TProject>({
    initialData: project,

    onUpdate: async (updated) => {
      await updateProject(project.id, {
        title: updated.title,
        description: updated.description,
        color: updated.color,
      });
    },

    onDelete: async () => {
      await deleteProject(project.id);
    },

    validate: (currentProject) =>
      currentProject.title.trim()
        ? null
        : "O título do projeto é obrigatório.",

    hasChanged: (currentProject, previousProject) =>
      currentProject.title !== previousProject.title ||
      currentProject.description !== previousProject.description ||
      currentProject.color !== previousProject.color,
  });

  const changeColor = (color: string) => {
    editable.handleImmediateChange("color", color);
  };

  return {
    ...editable,
    changeColor,
  };
};