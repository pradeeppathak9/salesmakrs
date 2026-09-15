from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth import Principal, get_current_distributor, require_roles
from app.database import get_db
from app.models import Distributor, Order, OrderItem, Product, Retailer, Salesperson
from app.schemas import OrderCreate, OrderOut, OrderReject

router = APIRouter(prefix="/api/orders", tags=["orders"])

ANY_ROLE = require_roles("distributor", "salesperson", "retailer")


def _placed_by_name(db: Session, role: str, principal_id: int) -> str:
    if role == "distributor":
        row = db.query(Distributor).filter(Distributor.id == principal_id).first()
        return row.company_name if row else "Unknown"
    if role == "salesperson":
        row = db.query(Salesperson).filter(Salesperson.id == principal_id).first()
        return row.name if row else "Unknown"
    row = db.query(Retailer).filter(Retailer.id == principal_id).first()
    return row.name if row else "Unknown"


def _to_out(db: Session, order: Order) -> OrderOut:
    total = sum(item.quantity * item.unit_price for item in order.items)
    return OrderOut(
        id=order.id,
        retailer_id=order.retailer_id,
        retailer_name=order.retailer.name,
        placed_by_role=order.placed_by_role,
        placed_by_id=order.placed_by_id,
        placed_by_name=_placed_by_name(db, order.placed_by_role, order.placed_by_id),
        status=order.status,
        rejection_reason=order.rejection_reason,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=list(order.items),
        total=total,
    )


def _load_order(db: Session, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.retailer))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def _assert_visible(order: Order, principal: Principal) -> None:
    if order.distributor_id != principal.distributor_id:
        raise HTTPException(status_code=404, detail="Order not found")
    if principal.role == "salesperson" and not (
        order.placed_by_role == "salesperson" and order.placed_by_id == principal.id
    ):
        raise HTTPException(status_code=404, detail="Order not found")
    if principal.role == "retailer" and order.retailer_id != principal.id:
        raise HTTPException(status_code=404, detail="Order not found")


@router.post("", response_model=OrderOut, status_code=201)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    principal: Principal = Depends(ANY_ROLE),
):
    if principal.role == "retailer":
        retailer_id = principal.id
    else:
        if not payload.retailer_id:
            raise HTTPException(status_code=422, detail="retailer_id is required")
        retailer_id = payload.retailer_id

    retailer = (
        db.query(Retailer)
        .filter(Retailer.id == retailer_id, Retailer.distributor_id == principal.distributor_id)
        .first()
    )
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")

    product_ids = [item.product_id for item in payload.items]
    products = {
        p.id: p
        for p in db.query(Product)
        .filter(Product.id.in_(product_ids), Product.distributor_id == principal.distributor_id)
        .all()
    }
    missing = set(product_ids) - set(products)
    if missing:
        raise HTTPException(status_code=404, detail=f"Product(s) not found: {sorted(missing)}")

    status_value = "approved" if principal.role == "distributor" else "pending"

    order = Order(
        distributor_id=principal.distributor_id,
        retailer_id=retailer_id,
        placed_by_role=principal.role,
        placed_by_id=principal.id,
        status=status_value,
    )
    for item in payload.items:
        product = products[item.product_id]
        order.items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=product.price,
            )
        )

    db.add(order)
    db.commit()
    order = _load_order(db, order.id)
    return _to_out(db, order)


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), principal: Principal = Depends(ANY_ROLE)):
    query = db.query(Order).options(joinedload(Order.items), joinedload(Order.retailer)).filter(
        Order.distributor_id == principal.distributor_id
    )
    if principal.role == "salesperson":
        query = query.filter(Order.placed_by_role == "salesperson", Order.placed_by_id == principal.id)
    elif principal.role == "retailer":
        query = query.filter(Order.retailer_id == principal.id)

    orders = query.order_by(Order.created_at.desc()).all()
    return [_to_out(db, o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int, db: Session = Depends(get_db), principal: Principal = Depends(ANY_ROLE)
):
    order = _load_order(db, order_id)
    _assert_visible(order, principal)
    return _to_out(db, order)


@router.patch("/{order_id}/approve", response_model=OrderOut)
def approve_order(
    order_id: int, db: Session = Depends(get_db), current: Distributor = Depends(get_current_distributor)
):
    order = _load_order(db, order_id)
    if order.distributor_id != current.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be approved")
    order.status = "approved"
    db.commit()
    order = _load_order(db, order_id)
    return _to_out(db, order)


@router.patch("/{order_id}/reject", response_model=OrderOut)
def reject_order(
    order_id: int,
    payload: OrderReject,
    db: Session = Depends(get_db),
    current: Distributor = Depends(get_current_distributor),
):
    order = _load_order(db, order_id)
    if order.distributor_id != current.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending orders can be rejected")
    order.status = "rejected"
    order.rejection_reason = payload.reason
    db.commit()
    order = _load_order(db, order_id)
    return _to_out(db, order)


@router.patch("/{order_id}/fulfill", response_model=OrderOut)
def fulfill_order(
    order_id: int, db: Session = Depends(get_db), current: Distributor = Depends(get_current_distributor)
):
    order = _load_order(db, order_id)
    if order.distributor_id != current.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "approved":
        raise HTTPException(status_code=400, detail="Only approved orders can be fulfilled")
    order.status = "fulfilled"
    db.commit()
    order = _load_order(db, order_id)
    return _to_out(db, order)


@router.patch("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int, db: Session = Depends(get_db), principal: Principal = Depends(ANY_ROLE)
):
    order = _load_order(db, order_id)
    _assert_visible(order, principal)

    if principal.role == "distributor":
        if order.status not in ("pending", "approved"):
            raise HTTPException(status_code=400, detail="Order can no longer be cancelled")
    else:
        is_owner = order.placed_by_role == principal.role and order.placed_by_id == principal.id
        if not is_owner or order.status != "pending":
            raise HTTPException(status_code=400, detail="Order can no longer be cancelled")

    order.status = "cancelled"
    db.commit()
    order = _load_order(db, order_id)
    return _to_out(db, order)
