import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { TasksProvider } from "./providers/TaskProvider";
import { TaskSettingsProvider } from "./providers/TaskSettingsProvider";
import { AuthPage } from "./pages/AuthPage";
import { TaskSettingsPage } from "./pages/TaskSettingsPage";
import { AppLayout } from "./AppLayout";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/_Common/ProtectedRoute";
import { TaskPage } from "./pages/TasksPage";
import { SubTasksPage } from "./pages/SubTasksPage";
import { ProjectsPage } from "./pages/ProjectPage";
import { ProjectsProvider } from "./providers/ProjectsProvider";
import { AgendaPage } from "./pages/AgendaPage";
import { health } from "./services/api/healthService";
import { AuthCallback } from "./pages/AuthCallback";

function App() {
  useEffect(() => {
    health().catch((err) => {
      console.error("Erro ao verificar API:", err);
    });
  }, []);

  return (
    <div id="app" className="d-flex bg-background-task-section min-h-full">
      <Routes>
        <Route path="/acesso" element={<AuthPage />} />
        <Route path="/acesso/callback" element={<AuthCallback />} />

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
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<TaskPage />} />
          <Route
            path="/projects/:projectId/tasks/:taskId"
            element={<SubTasksPage />}
          />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/configuracoes" element={<TaskSettingsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
