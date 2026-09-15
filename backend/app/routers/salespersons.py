from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_distributor, hash_password
from app.database import get_db
from app.models import Distributor, Salesperson
from app.schemas import SalespersonCreate, SalespersonOut, SalespersonUpdate

router = APIRouter(prefix="/api/salespersons", tags=["salespersons"])


def _to_out(salesperson: Salesperson) -> SalespersonOut:
    out = SalespersonOut.model_validate(salesperson)
    out.has_login = bool(salesperson.hashed_password)
    return out


@router.get("", response_model=list[SalespersonOut])
def list_salespersons(
    db: Session = Depends(get_db), current: Distributor = Depends(get_current_distributor)
):
    salespersons = (
        db.query(Salesperson)
        .filter(Salesperson.distributor_id == current.id)
        .order_by(Salesperson.created_at.desc())
        .all()
    )
    return [_to_out(s) for s in salespersons]


@router.post("", response_model=SalespersonOut, status_code=201)
def create_salesperson(
    payload: SalespersonCreate,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    data = payload.model_dump(exclude={"password"})
    salesperson = Salesperson(**data, distributor_id=current.id)
    if payload.password:
        salesperson.hashed_password = hash_password(payload.password)
    db.add(salesperson)
    db.commit()
    db.refresh(salesperson)
    return _to_out(salesperson)


def _get_owned_salesperson(salesperson_id: int, db: Session, current: Distributor) -> Salesperson:
    salesperson = (
        db.query(Salesperson)
        .filter(Salesperson.id == salesperson_id, Salesperson.distributor_id == current.id)
        .first()
    )
    if not salesperson:
        raise HTTPException(status_code=404, detail="Salesperson not found")
    return salesperson


@router.put("/{salesperson_id}", response_model=SalespersonOut)
def update_salesperson(
    salesperson_id: int,
    payload: SalespersonUpdate,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    salesperson = _get_owned_salesperson(salesperson_id, db, current)
    data = payload.model_dump(exclude={"password"})
    for field, value in data.items():
        setattr(salesperson, field, value)
    if payload.password:
        salesperson.hashed_password = hash_password(payload.password)
    db.commit()
    db.refresh(salesperson)
    return _to_out(salesperson)


@router.delete("/{salesperson_id}", status_code=204)
def delete_salesperson(
    salesperson_id: int,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    salesperson = _get_owned_salesperson(salesperson_id, db, current)
    db.delete(salesperson)
    db.commit()
