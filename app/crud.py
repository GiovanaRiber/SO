from sqlalchemy.orm import Session
from . import models, schemas


def get_clientes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Cliente).offset(skip).limit(limit).all()


def get_cliente(db: Session, cliente_id: int):
    return db.query(models.Cliente).filter(models.Cliente.id == cliente_id).first()


def create_cliente(db: Session, cliente: schemas.ClienteCreate):
    db_obj = models.Cliente(nome=cliente.nome, email=cliente.email, telefone=cliente.telefone)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_pets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Pet).offset(skip).limit(limit).all()


def get_pet(db: Session, pet_id: int):
    return db.query(models.Pet).filter(models.Pet.id == pet_id).first()


def create_pet(db: Session, pet: schemas.PetCreate):
    db_obj = models.Pet(nome=pet.nome, especie=pet.especie, raca=pet.raca, idade=pet.idade, cliente_id=pet.cliente_id)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_cliente(db: Session, cliente_id: int, cliente_update: schemas.ClienteUpdate):
    db_obj = get_cliente(db, cliente_id)
    if not db_obj:
        return None
    for field, value in cliente_update.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_cliente(db: Session, cliente_id: int):
    db_obj = get_cliente(db, cliente_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


def update_pet(db: Session, pet_id: int, pet_update: schemas.PetUpdate):
    db_obj = get_pet(db, pet_id)
    if not db_obj:
        return None
    for field, value in pet_update.dict(exclude_unset=True).items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_pet(db: Session, pet_id: int):
    db_obj = get_pet(db, pet_id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True
