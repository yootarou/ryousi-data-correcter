from sqlalchemy.ext.asyncio import AsyncSession

from app.db.repositories.fishing_repo import FishingRepository
from app.db.repositories.deployment_repo import DeploymentRepository
from app.db.repositories.retrieval_repo import RetrievalRepository
from app.models.fishing_record import FishingRecord
from app.models.deployment import Deployment
from app.models.retrieval import Retrieval
from app.schemas.fishing import (
    FishingRecordCreate,
    DeploymentCreate,
    RetrievalCreate,
)


class FishingService:
    def __init__(self, db: AsyncSession):
        self.fishing_repo = FishingRepository(db)
        self.deployment_repo = DeploymentRepository(db)
        self.retrieval_repo = RetrievalRepository(db)

    async def create_record(self, data: FishingRecordCreate) -> FishingRecord:
        record = FishingRecord(
            id=data.id,
            user_id=data.user_id,
            date=data.date,
            vessel_name=data.vessel_name,
            departure=data.departure.model_dump(),
            return_data=data.return_data.model_dump() if data.return_data else None,
            sync_status="synced",
            created_at=data.created_at,
            updated_at=data.updated_at,
        )
        return await self.fishing_repo.upsert(record)

    async def get_records(
        self,
        user_id: str,
        date_from: str | None = None,
        date_to: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[FishingRecord]:
        return await self.fishing_repo.get_by_user(
            user_id=user_id,
            date_from=date_from,
            date_to=date_to,
            limit=limit,
            offset=offset,
        )

    async def get_record(self, record_id: str) -> FishingRecord | None:
        return await self.fishing_repo.get_by_id(record_id)

    async def create_deployment(self, data: DeploymentCreate) -> Deployment:
        deployment = Deployment(
            id=data.id,
            record_id=data.record_id,
            line_number=data.line_number,
            deployment_time=data.deployment_time,
            position=data.position.model_dump(),
            depth=data.depth,
            hook_count=data.hook_count,
            hook_interval=data.hook_interval,
            line_length=data.line_length,
            bait_type=data.bait_type,
            water_temp=data.water_temp,
            current_direction=data.current_direction,
            current_speed=data.current_speed,
            wind_direction=data.wind_direction,
            wind_speed=data.wind_speed,
            wave_height=data.wave_height,
            visibility=data.visibility,
            moon_phase=data.moon_phase,
            tide_phase=data.tide_phase,
            fish_finder_reaction=data.fish_finder_reaction,
            bird_activity=data.bird_activity,
            memo=data.memo,
            sync_status="synced",
            created_at=data.created_at,
            updated_at=data.updated_at,
        )
        return await self.deployment_repo.upsert(deployment)

    async def get_deployments(self, record_id: str) -> list[Deployment]:
        return await self.deployment_repo.get_by_record(record_id)

    async def create_retrieval(self, data: RetrievalCreate) -> Retrieval:
        retrieval = Retrieval(
            id=data.id,
            deployment_id=data.deployment_id,
            retrieval_time=data.retrieval_time,
            position=data.position.model_dump(),
            hook_count_retrieved=data.hook_count_retrieved,
            hook_with_catch=data.hook_with_catch,
            hook_rate=data.hook_rate,
            dwell_time_minutes=data.dwell_time_minutes,
            species_catches=[c.model_dump() for c in data.species_catches],
            bycatch=[b.model_dump() for b in data.bycatch],
            memo=data.memo,
            sync_status="synced",
            created_at=data.created_at,
            updated_at=data.updated_at,
        )
        return await self.retrieval_repo.upsert(retrieval)
