import { useState } from "react";

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
        <header id="header" className="bg-slate-950 py-5">
            <h1
                className="w-fit text-4xl p-3 mb-3 mx-auto bg-slate-800 rounded-xl
            hover:bg-slate-900 duration-150"
            >
                To<span className="text-purple-600">Focous</span>
            </h1>

            <h2 className="text-center text-xl font-semibold">
                {displayedDate}
            </h2>
        </header>
    );
};
