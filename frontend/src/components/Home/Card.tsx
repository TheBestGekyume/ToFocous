import type { TCard } from "../../types/TCard";

const colorMap = {
    zinc: "bg-zinc-600 border-zinc-300",
    amber: "bg-amber-600 border-amber-300",
    green: "bg-green-600 border-green-300",
};

export type ColorKey = keyof typeof colorMap;

export const Card = ({ title, color, number }: TCard) => {
    return (
        <div
            className={`flex gap-3 p-3
            border-2 rounded-xl 
        ${colorMap[color]}
        `}
        >
            <h4>{title}</h4>
            <p>{number}</p>
        </div>
    );
};
