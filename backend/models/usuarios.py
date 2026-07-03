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


class UsuarioResponse(BaseModel):
    id: str
    name: str
    email: str | None = None
    created_at: str | None = None
    has_google_auth: bool
    has_password: bool



class UpdateUsuarioResponse(BaseModel):
    id: str
    name: str
    email: str | None = None


class EmailChangeRequestResponse(BaseModel):
    new_email: str
    should_unlink_google_after_confirmation: bool
    should_finalize_after_redirect: bool


class GoogleIdentityResultResponse(BaseModel):
    google_unlinked: bool
    reason: str


class FinalizeEmailChangeResponse(BaseModel):
    email_change_finalized: bool
    should_logout: bool
    google_identity: GoogleIdentityResultResponse | None = None
    current_email: str | None = None
    expected_email: str | None = None