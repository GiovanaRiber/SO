from sqlalchemy import Column, Integer, String
from .database import Base


class Aluno(Base):
    __tablename__ = "alunos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(128), nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    idade = Column(Integer, nullable=True)

    def __repr__(self):
        return f"<Aluno id={self.id} nome={self.nome} email={self.email}>"
