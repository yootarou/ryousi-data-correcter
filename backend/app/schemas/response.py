from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class SyncUploadResponse(BaseModel):
    success: bool
    message: str
    id: str


from app.schemas.fishing import FishingRecordResponse, DeploymentResponse, RetrievalResponse


class SyncFetchResponse(BaseModel):
    records: list[FishingRecordResponse]
    deployments: list[DeploymentResponse]
    retrievals: list[RetrievalResponse]
    synced_at: str
