import type { TCard } from "../../types/TCard";

const colorMap = {
  zinc: "bg-zinc-600 border-zinc-300",
  amber: "bg-amber-600 border-amber-300",
  green: "bg-green-600 border-green-300",
};

export type ColorKey = keyof typeof colorMap;

export const Card = ({ title, count, icon, colorTheme }: TCard) => (
  <div
    className={`flex flex-1 items-center justify-between gap-5 p-3 border-2 rounded-xl ${colorMap[colorTheme]}`}
  >
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="text-xl font-bold text-white">{count}</p>
    </div>
    {icon}
  </div>
);
