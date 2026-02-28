from pydantic import BaseModel
from typing import Optional


class UpdtSettings(BaseModel):
    use_subtask_time: Optional[bool] = None
    use_subtask_priority: Optional[bool] = None