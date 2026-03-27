import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


SAMPLE_RECORD = {
    "id": "test-001",
    "user_id": "default-user",
    "date": "2026-03-27",
    "vessel_name": "第一漁丸",
    "departure": {
        "fishing_start_time": "05:00",
        "crew": ["田中"],
        "target_species": ["マグロ"],
        "vessel_name": "第一漁丸",
        "departure_port": "焼津港",
        "target_area": "駿河湾",
        "hook_count": 100,
        "line_count": 5,
        "bait_type": ["イカ"],
        "moon_phase": 0.5,
        "weather": "晴れ",
        "fuel_cost": 5000,
    },
    "sync_status": "synced",
    "created_at": "2026-03-27T05:00:00Z",
    "updated_at": "2026-03-27T05:00:00Z",
}


async def test_health(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


async def test_create_record(client: AsyncClient):
    response = await client.post("/api/v1/fishing/records", json=SAMPLE_RECORD)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-001"
    assert data["vessel_name"] == "第一漁丸"


async def test_get_records(client: AsyncClient):
    # Create first
    await client.post("/api/v1/fishing/records", json=SAMPLE_RECORD)
    # Fetch
    response = await client.get("/api/v1/fishing/records", params={"user_id": "default-user"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "test-001"


async def test_get_record_by_id(client: AsyncClient):
    await client.post("/api/v1/fishing/records", json=SAMPLE_RECORD)
    response = await client.get("/api/v1/fishing/records/test-001")
    assert response.status_code == 200
    assert response.json()["id"] == "test-001"


async def test_get_record_not_found(client: AsyncClient):
    response = await client.get("/api/v1/fishing/records/nonexistent")
    assert response.status_code == 404


async def test_sync_upload(client: AsyncClient):
    response = await client.post(
        "/api/v1/sync/upload",
        json={"type": "fishing_record", "payload": SAMPLE_RECORD},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["id"] == "test-001"


async def test_sync_upload_invalid_type(client: AsyncClient):
    response = await client.post(
        "/api/v1/sync/upload",
        json={"type": "invalid", "payload": {}},
    )
    assert response.status_code in (400, 500)


async def test_sync_fetch_latest(client: AsyncClient):
    await client.post("/api/v1/fishing/records", json=SAMPLE_RECORD)
    response = await client.get(
        "/api/v1/sync/latest",
        params={"since": "1970-01-01T00:00:00Z", "user_id": "default-user"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["records"]) == 1
    assert "synced_at" in data


async def test_upsert_record(client: AsyncClient):
    # Create
    await client.post("/api/v1/fishing/records", json=SAMPLE_RECORD)
    # Upsert with updated vessel name
    updated = {**SAMPLE_RECORD, "vessel_name": "第二漁丸"}
    response = await client.post("/api/v1/fishing/records", json=updated)
    assert response.status_code == 200
    assert response.json()["vessel_name"] == "第二漁丸"
    # Verify only 1 record exists
    response = await client.get("/api/v1/fishing/records", params={"user_id": "default-user"})
    assert len(response.json()) == 1
