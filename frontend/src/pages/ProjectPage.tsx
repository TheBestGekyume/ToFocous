import { useState } from "react";
import { ProjectList } from "../components/Projects/ProjectList";
import { ProjectForm } from "../components/Projects/ProjectForm";
import { Header } from "../components/Tasks/Header";

export const ProjectsPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Header />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projects</h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-accent hover:bg-purple-700 px-4 py-2 rounded-md font-semibold transition"
        >
          + Novo Projeto
        </button>
      </div>

      <ProjectList />

      {open && <ProjectForm onClose={() => setOpen(false)} />}
    </div>
  );
};
