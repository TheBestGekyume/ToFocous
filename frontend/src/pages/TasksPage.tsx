import { Header } from "../components/Tasks/Header";
import { Statistics } from "../components/Tasks/Statistics";
import { TaskList } from "../components/Tasks/TaskList";

export const TaskPage = () => {
  return (
    <div className="flex">
      <div className="w-full transition-all duration-300">
        <Header />
        <Statistics />
        <TaskList />
      </div>
    </div>
  );
};
