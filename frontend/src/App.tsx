import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { TasksProvider } from "./contexts/TasksContext";
import { TaskPage } from "./pages/TaskPage";
import { Auth } from "./pages/Auth";
import { Settings } from "./pages/Settings";
import { AppLayout } from "./AppLayout";
import { Profile } from "./pages/Profile";
import { Schedule } from "./pages/Schedule";

function App() {
  return (
    <div id="app" className="d-flex bg-background-task-section min-h-full">
      <TasksProvider>
        <Routes>
          <Route path="/acesso" element={<Auth />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/tarefas" replace />} />
            <Route path="/tarefas" element={<TaskPage />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/agenda" element={<Schedule />} />
          </Route>
        </Routes>
      </TasksProvider>
    </div>
  );
}

export default App;
