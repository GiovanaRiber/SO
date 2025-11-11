from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import alunos
import os

app = FastAPI(title="API Alunos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alunos.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "API Alunos"}
