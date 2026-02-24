import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/_Common/Sidebar";

export const AppLayout = () => {
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
        <Outlet />
      </div>
    </div>
  );
};