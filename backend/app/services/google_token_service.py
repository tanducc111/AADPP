from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.core.config import get_settings
from app.core.exceptions import GoogleAuthenticationError
from app.schemas.auth import GoogleTokenClaims


def verify_google_id_token(id_token: str) -> GoogleTokenClaims:
    settings = get_settings()

    try:
        token_claims = google_id_token.verify_oauth2_token(
            id_token,
            google_requests.Request(),
            settings.google_client_id,
        )
    except ValueError as token_error:
        raise GoogleAuthenticationError() from token_error

    email = token_claims.get("email")
    google_id = token_claims.get("sub")
    email_verified = bool(token_claims.get("email_verified"))

    if not google_id or not email:
        raise GoogleAuthenticationError("Google token is missing required identity claims.")

    if not email_verified:
        raise GoogleAuthenticationError("Google account email must be verified.")

    return GoogleTokenClaims(
        google_id=google_id,
        email=email,
        email_verified=email_verified,
        full_name=token_claims.get("name") or email,
        avatar_url=token_claims.get("picture"),
    )
