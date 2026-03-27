from sqlalchemy import String, Float, Integer, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    record_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    line_number: Mapped[int] = mapped_column(Integer, nullable=False)
    deployment_time: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[dict] = mapped_column(JSON, nullable=False)
    depth: Mapped[float] = mapped_column(Float, default=0)
    hook_count: Mapped[int] = mapped_column(Integer, default=0)
    hook_interval: Mapped[float] = mapped_column(Float, default=0)
    line_length: Mapped[float] = mapped_column(Float, default=0)
    bait_type: Mapped[str] = mapped_column(String, default="")
    water_temp: Mapped[float] = mapped_column(Float, default=0)
    current_direction: Mapped[str] = mapped_column(String, default="N")
    current_speed: Mapped[float] = mapped_column(Float, default=0)
    wind_direction: Mapped[str] = mapped_column(String, default="N")
    wind_speed: Mapped[float] = mapped_column(Float, default=0)
    wave_height: Mapped[float] = mapped_column(Float, default=0)
    visibility: Mapped[str] = mapped_column(String, default="")
    moon_phase: Mapped[float] = mapped_column(Float, default=0)
    tide_phase: Mapped[str] = mapped_column(String, default="")
    fish_finder_reaction: Mapped[str] = mapped_column(String, default="")
    bird_activity: Mapped[str] = mapped_column(String, default="")
    memo: Mapped[str] = mapped_column(String, default="")
    sync_status: Mapped[str] = mapped_column(String, default="synced")
    created_at: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[str] = mapped_column(String, nullable=False)

    __table_args__ = (
        Index("ix_deployments_record_line", "record_id", "line_number"),
    )
