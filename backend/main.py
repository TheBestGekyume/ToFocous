from fastapi import FastAPI, Request, HTTPException
from backend.routers import auth, project_users, settings, tasks, subtasks, project, usuarios, agenda, health, task_assignment
from fastapi.middleware.cors import CORSMiddleware

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from backend.core.excepcions import AppException
from backend.core.responses import failure


app = FastAPI()

origins = [
    "http://localhost:5173",
    "https://tofocous.netlify.app",
    "http://localhost:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    response = failure(
        message=exc.message,
        http_code=exc.http_code,
        error_code=exc.error_code,
    )

    return JSONResponse(
        status_code=exc.http_code,
        content=response.model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    message = exc.detail if isinstance(exc.detail, str) else "Erro na requisição."

    response = failure(
        message=message,
        http_code=exc.status_code,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=response.model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    response = failure(
        message="Dados inválidos.",
        http_code=422,
        error_code="VALIDATION_ERROR",
    )

    return JSONResponse(
        status_code=422,
        content=response.model_dump(),
    )


app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(tasks.router)
app.include_router(subtasks.router)
app.include_router(project.router)
app.include_router(project_users.router)
app.include_router(usuarios.router)
app.include_router(agenda.router)   
app.include_router(health.router)
app.include_router(task_assignment.router)