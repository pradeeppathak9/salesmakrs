from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "dev-secret-key-change-me"
    access_token_expire_minutes: int = 1440
    database_url: str = "postgresql+psycopg://salesmakrs:salesmakrs@localhost:5432/salesmakrs"
    cors_origins: str = "http://localhost:5173"
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
