import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { TasksProvider } from "./contexts/TasksContext";
import { TaskPage } from "./pages/TasksPage";
import { Auth } from "./pages/Auth";
import { TaskSettings } from "./pages/TaskSettings";
import { AppLayout } from "./AppLayout";
import { Profile } from "./pages/Profile";
import { Schedule } from "./pages/Schedule";
import { ProtectedRoute } from "./components/_Common/ProtectedRoute";
import { SingleTaskPage } from "./pages/SingleTaskPage";
import { TaskSettingsProvider } from "./providers/TaskSettingsProvider";

function App() {
  return (
    <div id="app" className="d-flex bg-background-task-section min-h-full">
      <Routes>
        <Route path="/acesso" element={<Auth />} />

        <Route
          element={
            <ProtectedRoute>
              <TasksProvider>
                <TaskSettingsProvider>
                  <AppLayout />
                </TaskSettingsProvider>
              </TasksProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/tarefas" replace />} />
          <Route path="/tarefas" element={<TaskPage />} />
          <Route path="/tarefa/:taskId" element={<SingleTaskPage />} />
          <Route path="/configuracoes" element={<TaskSettings />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/agenda" element={<Schedule />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
