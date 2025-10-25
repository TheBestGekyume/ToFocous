import "./App.css";
import { Header } from "./components/Header";
// import { Statistics } from "./components/Statistics";
import { Tasks } from "./components/Tasks";

function App() {
    return (
        <div id="app" className="d-flex bg-slate-950 min-h-full pt-5">
            <Header/>
            <Tasks />
        </div>
    );
}

export default App;
