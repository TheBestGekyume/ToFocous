from enum import Enum
from typing import Optional

from pydantic import BaseModel


class WhichDateUseInCalendar(str, Enum):
    UseStartDate = "UseStartDate"
    UseDueDate = "UseDueDate"
    UseBoth = "UseBoth"


class UpdtSettings(BaseModel):
    use_subtask_priority: Optional[bool] = None
    which_date_use_in_calendar: Optional[WhichDateUseInCalendar] = None
    use_time: Optional[bool] = None
    use_start_date: Optional[bool] = None


class SettingsResponse(BaseModel):
    use_subtask_priority: bool | None = None
    which_date_use_in_calendar: WhichDateUseInCalendar | None = None
    use_time: bool | None = None
    use_start_date: bool | None = None