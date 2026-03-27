from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Smart Fishing API"
    version: str = "0.1.0"
    debug: bool = True

    database_url: str = "sqlite+aiosqlite:///./fishing_app.db"
    secret_key: str = "dev-secret-key-change-in-production"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
