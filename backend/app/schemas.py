from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, field_validator


# ---- Auth ----

class DistributorSignup(BaseModel):
    company_name: str
    email: EmailStr
    password: str


class DistributorLogin(BaseModel):
    email: EmailStr
    password: str


class DistributorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    distributor: DistributorOut


class SalespersonLogin(BaseModel):
    email: EmailStr
    password: str


class RetailerLogin(BaseModel):
    email: EmailStr
    password: str


# ---- Product ----

class ProductBase(BaseModel):
    name: str
    sku: Optional[str] = None
    category: Optional[str] = None
    price: float = 0
    unit: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


# ---- Retailer ----

class RetailerBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None


class RetailerCreate(RetailerBase):
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: Optional[str]) -> Optional[str]:
        if value and len(value) < 6:
            raise ValueError("Password must be at least 6 characters")
        return value or None


class RetailerUpdate(RetailerCreate):
    pass


class RetailerOut(RetailerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    has_login: bool = False


# ---- Salesperson ----

class SalespersonBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    region: Optional[str] = None


class SalespersonCreate(SalespersonBase):
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, value: Optional[str]) -> Optional[str]:
        if value and len(value) < 6:
            raise ValueError("Password must be at least 6 characters")
        return value or None


class SalespersonUpdate(SalespersonCreate):
    pass


class SalespersonOut(SalespersonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    has_login: bool = False


class SalespersonToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    salesperson: SalespersonOut


class RetailerToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    retailer: RetailerOut


# ---- Order ----

class OrderItemIn(BaseModel):
    product_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, value: int) -> int:
        if value < 1:
            raise ValueError("Quantity must be at least 1")
        return value


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    retailer_id: Optional[int] = None
    items: list[OrderItemIn]

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, value: list[OrderItemIn]) -> list[OrderItemIn]:
        if not value:
            raise ValueError("An order needs at least one line item")
        return value


class OrderReject(BaseModel):
    reason: Optional[str] = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    retailer_id: int
    retailer_name: str
    placed_by_role: str
    placed_by_id: int
    placed_by_name: str
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut]
    total: float
