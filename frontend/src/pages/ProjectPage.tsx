import { useState } from "react";
import { ProjectForm } from "../components/Projects/ProjectForm";
import { ProjectList } from "../components/Projects/ProjectList";
import { Header } from "../components/Tasks/Header";
import type { TProject } from "../types/TProject";
import { Plus } from "lucide-react";

export const ProjectsPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<TProject | null>(null);
  return (
    <div>
      <Header />

      <div className="px-10">
        <div className="flex items-end justify-center mt-5 gap-2">
          <h1 className="text-2xl font-bold text-white">Projetos</h1>

          <button
            onClick={() => setOpenCreate(true)}
            className="bg-accent hover:bg-purple-700 p-1 rounded-md font-semibold transition"
          >
            <Plus size={22} />
          </button>
        </div>

        <ProjectList onEdit={setEditingProject} />

        {openCreate && (
          <ProjectForm mode="create" onClose={() => setOpenCreate(false)} />
        )}

        {editingProject && (
          <ProjectForm
            mode="edit"
            project={editingProject}
            onClose={() => setEditingProject(null)}
          />
        )}
      </div>
    </div>
  );
};
