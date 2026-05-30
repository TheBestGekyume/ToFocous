import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/_Common/Sidebar";
import { Footer } from "./components/_Common/Footer";

export const AppLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} setOpen={setOpen} />

      <div
        className={`
          flex min-h-screen w-full flex-col transition-all duration-300
          ${open ? "sm:ml-48" : "sm:ml-0"}
        `}
      >
        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};