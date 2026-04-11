import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import { TasksProvider } from "./providers/TaskProvider";
import { TaskSettingsProvider } from "./providers/TaskSettingsProvider";

import { Auth } from "./pages/Auth";
import { TaskSettings } from "./pages/TaskSettings";
import { AppLayout } from "./AppLayout";
import { Profile } from "./pages/Profile";
import { Schedule } from "./pages/Schedule";
import { ProtectedRoute } from "./components/_Common/ProtectedRoute";

import { TaskPage } from "./pages/TasksPage"; // 🔥 você continua usando ele
import { SingleTaskPage } from "./pages/SingleTaskPage";

// opcional (lista de projetos)
import { ProjectsPage } from "./pages/ProjectPage";
import { ProjectsProvider } from "./providers/ProjectsProvider";

function App() {
  return (
    <div id="app" className="d-flex bg-background-task-section min-h-full">
      <Routes>
        <Route path="/acesso" element={<Auth />} />

        <Route
          element={
            <ProtectedRoute>
              <ProjectsProvider>
                <TasksProvider>
                  <TaskSettingsProvider>
                    <AppLayout />
                  </TaskSettingsProvider>
                </TasksProvider>
              </ProjectsProvider>
            </ProtectedRoute>
          }
        >
          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/projects" replace />} />

          {/* PROJECTS */}
          <Route path="/projects" element={<ProjectsPage />} />

          {/* 🔥 TASK PAGE AGORA DEPENDE DO PROJECT */}
          <Route path="/projects/:projectId" element={<TaskPage />} />

          {/* DETALHE DA TASK */}
          <Route
            path="/projects/:projectId/tasks/:taskId"
            element={<SingleTaskPage />}
          />

          {/* OUTROS */}
          <Route path="/configuracoes" element={<TaskSettings />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/agenda" element={<Schedule />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
