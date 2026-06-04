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
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { KanbanPage } from "./pages/KanbanPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

function App() {
  useEffect(() => {
  const alreadyCheckedApi = sessionStorage.getItem("api_health_checked");

  if (alreadyCheckedApi) return;

  health()
    .then(() => {
      sessionStorage.setItem("api_health_checked", "true");
    })
    .catch((err) => {
      console.error("Erro ao verificar API:", err);
    });
}, []);

  return (
    <div id="app" className="d-flex bg-background-task-section min-h-full">
      <Routes>
        <Route path="/acesso" element={<AuthPage />} />
        <Route path="/acesso/callback" element={<AuthCallbackPage />} />

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
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
