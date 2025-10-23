import "./App.css";
import { Statistics } from "./components/Statistics";
import { Tasks } from "./components/Tasks";

function App() {
    return (
        <div id="app" className="d-flex bg-slate-950 min-h-full pt-5">
            <h1
                className="w-fit text-4xl p-3 mb-3 mx-auto bg-slate-800 rounded-xl
            hover:bg-slate-900 duration-150"
            >
                To<span className="text-purple-600">Focous</span>
            </h1>
            <Statistics />

            <Tasks/>
        </div>
    );
}

export default App;
