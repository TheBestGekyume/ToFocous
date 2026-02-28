from pydantic import BaseModel, EmailStr


class LoginData(BaseModel):
    email: str
    password: str


class SignUpData(BaseModel):
    email: EmailStr
    password: str