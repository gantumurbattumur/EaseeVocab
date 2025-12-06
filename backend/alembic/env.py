from logging.config import fileConfig
import os
from dotenv import load_dotenv

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Load .env
load_dotenv()

# Alembic Config
config = context.config

# Override DB URL with .env value
config.set_main_option(
    "sqlalchemy.url",
    os.getenv("DATABASE_URL")
)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import models and Base
from app.models.base import Base
import app.models.user
import app.models.vocabulary
import app.models.mnemonic
import app.models.user_word_history
import app.models.crossword
import app.models.crossword_attempts

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""

    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
