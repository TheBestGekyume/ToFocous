import { useState } from "react";
import { Card } from "./Card";

export const Statistics = () => {
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
        <section>
            <h2 className="text-center text-lg">{displayedDate}</h2>
            <div className="@container">
                <div className="flex justify-center gap-5 p-5">
                    <Card title={"Total"} color={"zinc"} number={3} />
                    <Card title={"Pendentes"} color={"orange"} number={3} />
                    <Card title={"Concluídas"} color={"green"} number={3} />
                </div>
            </div>
        </section>
    );
};
