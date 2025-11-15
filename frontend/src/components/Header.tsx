import { useState } from "react";
// import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
    const [currentDate] = useState(new Date());

    const formatedDate = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(currentDate);

    const displayedDate = formatedDate
        .split(" ")
        .map((palavra, i) =>
            i === 2 || i === 4
                ? palavra.toLowerCase()
                : palavra.charAt(0).toUpperCase() + palavra.slice(1)
        )
        .join(" ");

    return (
        <header
            id="header"
            className="bg-background-header text-text py-5 px-8 relative flex flex-col items-center"
        >
            <div className="absolute top-5 right-8">{/* <ThemeToggle /> */}</div>

            <h1
                className="w-fit text-4xl p-3 mb-3 bg-secondary rounded-xl
                hover:bg-primary duration-150 cursor-default"
            >
                To<span className="text-accent">Focous</span>
            </h1>

            <h2 className="text-center text-xl font-semibold">{displayedDate}</h2>
        </header>
    );
};
