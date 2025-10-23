// import type { TTask } from "../types/Ttask";

export const Form = () => {
    return (
        <form className="flex justify-around border-1  py-5 rounded-md">
            <input
                className="rounded-md bg-zinc-700 p-1"
                type="text"
                placeholder="Adicionar nova tarefa..."
            />

            <select className="rounded-md bg-zinc-700 p-1" name="Prioridade">
                <option className="text-zinc-600" selected>
                    Selecione a Prioridade
                </option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
            </select>

            <input type="date" className="rounded-md bg-zinc-700 p-1" />

            <button className="bg-green-700 p-2 rounded-md duration-150 hover:bg-green-800">
                + Adicionar
            </button>
        </form>
    );
};
