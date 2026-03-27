from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class DepartureData(BaseModel):
    fishing_start_time: str
    crew: list[str]
    target_species: list[str]
    vessel_name: str
    departure_port: str
    target_area: str
    hook_count: int = 0
    line_count: int = 0
    bait_type: list[str]
    moon_phase: float = 0
    weather: str = ""
    fuel_cost: float = 0


class ReturnData(BaseModel):
    fishing_end_time: str
    return_port: str
    total_catch_kg: float = 0
    total_revenue: float = 0
    fuel_used: float = 0
    ice_cost: float = 0
    bait_cost: float = 0
    other_cost: float = 0
    memo: str = ""
    trouble: str = ""


class Coordinates(BaseModel):
    latitude: float
    longitude: float


class SizeDistribution(BaseModel):
    small: int = 0
    medium: int = 0
    large: int = 0
    extra_large: int = 0


class SpeciesCatch(BaseModel):
    species: str
    count: int
    weight_kg: float = 0
    size_distribution: SizeDistribution = SizeDistribution()


class BycatchEntry(BaseModel):
    species: str
    count: int
    action: Literal["released", "kept", "discarded"]


# --- Request schemas ---


class FishingRecordCreate(BaseModel):
    id: str
    user_id: str
    date: str
    vessel_name: str
    departure: DepartureData
    return_data: ReturnData | None = None
    sync_status: str = "synced"
    created_at: str
    updated_at: str


class DeploymentCreate(BaseModel):
    id: str
    record_id: str
    line_number: int
    deployment_time: str
    position: Coordinates
    depth: float = 0
    hook_count: int = 0
    hook_interval: float = 0
    line_length: float = 0
    bait_type: str = ""
    water_temp: float = 0
    current_direction: str = "N"
    current_speed: float = 0
    wind_direction: str = "N"
    wind_speed: float = 0
    wave_height: float = 0
    visibility: str = ""
    moon_phase: float = 0
    tide_phase: str = ""
    fish_finder_reaction: str = ""
    bird_activity: str = ""
    memo: str = ""
    sync_status: str = "synced"
    created_at: str
    updated_at: str


class RetrievalCreate(BaseModel):
    id: str
    deployment_id: str
    retrieval_time: str
    position: Coordinates
    hook_count_retrieved: int = 0
    hook_with_catch: int = 0
    hook_rate: float = 0
    dwell_time_minutes: int = 0
    species_catches: list[SpeciesCatch] = []
    bycatch: list[BycatchEntry] = []
    memo: str = ""
    sync_status: str = "synced"
    created_at: str
    updated_at: str


# --- Response schemas ---


class FishingRecordResponse(BaseModel):
    id: str
    user_id: str
    date: str
    vessel_name: str
    departure: DepartureData
    return_data: ReturnData | None = None
    sync_status: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class DeploymentResponse(BaseModel):
    id: str
    record_id: str
    line_number: int
    deployment_time: str
    position: Coordinates
    depth: float
    hook_count: int
    bait_type: str
    water_temp: float
    memo: str
    sync_status: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


class RetrievalResponse(BaseModel):
    id: str
    deployment_id: str
    retrieval_time: str
    position: Coordinates
    hook_count_retrieved: int
    hook_with_catch: int
    hook_rate: float
    dwell_time_minutes: int
    species_catches: list[SpeciesCatch]
    bycatch: list[BycatchEntry]
    memo: str
    sync_status: str
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}
