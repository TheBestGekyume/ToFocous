from pydantic import BaseModel


class UpdateUsuario(BaseModel):
    name: str