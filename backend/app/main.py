from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.fishing import router as fishing_router
from app.api.v1.sync import router as sync_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (dev mode)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(fishing_router, prefix="/api/v1")
app.include_router(sync_router, prefix="/api/v1")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": settings.version}
