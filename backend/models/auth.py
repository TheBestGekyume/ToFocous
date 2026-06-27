from pydantic import BaseModel, EmailStr


class LoginData(BaseModel):
    email: str
    password: str


class SignUpData(BaseModel):
    email: EmailStr
    password: str
    name: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str


class MessageResponse(BaseModel):
    message: str