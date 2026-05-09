import { useEditableItem } from "./useEditableItem";
import { useProjects } from "./useProjects";
import type { TProject } from "../types/TProject";

export const useProjectItem = (project: TProject) => {
  const { updateProject, deleteProject } = useProjects();

  const editable = useEditableItem<TProject>({
    initialData: project,

    onUpdate: (updated) =>
      updateProject(project.id, {
        title: updated.title,
        description: updated.description,
        color: updated.color,
      }),

    onDelete: () => deleteProject(project.id),

    validate: (p) => !!p.title.trim(),

    hasChanged: (a, b) =>
      a.title !== b.title ||
      a.description !== b.description ||
      a.color !== b.color,
  });

  const changeColor = (color: string) =>
    editable.handleImmediateChange("color", color);

  return {
    ...editable,
    changeColor,
  };
};