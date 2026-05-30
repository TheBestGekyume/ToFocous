import { CodeXml } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-secondary bg-background-header px-4 py-4 text-text mt-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
        <h5 className="flex flex-wrap items-center justify-start gap-1.5 text-sm font-normal">
          <CodeXml size={18} className="text-accent/80" />
          <span>Desenvolvido por</span>
          <a
            href="https://github.com/TheBestGekyume"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition hover:text-accent"
          >
            Gekyume
          </a>
          <span>e</span>
          <a
            href="https://github.com/Jojobms"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium transition hover:text-accent"
          >
            Jonathan
          </a>
        </h5>

        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            To<span className="text-accent">Focous</span>
          </p>

          <p className="text-xs text-text/70">
            Organização simples para projetos e tarefas do cotidiano.
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 text-sm md:items-end">
          <p className="text-sm text-text">
            © {currentYear} ToFocous. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};