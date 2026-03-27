from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fishing_record import FishingRecord


class FishingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, record: FishingRecord) -> FishingRecord:
        self.db.add(record)
        await self.db.flush()
        return record

    async def get_by_id(self, record_id: str) -> FishingRecord | None:
        result = await self.db.execute(
            select(FishingRecord).where(FishingRecord.id == record_id)
        )
        return result.scalar_one_or_none()

    async def get_by_user(
        self,
        user_id: str,
        date_from: str | None = None,
        date_to: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[FishingRecord]:
        query = (
            select(FishingRecord)
            .where(FishingRecord.user_id == user_id)
            .order_by(FishingRecord.date.desc())
        )
        if date_from:
            query = query.where(FishingRecord.date >= date_from)
        if date_to:
            query = query.where(FishingRecord.date <= date_to)

        query = query.limit(limit).offset(offset)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, record_id: str, data: dict) -> FishingRecord | None:
        record = await self.get_by_id(record_id)
        if not record:
            return None
        for key, value in data.items():
            setattr(record, key, value)
        await self.db.flush()
        return record

    async def upsert(self, record: FishingRecord) -> FishingRecord:
        existing = await self.get_by_id(record.id)
        if existing:
            for key in ["user_id", "date", "vessel_name", "departure", "return_data", "sync_status", "updated_at"]:
                setattr(existing, key, getattr(record, key))
            await self.db.flush()
            return existing
        self.db.add(record)
        await self.db.flush()
        return record
