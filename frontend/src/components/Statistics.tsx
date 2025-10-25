import { ClipboardCheck, ClipboardClock, NotepadText } from "lucide-react";
// import { Card } from "./Card";

export const Statistics = () => {
    const AllTaskInfo = () => (
        <div className="flex flex-1 items-center justify-between gap-5 p-3 border-2 rounded-xl bg-zinc-600 border-zinc-300">
            <div>
                <h4>Total</h4>
                <p>3</p>
            </div>
            <ClipboardClock />
        </div>
    );

    const PendingTaskInfo = () => (
        <div className="flex flex-1 items-center justify-between gap-5 p-3 border-2 rounded-xl bg-amber-600 border-amber-300">
            <div>
                <h4>Pendentes</h4>
                <p>3</p>
            </div>
            <NotepadText />
        </div>
    );

    const ConcludedTaskInfo = () => (
        <div className="flex flex-1 items-center justify-between p-3 border-2 rounded-xl bg-green-600 border-green-300">
            <div>
                <h4>Concluídas</h4>
                <p>3</p>
            </div>
            <ClipboardCheck />
        </div>
    );

    return (
        <section className="max-w-1/2 mx-auto">
            <div className="flex flex-wrap justify-center gap-5 p-5">
                <AllTaskInfo />
                <PendingTaskInfo />
                <ConcludedTaskInfo/>
            </div>
        </section>
    );
};
