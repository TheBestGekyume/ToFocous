import { useState } from "react";
import { Sidebar } from "../components/_Common/Sidebar";
import { Header } from "../components/Home/Header";
import { Statistics } from "../components/Home/Statistics";
import { Tasks } from "../components/Home/Tasks";

export const Home = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      <Sidebar open={open} setOpen={setOpen} />

      <div
        className={`
          w-full transition-all duration-300
          ${open ? "sm:ml-48" : "sm:ml-0"}
        `}
      >
        <Header />
        <Statistics />
        <Tasks />
      </div>
    </div>
  );
};
