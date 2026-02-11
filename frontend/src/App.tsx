import "./App.css";

import { Routes, Route } from "react-router-dom";
import { TasksProvider } from "./contexts/TasksContext";
import { Home } from "./pages/Home";
import { Auth } from "./pages/Auth";
import { Settings } from "./pages/Settings";
// import { TaskDetails } from "./components/TaskDetails";

function App() {
  return (
    <div id="app" className="d-flex bg-background-task-section min-h-full">
      <TasksProvider>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/acesso" element={<Auth />} />
          <Route path="/configuracoes" element={<Settings />} />

          {/* <Route path="/task/:id" element={<TaskDetails />} /> */}
        </Routes>
      </TasksProvider>
    </div>
  );
}

export default App;
