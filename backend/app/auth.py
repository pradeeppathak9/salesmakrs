from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Distributor

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ROLES = ("distributor", "salesperson", "retailer")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def get_current_distributor(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Distributor:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("role") != "distributor":
            raise credentials_exception
        distributor_id = payload.get("sub")
        if distributor_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    distributor = db.query(Distributor).filter(Distributor.id == int(distributor_id)).first()
    if distributor is None:
        raise credentials_exception
    return distributor


class Principal(BaseModel):
    """Whoever is authenticated: a distributor, salesperson, or retailer,
    always scoped to a single distributor tenant."""

    role: str
    id: int
    distributor_id: int


def get_current_principal(token: str = Depends(oauth2_scheme)) -> Principal:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        role = payload.get("role")
        sub = payload.get("sub")
        if role not in ROLES or sub is None:
            raise credentials_exception
        principal_id = int(sub)
        distributor_id = int(payload["distributor_id"]) if role != "distributor" else principal_id
    except (JWTError, KeyError, ValueError):
        raise credentials_exception

    return Principal(role=role, id=principal_id, distributor_id=distributor_id)


def require_roles(*roles: str):
    def dependency(principal: Principal = Depends(get_current_principal)) -> Principal:
        if principal.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        return principal

    return dependency
