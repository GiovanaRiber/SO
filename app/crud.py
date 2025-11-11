from sqlalchemy.orm import Session
from . import models, schemas


def get_alunos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Aluno).offset(skip).limit(limit).all()


def get_aluno(db: Session, aluno_id: int):
    return db.query(models.Aluno).filter(models.Aluno.id == aluno_id).first()


def create_aluno(db: Session, aluno: schemas.AlunoCreate):
    db_obj = models.Aluno(nome=aluno.nome, email=aluno.email, idade=aluno.idade)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
