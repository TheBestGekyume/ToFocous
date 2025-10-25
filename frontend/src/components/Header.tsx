import { Statistics } from "./Statistics"

export const Header = () => {
    return (
        <header id="header">
                <h1
                    className="w-fit text-4xl p-3 mb-3 mx-auto bg-slate-800 rounded-xl
            hover:bg-slate-900 duration-150"
                >
                    To<span className="text-purple-600">Focous</span>
                </h1>
                <Statistics />
            </header>
    )
}