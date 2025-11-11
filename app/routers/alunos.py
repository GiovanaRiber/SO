from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from .. import crud, schemas, models
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


@router.get("/clientes", response_model=List[schemas.ClienteRead])
def read_clientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_clientes(db, skip=skip, limit=limit)


@router.post("/clientes", response_model=schemas.ClienteRead, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente: schemas.ClienteCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Cliente).filter(models.Cliente.email == cliente.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud.create_cliente(db, cliente)


@router.get("/clientes/{cliente_id}", response_model=schemas.ClienteRead)
def get_cliente(cliente_id: int, db: Session = Depends(get_db)):
    obj = crud.get_cliente(db, cliente_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return obj


@router.patch("/clientes/{cliente_id}", response_model=schemas.ClienteRead)
def patch_cliente(cliente_id: int, cliente: schemas.ClienteUpdate, db: Session = Depends(get_db)):
    # if updating email, ensure uniqueness
    if cliente.email:
        conflict = db.query(models.Cliente).filter(models.Cliente.email == cliente.email, models.Cliente.id != cliente_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Email já cadastrado por outro cliente")
    updated = crud.update_cliente(db, cliente_id, cliente)
    if not updated:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return updated


@router.delete("/clientes/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(cliente_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_cliente(db, cliente_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return None


@router.get("/clientes/{cliente_id}/pets", response_model=List[schemas.PetRead])
def list_pets_by_cliente(cliente_id: int, db: Session = Depends(get_db)):
    cliente = crud.get_cliente(db, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return cliente.pets


@router.get("/pets", response_model=List[schemas.PetRead])
def read_pets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_pets(db, skip=skip, limit=limit)


@router.post("/pets", response_model=schemas.PetRead, status_code=status.HTTP_201_CREATED)
def create_pet(pet: schemas.PetCreate, db: Session = Depends(get_db)):
    # verify owner exists
    owner = crud.get_cliente(db, pet.cliente_id)
    if not owner:
        raise HTTPException(status_code=400, detail="Cliente (owner) não encontrado")
    return crud.create_pet(db, pet)


@router.get("/pets/{pet_id}", response_model=schemas.PetRead)
def get_pet(pet_id: int, db: Session = Depends(get_db)):
    obj = crud.get_pet(db, pet_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    return obj


@router.patch("/pets/{pet_id}", response_model=schemas.PetRead)
def patch_pet(pet_id: int, pet: schemas.PetUpdate, db: Session = Depends(get_db)):
    if pet.cliente_id:
        owner = crud.get_cliente(db, pet.cliente_id)
        if not owner:
            raise HTTPException(status_code=400, detail="Cliente (owner) não encontrado")
    updated = crud.update_pet(db, pet_id, pet)
    if not updated:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    return updated


@router.delete("/pets/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pet(pet_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_pet(db, pet_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Pet não encontrado")
    return None
