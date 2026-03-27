from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.retrieval import Retrieval


class RetrievalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, retrieval: Retrieval) -> Retrieval:
        self.db.add(retrieval)
        await self.db.flush()
        return retrieval

    async def get_by_id(self, retrieval_id: str) -> Retrieval | None:
        result = await self.db.execute(
            select(Retrieval).where(Retrieval.id == retrieval_id)
        )
        return result.scalar_one_or_none()

    async def get_by_deployment(self, deployment_id: str) -> list[Retrieval]:
        result = await self.db.execute(
            select(Retrieval).where(Retrieval.deployment_id == deployment_id)
        )
        return list(result.scalars().all())

    async def upsert(self, retrieval: Retrieval) -> Retrieval:
        existing = await self.get_by_id(retrieval.id)
        if existing:
            for col in Retrieval.__table__.columns:
                if col.name != "id":
                    setattr(existing, col.name, getattr(retrieval, col.name))
            await self.db.flush()
            return existing
        self.db.add(retrieval)
        await self.db.flush()
        return retrieval
