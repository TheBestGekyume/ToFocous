import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
    const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

    useEffect(() => {
        const root = document.documentElement;
        if (dark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [dark]);

    return (
        <button
            onClick={() => setDark(!dark)}
            className="bg-primary text-background px-4 py-2 rounded-md font-medium hover:opacity-90 transition"
        >
            {dark ? <Sun /> : <Moon />}
        </button>
    );
};
