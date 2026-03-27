from sqlalchemy import String, Float, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FishingRecord(Base):
    __tablename__ = "fishing_records"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    date: Mapped[str] = mapped_column(String, nullable=False, index=True)
    vessel_name: Mapped[str] = mapped_column(String, nullable=False)
    departure: Mapped[dict] = mapped_column(JSON, nullable=False)
    return_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    sync_status: Mapped[str] = mapped_column(String, default="synced")
    created_at: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[str] = mapped_column(String, nullable=False)

    __table_args__ = (
        Index("ix_fishing_records_user_date", "user_id", "date"),
    )
