from pydantic import BaseModel
from typing import Optional
from enum import Enum

class WhichDateUseInCalendar(str, Enum):
    UseStartDate = "Usar Data de Início"
    UseDueDate = "Usar Data Limite"
    UseBoth = "Usar Ambas"

    
class UpdtSettings(BaseModel):
    use_subtask_time: Optional[bool] = None
    use_subtask_priority: Optional[bool] = None
    which_date_use_in_calendar: Optional[WhichDateUseInCalendar] = None


