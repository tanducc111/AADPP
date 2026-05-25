from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db.session import create_database_session


def get_db_session() -> Generator[Session, None, None]:
    database_session = create_database_session()

    try:
        yield database_session
    finally:
        database_session.close()
