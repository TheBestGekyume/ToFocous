from fastapi import FastAPI
from backend.routers import auth, project_users, settings, tasks, subtasks, project, usuarios, agenda, health
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tofocous.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
