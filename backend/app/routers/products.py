from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import Principal, get_current_distributor, require_roles
from app.database import get_db
from app.models import Distributor, Product
from app.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    db: Session = Depends(get_db),
    principal: Principal = Depends(require_roles("distributor", "salesperson", "retailer")),
):
    return (
        db.query(Product)
        .filter(Product.distributor_id == principal.distributor_id)
        .order_by(Product.created_at.desc())
        .all()
    )


@router.post("", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    product = Product(**payload.model_dump(), distributor_id=current.id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def _get_owned_product(product_id: int, db: Session, current: Distributor) -> Product:
    product = (
        db.query(Product)
        .filter(Product.id == product_id, Product.distributor_id == current.id)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    product = _get_owned_product(product_id, db, current)
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    product = _get_owned_product(product_id, db, current)
    db.delete(product)
    db.commit()
