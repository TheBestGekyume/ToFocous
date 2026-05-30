import {
  CalendarDays,
  CircleX,
  Folder,
  LogOut,
  Settings,
  SquareKanban,
  TextAlignJustify,
  UserRound,
} from "lucide-react";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { LoadingDots } from "./LoadingDots";

type SidebarProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const { user, loading, fetchMyUser } = useUser();

  useEffect(() => {
    fetchMyUser();
  }, [fetchMyUser]);

  const logOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    navigate("/acesso", { replace: true });
  };

  const username = user?.name?.trim()
    ? user.name.trim().split(" ")[0]
    : "usuário";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 rounded-full border-2 bg-black p-2 duration-150 hover:text-purple-500"
      >
        <TextAlignJustify />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 sm:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-48 border-r border-default bg-zinc-950
        transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-3 pb-6 pt-4">
          <div className="relative mb-15 flex justify-end">
            <h4 className="font-hewitt-bold absolute left-1/2 -translate-x-1/2 text-4xl">
              T<span className="text-accent">F</span>
            </h4>

            <button
              onClick={() => setOpen(false)}
              className="hidden text-zinc-500 duration-150 hover:text-zinc-300 sm:flex"
            >
              <CircleX />
            </button>
          </div>

          <nav className="flex flex-col gap-5">
            <Link
              to="/projects"
              onClick={() => setOpen(false)}
              className="flex items-center duration-150 hover:text-purple-500"
            >
              <Folder />
              <span className="px-3">Projects</span>
            </Link>

            <Link
              to="/agenda"
              onClick={() => setOpen(false)}
              className="flex items-center duration-150 hover:text-purple-500"
            >
              <CalendarDays />
              <span className="px-3">Agenda</span>
            </Link>

            <Link
              to="/kanban"
              onClick={() => setOpen(false)}
              className="flex items-center duration-150 hover:text-purple-500"
            >
              <SquareKanban />
              <span className="px-3">Kanban</span>
            </Link>

            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center duration-150 hover:text-purple-500"
            >
              <UserRound />
              <span className="px-3">Perfil</span>
            </Link>

            <Link
              to="/configuracoes"
              onClick={() => setOpen(false)}
              className="flex items-center duration-150 hover:text-purple-500"
            >
              <Settings />
              <span className="px-3">Configurações</span>
            </Link>
          </nav>

          <div className="mt-auto">
            <p className="mb-4 border-t border-zinc-800 pt-4 text-md text-text">
              Olá,{" "}
              <span className="font-medium text-accent/90">
                {loading ? <LoadingDots /> : username}
              </span>
              !
            </p>

            <button
              onClick={logOut}
              className="flex items-center duration-150 hover:text-red-500"
            >
              <LogOut />
              <span className="px-3">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
