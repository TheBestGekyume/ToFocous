from pydantic import BaseModel, EmailStr, Field


class UpdateUsuario(BaseModel):
    name: str


class UpdateSenha(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=6)
    confirm_new_password: str = Field(min_length=6)



class ResetSenha(BaseModel):
    email: EmailStr


class UpdateEmail(BaseModel):
    email: EmailStr