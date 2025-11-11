from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import SessionLocal, init_db

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.on_event("startup")
def on_startup():
    # Ensure tables exist
    init_db()


@router.get("/alunos", response_model=List[schemas.AlunoRead])
def read_alunos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_alunos(db, skip=skip, limit=limit)


@router.post("/alunos", response_model=schemas.AlunoRead, status_code=status.HTTP_201_CREATED)
def create_aluno(aluno: schemas.AlunoCreate, db: Session = Depends(get_db)):
    existing = db.query(crud.models.Aluno).filter(crud.models.Aluno.email == aluno.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_aluno(db, aluno)
