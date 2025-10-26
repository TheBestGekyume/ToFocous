import "./App.css";
import { Header } from "./components/Header";
import { Statistics } from "./components/Statistics";
import { Tasks } from "./components/Tasks";
import { TasksProvider } from "./contexts/TasksContext";

function App() {
    return (
        <div id="app" className="d-flex bg-slate-900 min-h-full">
            <TasksProvider>
                <Header />
                <Statistics />
                <Tasks />
            </TasksProvider>
        </div>
    );
}

export default App;
