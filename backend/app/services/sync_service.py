from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.fishing_service import FishingService
from app.schemas.fishing import FishingRecordCreate, DeploymentCreate, RetrievalCreate


class SyncService:
    def __init__(self, db: AsyncSession):
        self.fishing_service = FishingService(db)

    async def upload(self, sync_type: str, payload: dict) -> str:
        """Process an upload from the client's sync queue."""
        if sync_type == "fishing_record":
            data = FishingRecordCreate(**payload)
            record = await self.fishing_service.create_record(data)
            return record.id

        elif sync_type == "deployment":
            data = DeploymentCreate(**payload)
            deployment = await self.fishing_service.create_deployment(data)
            return deployment.id

        elif sync_type == "retrieval":
            data = RetrievalCreate(**payload)
            retrieval = await self.fishing_service.create_retrieval(data)
            return retrieval.id

        else:
            raise ValueError(f"Unknown sync type: {sync_type}")

    async def fetch_latest(
        self,
        user_id: str,
        since: str,
    ) -> dict:
        """Fetch records updated since the given timestamp."""
        records = await self.fishing_service.get_records(
            user_id=user_id,
            limit=100,
        )

        # Filter by updated_at > since
        filtered_records = [
            r for r in records if r.updated_at > since
        ]

        return {
            "records": filtered_records,
            "deployments": [],
            "retrievals": [],
            "synced_at": datetime.now().isoformat(),
        }
