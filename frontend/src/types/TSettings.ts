export type TWhichDateUseInCalendar =
  | "UseStartDate"
  | "UseDueDate"
  | "UseBoth";

export interface ITaskSettings {
  use_time: boolean;
  use_subtask_priority: boolean;
  use_start_date: boolean;
  which_date_use_in_calendar: TWhichDateUseInCalendar;
}