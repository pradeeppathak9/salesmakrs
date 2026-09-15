from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import (
    Principal,
    create_access_token,
    get_current_distributor,
    hash_password,
    require_roles,
    verify_password,
)
from app.database import get_db
from app.models import Distributor, Retailer, Salesperson
from app.schemas import (
    DistributorLogin,
    DistributorOut,
    DistributorSignup,
    RetailerLogin,
    RetailerOut,
    RetailerToken,
    SalespersonLogin,
    SalespersonOut,
    SalespersonToken,
    Token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(payload: DistributorSignup, db: Session = Depends(get_db)):
    existing = db.query(Distributor).filter(Distributor.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    distributor = Distributor(
        company_name=payload.company_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(distributor)
    db.commit()
    db.refresh(distributor)

    token = create_access_token({"sub": str(distributor.id), "role": "distributor"})
    return Token(access_token=token, distributor=DistributorOut.model_validate(distributor))


@router.post("/login", response_model=Token)
def login(payload: DistributorLogin, db: Session = Depends(get_db)):
    distributor = db.query(Distributor).filter(Distributor.email == payload.email).first()
    if not distributor or not verify_password(payload.password, distributor.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(distributor.id), "role": "distributor"})
    return Token(access_token=token, distributor=DistributorOut.model_validate(distributor))


@router.get("/me", response_model=DistributorOut)
def me(current: Distributor = Depends(get_current_distributor)):
    return current


@router.post("/salesperson/login", response_model=SalespersonToken)
def salesperson_login(payload: SalespersonLogin, db: Session = Depends(get_db)):
    salesperson = db.query(Salesperson).filter(Salesperson.email == payload.email).first()
    if (
        not salesperson
        or not salesperson.hashed_password
        or not verify_password(payload.password, salesperson.hashed_password)
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {
            "sub": str(salesperson.id),
            "role": "salesperson",
            "distributor_id": str(salesperson.distributor_id),
        }
    )
    out = SalespersonOut.model_validate(salesperson)
    out.has_login = True
    return SalespersonToken(access_token=token, salesperson=out)


@router.get("/salesperson/me", response_model=SalespersonOut)
def salesperson_me(
    principal: Principal = Depends(require_roles("salesperson")), db: Session = Depends(get_db)
):
    salesperson = db.query(Salesperson).filter(Salesperson.id == principal.id).first()
    if not salesperson:
        raise HTTPException(status_code=404, detail="Salesperson not found")
    out = SalespersonOut.model_validate(salesperson)
    out.has_login = True
    return out


@router.post("/retailer/login", response_model=RetailerToken)
def retailer_login(payload: RetailerLogin, db: Session = Depends(get_db)):
    retailer = db.query(Retailer).filter(Retailer.email == payload.email).first()
    if (
        not retailer
        or not retailer.hashed_password
        or not verify_password(payload.password, retailer.hashed_password)
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(
        {
            "sub": str(retailer.id),
            "role": "retailer",
            "distributor_id": str(retailer.distributor_id),
        }
    )
    out = RetailerOut.model_validate(retailer)
    out.has_login = True
    return RetailerToken(access_token=token, retailer=out)


@router.get("/retailer/me", response_model=RetailerOut)
def retailer_me(
    principal: Principal = Depends(require_roles("retailer")), db: Session = Depends(get_db)
):
    retailer = db.query(Retailer).filter(Retailer.id == principal.id).first()
    if not retailer:
        raise HTTPException(status_code=404, detail="Retailer not found")
    out = RetailerOut.model_validate(retailer)
    out.has_login = True
    return out
