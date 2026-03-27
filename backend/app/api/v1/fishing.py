from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.fishing import (
    FishingRecordCreate,
    FishingRecordResponse,
    DeploymentCreate,
    DeploymentResponse,
    RetrievalCreate,
    RetrievalResponse,
)
from app.services.fishing_service import FishingService

router = APIRouter(prefix="/fishing", tags=["fishing"])


def get_service(db: AsyncSession = Depends(get_db)) -> FishingService:
    return FishingService(db)


@router.post("/records", response_model=FishingRecordResponse)
async def create_record(
    record: FishingRecordCreate,
    service: FishingService = Depends(get_service),
):
    """新しい漁業記録を作成"""
    try:
        result = await service.create_record(record)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/records", response_model=list[FishingRecordResponse])
async def get_records(
    user_id: str = Query(...),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    service: FishingService = Depends(get_service),
):
    """漁業記録一覧を取得"""
    return await service.get_records(
        user_id=user_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit,
        offset=offset,
    )


@router.get("/records/{record_id}", response_model=FishingRecordResponse)
async def get_record(
    record_id: str,
    service: FishingService = Depends(get_service),
):
    """漁業記録を取得"""
    result = await service.get_record(record_id)
    if not result:
        raise HTTPException(status_code=404, detail="Record not found")
    return result


@router.post("/deployments", response_model=DeploymentResponse)
async def create_deployment(
    deployment: DeploymentCreate,
    service: FishingService = Depends(get_service),
):
    """投縄記録を作成"""
    try:
        result = await service.create_deployment(deployment)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/records/{record_id}/deployments", response_model=list[DeploymentResponse])
async def get_deployments(
    record_id: str,
    service: FishingService = Depends(get_service),
):
    """投縄記録一覧を取得"""
    return await service.get_deployments(record_id)


@router.post("/retrievals", response_model=RetrievalResponse)
async def create_retrieval(
    retrieval: RetrievalCreate,
    service: FishingService = Depends(get_service),
):
    """揚縄記録を作成"""
    try:
        result = await service.create_retrieval(retrieval)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
