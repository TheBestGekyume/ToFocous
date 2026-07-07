import { useState } from "react";
import { ProjectForm } from "../components/Projects/ProjectForm";
import { ProjectList } from "../components/Projects/ProjectList";
import { Header } from "../components/Projects/Header";
import type { TProject } from "../types/TProject";
import { Plus } from "lucide-react";
import { useProjects } from "../hooks/useProjects";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { Modal } from "../components/_Common/Modal";

export const ProjectsPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<TProject | null>(null);

  const { loading } = useProjects();

  const closeCreateModal = () => {
    setOpenCreate(false);
  };

  const closeEditModal = () => {
    setEditingProject(null);
  };

  return (
    <div>
      <LoadingOverlay show={loading} />
      <Header />

      <div className="px-10">
        <div className="flex items-end justify-center gap-2">
          <h1 className="text-2xl font-bold text-text">Projetos</h1>

          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="rounded-md bg-green-600 p-1 font-semibold transition hover:bg-green-800"
          >
            <Plus size={22} />
          </button>
        </div>

        <ProjectList onEdit={setEditingProject} />

        <Modal
          isOpen={openCreate}
          onClose={closeCreateModal}
          title="Novo Projeto"
          size="lg"
        >
          <ProjectForm mode="create" onClose={closeCreateModal} />
        </Modal>

        <Modal
          isOpen={!!editingProject}
          onClose={closeEditModal}
          title="Editar Projeto"
          size="lg"
        >
          {editingProject && (
            <ProjectForm
              mode="edit"
              project={editingProject}
              onClose={closeEditModal}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};
