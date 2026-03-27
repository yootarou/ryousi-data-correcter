from sqlalchemy import String, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Retrieval(Base):
    __tablename__ = "retrievals"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    deployment_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    retrieval_time: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[dict] = mapped_column(JSON, nullable=False)
    hook_count_retrieved: Mapped[int] = mapped_column(Integer, default=0)
    hook_with_catch: Mapped[int] = mapped_column(Integer, default=0)
    hook_rate: Mapped[float] = mapped_column(Float, default=0)
    dwell_time_minutes: Mapped[int] = mapped_column(Integer, default=0)
    species_catches: Mapped[list] = mapped_column(JSON, default=list)
    bycatch: Mapped[list] = mapped_column(JSON, default=list)
    memo: Mapped[str] = mapped_column(String, default="")
    sync_status: Mapped[str] = mapped_column(String, default="synced")
    created_at: Mapped[str] = mapped_column(String, nullable=False)
    updated_at: Mapped[str] = mapped_column(String, nullable=False)
