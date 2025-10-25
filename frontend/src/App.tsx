import "./App.css";
import { Header } from "./components/Header";
import { Statistics } from "./components/Statistics";
import { Tasks } from "./components/Tasks";

function App() {
    return (
        <div id="app" className="d-flex bg-slate-900 min-h-full">
            <Header />
            <Statistics />
            <Tasks />
        </div>
    );
}

export default App;
