from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base

ORDER_STATUSES = ("pending", "approved", "rejected", "fulfilled", "cancelled")
PLACED_BY_ROLES = ("distributor", "salesperson", "retailer")


class Distributor(Base):
    __tablename__ = "distributors"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="distributor", cascade="all, delete-orphan")
    retailers = relationship("Retailer", back_populates="distributor", cascade="all, delete-orphan")
    salespersons = relationship("Salesperson", back_populates="distributor", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Float, default=0)
    unit = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    distributor = relationship("Distributor", back_populates="products")


class Retailer(Base):
    __tablename__ = "retailers"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    # Login credentials for the Retailer Portal (phase 4). Nullable: a
    # distributor can add a retailer without granting portal access.
    hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    distributor = relationship("Distributor", back_populates="retailers")


class Salesperson(Base):
    __tablename__ = "salespersons"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    region = Column(String, nullable=True)
    # Login credentials for the Salesperson App (phase 3). Nullable: a
    # distributor can add a salesperson without granting app access.
    hashed_password = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    distributor = relationship("Distributor", back_populates="salespersons")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False)
    retailer_id = Column(Integer, ForeignKey("retailers.id"), nullable=False)
    placed_by_role = Column(String, nullable=False)
    placed_by_id = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pending")
    rejection_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    distributor = relationship("Distributor")
    retailer = relationship("Retailer")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
