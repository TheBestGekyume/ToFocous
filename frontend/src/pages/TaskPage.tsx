// import { useState } from "react";
// import { Sidebar } from "../components/_Common/Sidebar";
import { Header } from "../components/Tasks/Header";
import { Statistics } from "../components/Tasks/Statistics";
import { Tasks } from "../components/Tasks/Tasks";

export const TaskPage = () => {
  // const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      {/* <Sidebar open={open} setOpen={setOpen} /> */}

      <div
        // className={`
        //   w-full transition-all duration-300
        //   ${open ? "sm:ml-48" : "sm:ml-0"}
        // `}
        className="w-full transition-all duration-300"
      >
        <Header />
        <Statistics />
        <Tasks />
      </div>
    </div>
  );
};
