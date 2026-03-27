from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.response import SyncUploadResponse, SyncFetchResponse
from app.services.sync_service import SyncService

router = APIRouter(prefix="/sync", tags=["sync"])


class SyncUploadRequest(BaseModel):
    type: str
    payload: dict


def get_service(db: AsyncSession = Depends(get_db)) -> SyncService:
    return SyncService(db)


@router.post("/upload", response_model=SyncUploadResponse)
async def upload(
    request: SyncUploadRequest,
    service: SyncService = Depends(get_service),
):
    """クライアントからのデータ同期アップロード"""
    try:
        record_id = await service.upload(request.type, request.payload)
        return SyncUploadResponse(
            success=True,
            message=f"Successfully synced {request.type}",
            id=record_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/latest", response_model=SyncFetchResponse)
async def fetch_latest(
    since: str = Query(...),
    user_id: str = Query("default-user"),
    service: SyncService = Depends(get_service),
):
    """指定時刻以降の更新データを取得"""
    try:
        result = await service.fetch_latest(user_id=user_id, since=since)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
