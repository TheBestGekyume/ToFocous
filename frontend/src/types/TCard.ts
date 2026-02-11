import type { JSX } from "react";
import type { ColorKey } from "../components/Home/Card";

export type TCard = {
    title: string;
    count: number;
    icon: JSX.Element;
    colorTheme: ColorKey
};
