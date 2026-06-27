from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    content: T | None = None
    http_code: int
    message: str
    error_code: str | None = None


def success(content: T = None, message: str = "Sucesso."):
    return ApiResponse(
        content=content,
        http_code=200,
        message=message,
    )


def created(content: T = None, message: str = "Criado com sucesso."):
    return ApiResponse(
        content=content,
        http_code=201,
        message=message,
    )


def accepted(content: T = None, message: str = "Solicitação aceita."):
    return ApiResponse(
        content=content,
        http_code=202,
        message=message,
    )


def no_content(message: str = "Operação realizada com sucesso."):
    return ApiResponse(
        http_code=204,
        message=message,
    )


def failure(message: str, http_code: int, error_code: str | None = None):
    return ApiResponse(
        http_code=http_code,
        message=message,
        error_code=error_code,
    )