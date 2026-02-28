from fastapi import FastAPI
from backend.routers import auth, settings, tasks, subtasks

app = FastAPI()

app.include_router(auth.router)
app.include_router(settings.router)
app.include_router(tasks.router)
app.include_router(subtasks.router)