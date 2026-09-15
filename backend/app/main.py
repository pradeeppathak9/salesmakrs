from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, orders, products, retailers, salespersons

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Salesmakrs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(retailers.router)
app.include_router(salespersons.router)
app.include_router(orders.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
