from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.deployment import Deployment


class DeploymentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, deployment: Deployment) -> Deployment:
        self.db.add(deployment)
        await self.db.flush()
        return deployment

    async def get_by_id(self, deployment_id: str) -> Deployment | None:
        result = await self.db.execute(
            select(Deployment).where(Deployment.id == deployment_id)
        )
        return result.scalar_one_or_none()

    async def get_by_record(self, record_id: str) -> list[Deployment]:
        result = await self.db.execute(
            select(Deployment)
            .where(Deployment.record_id == record_id)
            .order_by(Deployment.line_number)
        )
        return list(result.scalars().all())

    async def upsert(self, deployment: Deployment) -> Deployment:
        existing = await self.get_by_id(deployment.id)
        if existing:
            for col in Deployment.__table__.columns:
                if col.name != "id":
                    setattr(existing, col.name, getattr(deployment, col.name))
            await self.db.flush()
            return existing
        self.db.add(deployment)
        await self.db.flush()
        return deployment
