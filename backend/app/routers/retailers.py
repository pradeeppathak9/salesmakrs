from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import Principal, get_current_distributor, hash_password, require_roles
from app.database import get_db
from app.models import Distributor, Retailer
from app.schemas import RetailerCreate, RetailerOut, RetailerUpdate

router = APIRouter(prefix="/api/retailers", tags=["retailers"])


def _to_out(retailer: Retailer) -> RetailerOut:
    out = RetailerOut.model_validate(retailer)
    out.has_login = bool(retailer.hashed_password)
    return out


@router.get("", response_model=list[RetailerOut])
def list_retailers(
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_roles("distributor", "salesperson")),
):
    retailers = (
        db.query(Retailer)
        .filter(Retailer.distributor_id == principal.distributor_id)
        .order_by(Retailer.created_at.desc())
        .all()
    )
    return [_to_out(r) for r in retailers]


@router.post("", response_model=RetailerOut, status_code=201)
def create_retailer(
    payload: RetailerCreate,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    data = payload.model_dump(exclude={"password"})
    retailer = Retailer(**data, distributor_id=current.id)
    if payload.password:
        retailer.hashed_password = hash_password(payload.password)
    db.add(retailer)
    db.commit()
    db.refresh(retailer)
    return _to_out(retailer)


def _get_owned_retailer(retailer_id: int, db: Session, current: Distributor) -> Retailer:
    retailer = (
        db.query(Retailer)
        .filter(Retailer.id == retailer_id, Retailer.distributor_id == current.id)
        .first()
    )
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
    return retailer


@router.put("/{retailer_id}", response_model=RetailerOut)
def update_retailer(
    retailer_id: int,
    payload: RetailerUpdate,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    retailer = _get_owned_retailer(retailer_id, db, current)
    data = payload.model_dump(exclude={"password"})
    for field, value in data.items():
        setattr(retailer, field, value)
    if payload.password:
        retailer.hashed_password = hash_password(payload.password)
    db.commit()
    db.refresh(retailer)
    return _to_out(retailer)


@router.delete("/{retailer_id}", status_code=204)
def delete_retailer(
    retailer_id: int,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    retailer = _get_owned_retailer(retailer_id, db, current)
    db.delete(retailer)
    db.commit()
