from pydantic import BaseModel, EmailStr
from typing import Optional


class AlunoBase(BaseModel):
    nome: str
    email: EmailStr
    idade: Optional[int] = None


class AlunoCreate(AlunoBase):
    pass


class AlunoRead(AlunoBase):
    id: int

    class Config:
        orm_mode = True
