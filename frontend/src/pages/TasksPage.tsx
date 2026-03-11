import { Header } from "../components/Tasks/Header";
import { Statistics } from "../components/Tasks/Statistics";
import { Tasks } from "../components/Tasks/Tasks";

export const TaskPage = () => {
  return (
    <div className="flex">
      <div className="w-full transition-all duration-300">
        <Header />
        <Statistics />
        <Tasks />
      </div>
    </div>
  );
};
