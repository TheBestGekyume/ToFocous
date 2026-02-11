import { CircleX, TextAlignJustify } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type SidebarProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const Sidebar = ({ open, setOpen }: SidebarProps) => {
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 p-2 rounded bg-black border hover:text-purple-500 duration-150"
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
        className={`
          fixed left-0 top-0 h-screen w-48 bg-zinc-950 border-r border-default
          transition-transform duration-300 z-50
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="hidden sm:flex justify-end mb-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded-ful  hover:text-purple-500 duration-150"
            >
              <CircleX />
            </button>
          </div>

          <ul className="space-y-1 text-sm">
            <li>
              <a
                href="#"
                className="block px-3 py-2 rounded-base hover:bg-neutral-tertiary"
              >
                Dashboard
              </a>
            </li>

            <li>
              <a
                href="#"
                className="flex px-3 py-2 rounded-base hover:bg-neutral-tertiary"
              >
                Kanban
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-neutral-secondary-medium border">
                  Pro
                </span>
              </a>
            </li>

            <li>
              <a
                href="#"
                className="flex px-3 py-2 rounded-base hover:bg-neutral-tertiary"
              >
                Inbox
                <span className="ml-auto text-xs w-5 h-5 flex items-center justify-center rounded-full bg-danger-soft">
                  2
                </span>
              </a>
            </li>

            <li>
              <a
                href="#"
                className="block px-3 py-2 rounded-base hover:bg-neutral-tertiary"
              >
                Users
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};
