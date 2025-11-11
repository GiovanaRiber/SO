# Backend (FastAPI) for Alunos

Este backend fornece endpoints para criar e listar alunos, usando FastAPI + SQLAlchemy e PostgreSQL.

Pré-requisitos:
- Docker (para rodar o PostgreSQL)
- Python 3.9+

1) Rodar PostgreSQL em container Docker

```powershell
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres --name so-postgres postgres
```

2) Ajustar `DATABASE_URL` (opcional)
- O backend usa por padrão: `postgresql://postgres:postgres@localhost:5432/postgres`.
- Você pode criar um arquivo `.env` baseado em `.env.example` ou exportar a variável de ambiente `DATABASE_URL`.

3) Instalar dependências e rodar

```powershell
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

Endpoints principais:
- GET /alunos -> lista alunos
- POST /alunos -> cria um aluno (JSON: nome, email, idade)

Observações:
- Certifique-se de que o container PostgreSQL esteja rodando antes de iniciar o FastAPI.
- O código cria as tabelas automaticamente (chama `Base.metadata.create_all`).
