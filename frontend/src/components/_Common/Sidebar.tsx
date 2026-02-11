import {
  CalendarDays,
  CircleX,
  LogOut,
  Settings,
  TextAlignJustify,
  UserRound,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";

type SidebarProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 p-2 rounded-full bg-black border-2 hover:text-purple-500 duration-150"
      >
        <TextAlignJustify />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-48 bg-zinc-950 border-r border-default
    transition-transform duration-300 z-50 ${open ? "translate-x-0" : "-translate-x-full"} `}
      >
        <div className="flex flex-col h-full px-3 pt-4 pb-6">
          <div className="flex justify-end relative mb-15">
            <h4 className="text-4xl font-bold absolute left-1/2 -translate-x-1/2">
              T<span className="text-accent">F</span>
            </h4>

            <button
              onClick={() => setOpen(false)}
              className="hidden sm:flex hover:text-purple-500 duration-150"
            >
              <CircleX />
            </button>
          </div>

          {/* MENU */}
          <nav className="flex flex-col gap-5">
            <Link
              to="/agenda"
              className="flex items-center hover:text-purple-500 duration-150"
            >
              <CalendarDays />
              <span className="px-3">Agenda</span>
            </Link>

            <Link
              to="/perfil"
              className="flex items-center hover:text-purple-500 duration-150"
            >
              <UserRound />
              <span className="px-3">Perfil</span>
            </Link>

            <Link
              to="/configuracoes"
              className="flex items-center hover:text-purple-500 duration-150"
            >
              <Settings />
              <span className="px-3">Configurações</span>
            </Link>
          </nav>

          {/* FOOTER / LOGOUT */}
          <button className="mt-auto flex items-center hover:text-red-500 duration-150">
            <LogOut />
            <span className="px-3">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
